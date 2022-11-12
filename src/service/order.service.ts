import { AddOrderDinnerDto, UpdateOrderMetaDto } from "@/model/dto/order.dto";
import { DinnerOption, Order, OrderDinner, OrderState } from "@/model/entity";
import { ListParams } from "@/model/list.params";
import { ListResult, ListResultPromise } from "@/model/list.result";
import { OrderParams } from "@/model/order.params";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { isPhoneNumber, isString } from "class-validator";
import { DataSource, DeleteResult, FindOptionsOrder, Not, Repository, UpdateResult } from "typeorm";
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

    public async getOrdersBy(query: { userId?: string, orderState?: OrderState },
        listParams: ListParams, orderParams?: OrderParams
    ): ListResultPromise<Order> {
        const qb = this.orderRepo.createQueryBuilder()
            .select();

        if (query.userId) qb.andWhere({ userId: query.userId });
        if (query.orderState) qb.andWhere({ orderState: query.orderState });

        if (orderParams) orderParams.adaptTo(qb);
        listParams.adaptTo(qb);

        const [items, count] = await qb.getManyAndCount();

        return new ListResult(listParams, count, items);
    }

    public async getOrCreateCart(userId: string, withItems?: boolean): Promise<[number, Order]> {
        const order = await this.getCart(userId, withItems);

        if (order)
            return [1, order];
        else
            return [2, await this.createEmptyCart(userId)];
    }

    private async getCart(userId: string, withItems?: boolean): Promise<Order> {
        const order = await this.orderRepo.findOne({
            relations: {
                orderDinners: withItems ? { dinnerOptions: true } : false
            },
            where: {
                userId,
                orderState: OrderState.CART,
            },
        });

        if (order.orderDinners) {
            return this.applyPriceOrder(order);
        } else {
            return order;
        }
    }

    private async createEmptyCart(userId: string): Promise<any> {
        return await this.orderRepo.save(<Order>{
            userId,
            orderState: OrderState.CART,
            orderDinners: [],
        });
    }

    public async getAllOrders(): Promise<any> {
        return await this.orderRepo
            .createQueryBuilder()
            .select()
            .execute();
    }

    public async addToOrder(orderId: number, item: AddOrderDinnerDto) {
        const dinner = await this.menuService.getDinnerById(item.dinnerId);
        const style = await this.menuService.getStyleById(item.styleId);

        const order = await this.orderRepo.findOne({
            where: { orderId },
            relations: { orderDinners: true }
        });

        if (!dinner || !style || !order) throw new NotFoundException();

        /*const orderDinnerOptions: DinnerOption[] = item.dinner.dinnerOptionIds.map<DinnerOption>(
            async (dinnerOptionId) => await this.menuService.getDinnerOption(dinnerOptionId)
        );*/

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

    public async getOrderDinner(orderId: number, orderDinnerId: number) {
        return this.orderDinnerRepo.findOne({
            where: { orderId, orderDinnerId }
        });
    }

    public async updateOrderMeta(orderId: number, dto: UpdateOrderMetaDto): Promise<UpdateResult> {
        const order: any = { ...dto };

        //if (dto.rsvDate) order.rsvDate = dto.rsvDate;
        //if (dto.deliveryAddress) order.deliveryAddress = dto.deliveryAddress;
        //if (dto.phoneNumber) order.phoneNumber = dto.phoneNumber;
        //if (dto.cardNumber) order.cardNumber = dto.cardNumber;
        //if (dto.request) order.request = dto.request;

        return await this.orderRepo
            .createQueryBuilder()
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

    public async newOrderFromCart(userId: string) {
        /*const result = await this.orderRepo
            .createQueryBuilder()
            .update()
            .set({
                orderState: OrderState.WAITING,
            })
            .where({ userId, orderState: OrderState.CART })
            .execute();*/
        const [, order] = await this.getOrCreateCart(userId, true);

        /* 주문 가능한지 검사 */
        if (!order) throw new NotFoundException();
        if (!this.isOrderable(order)) throw new BadRequestException();
        order.orderState = OrderState.WAITING;
        order.orderDate = new Date();

        await this.applyPriceOrder(order)

        /* TODO: 실시간 알림 기능 추가 */

        return await this.orderRepo.save(order);
    }

    private isOrderable(order: Order): boolean {
        if (
            order.orderId &&
            order.userId &&
            order.rsvDate && order.rsvDate.getTime() > (new Date()).getTime() &&
            order.deliveryAddress &&
            isPhoneNumber(order.phoneNumber, 'KR') &&
            isString(order.cardNumber)
        )
            return true;
        else
            return false;
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

    public async updateOrderDinner(orderId: number, orderDinnerId: number, dto: Partial<AddOrderDinnerDto>) {
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

        await this.dataSource
            .createQueryBuilder()
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

    public async applyPriceOrder(order: Order): Promise<Order> {
        let price = 0;

        console.log(order.orderDinners);

        for (let orderDinner of order.orderDinners) {
            orderDinner = await this.applyPriceOrderDinner(orderDinner);
            price += orderDinner.totalDinnerPrice;
        }

        order.totalPrice = price;

        return this.orderRepo.save(order);
    }

    private async applyPriceOrderDinner(orderDinner: OrderDinner): Promise<OrderDinner> {
        let price = 0;

        const dinner = await this.menuService.getDinnerById(orderDinner.dinnerId);
        price += dinner.dinnerPrice;

        const style = await this.menuService.getStyleById(orderDinner.styleId);
        price += style.stylePrice;

        if (orderDinner.dinnerOptions && orderDinner.dinnerOptions.length > 0) {
            orderDinner.dinnerOptions.forEach(option => {
                price += option.dinnerOptionPrice;
            });
        }

        orderDinner.totalDinnerPrice = price;

        return this.orderRepo.save(orderDinner);
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