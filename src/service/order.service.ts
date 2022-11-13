import { PageOptionsDto, PageResultDto, PageResultPromise } from "@/model/dto/common.dto";
import { CreateOrderDinnerDto, UpdateOrderMetaDto } from "@/model/dto/order.dto";
import { DinnerOption, Order, OrderDinner, User } from "@/model/entity";
import { OrderState, UserGrade } from "@/model/enum";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { isDate, isNumberString, isPhoneNumber, isString } from "class-validator";
import { DataSource, DeleteResult, FindOptionsOrder, Not, QueryBuilder, Repository, UpdateQueryBuilder, UpdateResult } from "typeorm";
import { MenuService } from "./menu.service";

@Injectable()
export class OrderService {
    constructor(
        private readonly menuService: MenuService,
        @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
        @InjectRepository(OrderDinner) private readonly orderDinnerRepo: Repository<OrderDinner>,
        @InjectRepository(DinnerOption) private readonly dinnerOptionRepo: Repository<DinnerOption>,
        @InjectDataSource() private readonly dataSource: DataSource,
    ) { }

    /**
     * Order
     */

    public async getAllOrders(
        pageOptions: PageOptionsDto
    ) {
        return this.getOrdersBy({}, pageOptions);
    }

    public async getOrdersBy(
        query: { userId?: string, orderState?: OrderState },
        pageOptions: PageOptionsDto
    ): PageResultPromise<Order> {
        const qb = this.orderRepo.createQueryBuilder()
            .select();
        
        qb.andWhere({ orderState: Not(OrderState.CART) });

        if (query.userId) qb.andWhere({ userId: query.userId });
        if (query.orderState) qb.andWhere({ orderState: query.orderState });

        if (pageOptions.orderable) qb.orderBy(pageOptions.orderBy, pageOptions.orderDirection);
        qb.skip(pageOptions.skip).take(pageOptions.take);

        const [items, count] = await qb.getManyAndCount();

        // CART가 아닌 실제 주문이므로, 가격을 다시 계산할 필요는 없음.

        return new PageResultDto(pageOptions, count, items);
    }

    public async getOrderById(orderId: number) {
        return this.orderRepo.createQueryBuilder()
            .where({ orderId })
            .getOne();
    }

    public async updateOrder(orderId: number, body: UpdateOrderMetaDto) {
        const qb = this.orderRepo.createQueryBuilder()
            .update();
        
            qb.set({
                ...body
            });

            return qb.execute();
    }

    /*public async setOrderState(orderId: number, state: OrderState) {
        const qb = this.orderRepo.createQueryBuilder('o')
            .update();

        qb.set({ orderState: state });

        return qb.execute();
    }*/

    /**
     * ORDERDINNER
     */

    public async addOrderDinner(orderId: number, dto: CreateOrderDinnerDto) {
        return this.orderDinnerRepo.save({ orderId, ...dto });
    }

    /*public async updateOrderDinner(orderDinnerId: number, dto) {

    }*/

    public async deleteOrderDinner(orderDinnerId: number) {

    }

    /**
     * CART -> ORDER
     */

    public async newOrderFromCart(userId: string) {
        const cart = await this.getCart(userId);

        if(!cart) throw new Error('0');
        if(!this.isOrderable(cart)) throw new Error('1');

        const userGrade: UserGrade
            = await this.dataSource.getRepository(User).createQueryBuilder('u')
                .select(['grade']).execute();
        
        const discount = userGrade === UserGrade.VIP ? 10000 : 0;

        const qb = await this.makeUpdatePriceOfOrder(cart, discount);

        return await qb.set({ 
            orderDate: () => 'NOW()',
            orderState: OrderState.WAITING,
         }).execute();
    }

    /**
     * CART
     */

    public async getOrCreateCart(userId: string): Promise<Order> {
        const order = await this.getCart(userId);
        if (!order) return await this.createEmptyCart(userId);
        
        return order;
    }

    private async getCart(userId: string): Promise<Order> {
        const order = await this.orderRepo.findOne({
            relations: {
                orderDinners: { dinnerOptions: true }
            },
            where: {
                userId,
                orderState: OrderState.CART,
            },
        });

        if (!order) return null;

        if (order.orderDinners) {
            (await this.makeUpdatePriceOfOrder(order, 0)).execute();
        }

        return order;
    }

    private async createEmptyCart(userId: string): Promise<any> {
        return await this.orderRepo.save(<Order>{
            userId,
            orderState: OrderState.CART,
            orderDinners: [],
        });
    }
/*
    public async addToOrder(orderId: number, item: AddOrderDinnerDto) {
        const dinner = await this.menuService.getDinnerById(item.dinnerId);
        const style = await this.menuService.getStyleById(item.styleId);

        const order = await this.orderRepo.findOne({
            where: { orderId },
            relations: { orderDinners: true }
        });

        if (!dinner || !style || !order) throw new NotFoundException();

        const orderDinnerOptions: DinnerOption[] = [];

        for (let dinnerOptionId of item.dinnerOptionIds) {
            const option = await this.dinnerOptionRepo.findOneBy({ dinnerId: dinner.dinnerId, dinnerOptionId });
            if (!option) throw new BadRequestException('가능한 옵션이 아닙니다.');
            orderDinnerOptions.push(option);
        }

        const orderDinner = <OrderDinner>{
            dinnerId: dinner.dinnerId,
            styleId: style.styleId,
            degreeId: item.degreeId,
            orderId: orderId,
            dinnerOptions: orderDinnerOptions,
        };
        await this.orderDinnerRepo.save(orderDinner);

        order.orderDinners.push(orderDinner);

        return this.applyPriceOrder(order);
    }
*/
    public async getOrderDinner(orderId: number, orderDinnerId: number) {
        return this.orderDinnerRepo.findOne({
            where: { orderId, orderDinnerId }
        });
    }

    public async updateOrderMeta(orderId: number, dto: UpdateOrderMetaDto): Promise<UpdateResult> {
        const order: any = { ...dto };

        return await this.orderRepo.createQueryBuilder()
            .update()
            .set(order)
            .where({ orderId })
            .execute();
    }

    public async removeOrderDinner(orderId: number, orderDinnerId: number): Promise<DeleteResult> {
        return await this.orderDinnerRepo
            .createQueryBuilder()
            .delete()
            .where({ orderId, orderDinnerId })
            .execute();
    }

    public async setOrderState(orderId: number, orderState: OrderState) {
        const result = await this.orderRepo
            .createQueryBuilder()
            .update()
            .set({ orderState })
            .where({ orderId })
            .execute();

        if (result.affected > 0) {
            /* TODO: 실시간 알림 기능 추가 */
        }

        return result;
    }

    public async updateOrderDinner(orderId: number, orderDinnerId: number, dto: Partial<CreateOrderDinnerDto>) {
        /*await this.orderDinnerRepo
            .createQueryBuilder()
            .update()
            .set({
                degreeId: dto.degreeId,
                dinnerId: dto.dinnerId,
                styleId: dto.dinnerId,
            })
            .where({
                orderId, orderDinnerId,
            })
            .execute();*/
        const orderDinner = await this.orderDinnerRepo.findOne({
            relations: { dinnerOptions: true },
            where: { orderId, orderDinnerId },
        });

        if (!orderDinner) throw new NotFoundException();

        orderDinner.degreeId = dto.degreeId;
        orderDinner.dinnerId = dto.dinnerId;
        orderDinner.styleId = dto.styleId;

        await this.orderDinnerRepo.save(orderDinner);

        await this.dataSource.createQueryBuilder()
            .delete()
            .from('order_dinner_option')
            .where('order_id = :orderId, order_dinner_id = :orderDinnerId', {
                orderId: orderId,
                orderDinnerId: orderDinnerId,
            })
            .execute();

        const options = dto.dinnerOptionIds.map(id => <object>{
            order_id: orderId,
            order_dinner_id: orderDinnerId,
            dinner_option_id: id
        });

        await this.dataSource
            .createQueryBuilder()
            .insert()
            .into('order_dinner_option')
            .values(options)
            .execute();
    }









    private isOrderable(order: Order): boolean {
        return (
            order &&
            isDate(order.rsvDate) &&
            isString(order.deliveryAddress) &&
            isPhoneNumber(order.phoneNumber, 'KR') &&
            isNumberString(order.cardNumber)
        );
    }

    private async makeUpdatePriceOfOrder(order: Order, discount: number, cascade: boolean = true, _qb?: UpdateQueryBuilder<Order>) {
        const qb = _qb ?? this.orderRepo.createQueryBuilder('o').update();

        let price: number = 0;

        for(const orderDinner of order.orderDinners) {
            const tempPrice = await this.getPriceOfOrderDinner(orderDinner);
            if(cascade) {
                await this.orderDinnerRepo.createQueryBuilder('od')
                    .update()
                    .set({ totalDinnerPrice: tempPrice })
                    .execute()
                    .then(() => {
                        orderDinner.totalDinnerPrice = tempPrice;
                    });
            }
            price += tempPrice;
        }

        qb.set({ totalPrice: price, paymentPrice: price - discount });
        qb.setParameter('totalPrice', price);
        
        return qb;
    }

    /*private async getUpdatePriceOfOrderQueryBuilder(order: Order, _qb?: UpdateQueryBuilder<Order>): UpdateQueryBuilder<Order> {
        const qb = _qb ?? this.orderRepo.createQueryBuilder('o').update();

        let price = 0;
        const setObj= {};

        for(const orderDinner of order.orderDinners) {
            const tempPrice = await this.getPriceOfOrderDinner(orderDinner);
            price += tempPrice;
        }

        return qb;
    }*/

    private async getPriceOfOrderDinner(orderDinner: OrderDinner) {
        let price: number = 0;

        const dinner = await this.menuService.getDinnerById(orderDinner.dinnerId);
        price += dinner.dinnerPrice;

        const style = await this.menuService.getStyleById(orderDinner.styleId);
        price += style.stylePrice;

        orderDinner.dinnerOptions.forEach(option => {
            price += option.dinnerOptionPrice;
        });

        return price;
    }








}

export namespace OrderService {

    const sortingByNameMap: { [P in SortingByValue]: string } = {
        order_date: 'orderDate',
        rsv_date: 'rsvDate',
    };

    declare type SortingByValue = 'order_date' | 'rsv_date';
    declare type SortingToValue = 'asc' | 'desc';

    export interface SortingOptions {
        sortBy: SortingByValue;
        sortTo: SortingToValue;
    }

    export function makeFindOptionsOrder(sorting: SortingOptions): FindOptionsOrder<Order> {
        const sortingName = sortingByNameMap[sorting.sortBy] ?? 'orderDate';
        const direction = sorting.sortTo;

        return <FindOptionsOrder<Order>>{
            [sortingName]: { direction }
        };
    }
}