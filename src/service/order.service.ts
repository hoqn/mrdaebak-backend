import { CONFIG } from "@/config";
import { StaffAlarmEventGateway } from "@/gateway/staff.gateway";
import { PageOptionsDto, PageResultDto, PageResultPromise } from "@/model/dto/common.dto";
import { CreateOrderDinnerDto, UpdateOrderDinnerDto, UpdateOrderMetaDto } from "@/model/dto/order.dto";
import { DinnerOption, Order, OrderDinner, User } from "@/model/entity";
import { OrderDinnerOption } from "@/model/entity/OrderDinnerOption";
import { OrderState, UserGrade } from "@/model/enum";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { isDate, isNotEmpty, isNumberString, isPhoneNumber, isString } from "class-validator";
import * as moment from "moment";
import { DataSource, DeleteResult, FindOptionsOrder, Not, QueryBuilder, Repository, UpdateQueryBuilder, UpdateResult } from "typeorm";
import { IngredientService } from "./ingredient.service";
import { MenuService } from "./menu.service";
import { UserService } from "./user.service";

const DISCOUNT_VIP = 10000;

@Injectable()
export class OrderService {
    constructor(
        private readonly menuService: MenuService,
        private readonly userService: UserService,
        private readonly ingredientService: IngredientService,
        @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
        @InjectRepository(OrderDinner) private readonly orderDinnerRepo: Repository<OrderDinner>,
        @InjectRepository(DinnerOption) private readonly dinnerOptionRepo: Repository<DinnerOption>,
        @InjectDataSource() private readonly dataSource: DataSource,
        private readonly staffAlarm: StaffAlarmEventGateway,
    ) { }

    public async getOrderCounts(){
        const qb = this.orderRepo.createQueryBuilder('o')
            .select('o.order_state, COUNT(o.order_id) as amount')
            .where({ orderState: Not(OrderState.CART) })
            .groupBy('o.order_state');

        return await qb.execute();
    }

    /**
     * Order
     */

    public async getAllOrders(pageOptions: PageOptionsDto) {
        return this.getOrdersBy({}, pageOptions);
    }

    public async getOrdersBy(
        query: { userId?: string, orderState?: OrderState },
        pageOptions?: PageOptionsDto
    ) {
        const qb = this.orderRepo.createQueryBuilder()
            .select();

        qb.andWhere({ orderState: Not(OrderState.CART) });

        if (query.userId) qb.andWhere({ userId: query.userId });
        if (query.orderState) qb.andWhere({ orderState: query.orderState });
        
        if(pageOptions) {
            if (pageOptions.orderable) qb.orderBy(pageOptions.orderBy, pageOptions.orderDirection);
            qb.skip(pageOptions.skip).take(pageOptions.take);
        }

        const [pure_items, count] = await qb.getManyAndCount();

        const items = [];
        for(let va of pure_items) {
            items.push({...va, orderDinnerCount:
                await this.orderDinnerRepo.countBy({ orderId: va.orderId }),
            });
        } 

        // CART가 아닌 실제 주문이므로, 가격을 다시 계산할 필요는 없음.

        return new PageResultDto(pageOptions, count, items);
    }

    public async getOrderById(orderId: number, widen: boolean = false) {
        return this.orderRepo.findOne({
            relations: {
                orderDinners: widen ? {
                    orderDinnerOptions: true
                } : false,
            },
            where: { orderId, orderState: Not(OrderState.CART) },
        });
    }

    public async updateOrder(orderId: number, body: UpdateOrderMetaDto) {
        const qb = this.orderRepo.createQueryBuilder()
            .update()
            .where({ orderId });

        qb.set({
            ...body
        });

        return qb.execute();
    }

    public async setOrderState(orderId: number, state: OrderState) {
        const qb = this.orderRepo.createQueryBuilder('o')
            .update()
            .where({ orderId });

        qb.set({ orderState: state });

        return qb.execute();
    }

    /**
     * ORDERDINNER
     */

    public async getOrderDinnerById(orderDinnerId: number, orderId?: number) {
        return this.orderDinnerRepo.findOne({
            relations: { orderDinnerOptions: true }, 
            where: { orderDinnerId, orderId },
        });
    }

    public async addOrderDinner(orderId: number, dto: CreateOrderDinnerDto) {
        const orderDinner = new OrderDinner();
        orderDinner.orderId = orderId;
        orderDinner.dinnerId = dto.dinnerId;
        orderDinner.styleId = dto.styleId;
        orderDinner.degreeId = dto.degreeId;
        orderDinner.orderDinnerOptions = dto.dinnerOptionIds.map(ent => <OrderDinnerOption>{
            orderDinnerId: orderId,
            dinnerOptionId: ent.id,
            amount: ent.amount,
        });

        orderDinner.totalDinnerPrice = await this.getPriceOfOrderDinner(orderDinner);

        return this.orderDinnerRepo.save(orderDinner);
    }

    public async updateOrderDinner(orderDinnerId: number, dto: UpdateOrderDinnerDto) {
        const orderDinner = await this.orderDinnerRepo.findOne({
            relations: { orderDinnerOptions: true },
            where: { orderDinnerId },
        });

        if(dto.dinnerId !== undefined) orderDinner.dinnerId = dto.dinnerId;
        if(dto.styleId !== undefined) orderDinner.styleId = dto.styleId;
        if(dto.degreeId !== undefined) orderDinner.degreeId = dto.degreeId;
        if(dto.dinnerOptionIds !== undefined)
            orderDinner.orderDinnerOptions = dto.dinnerOptionIds.map(ent => {
                const option = new OrderDinnerOption();
                option.orderDinnerId = orderDinnerId;
                option.dinnerOptionId = ent.id;
                option.amount = ent.amount;
                return option;
            });

        orderDinner.totalDinnerPrice = await this.getPriceOfOrderDinner(orderDinner);

        return this.orderDinnerRepo.save(orderDinner);
    }

    public async deleteOrderDinner(orderDinnerId: number) {
        const orderDinner = await this.orderDinnerRepo.findOne({
            relations: { order: true },
            where: { orderDinnerId },
        });
        
        return await this.orderDinnerRepo.delete(orderDinner);
    }

    /**
     * CART -> ORDER
     */

    public async newOrderFromCart(userId: string) {
        const cart = await this.getCart(userId);

        if (!cart) throw new Error('0');
        if (!this.isOrderable(cart)) throw new Error('1');

        await this.updatePriceOfOrder(cart.orderId);

        const qb = await this.orderRepo.createQueryBuilder()
            .update().where({ orderId: cart.orderId });

        const today = moment(new Date());
        const rsvDate = moment(cart.rsvDate);

        const result = await qb.set({
            orderDate: () => 'NOW()',
            orderState: rsvDate.isBefore(today) ?  OrderState.WAITING : OrderState.HOLD,
        }).execute();

        // 재료 차감
        const ingredients_orderable = this.ingredientService.safeDecreaseIngredientStockForOrder(cart.orderId);

        // (단골 할인보다 후순위로 -> '이번 주문'으로 단골 여부가 달라질 수 있기 때문)
        const becomeVip = (await this.userService.incrementOrderCount(cart.userId, 1)).becomeVip;

        // 실시간 알림 -> 직원
        (async () => {
            if (result && result.affected > 0) {
                // 실시간 알림 보냄
                const order = await this.getOrderById(cart.orderId, true);
                this.staffAlarm.notifyNewOrder(order);
            }
        })();

        return { ...await this.getOrderById(cart.orderId, true), becomeVip: becomeVip };
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
        let order = await this.orderRepo.findOne({
            relations: {
                orderDinners: { orderDinnerOptions: true }
            },
            where: {
                userId,
                orderState: OrderState.CART,
            },
        });

        
        if (!order) return null;
        
        if (order.orderDinners)
            order = await this.updatePriceOfOrder(order.orderId);

        return order;
    }

    private async createEmptyCart(userId: string): Promise<any> {
        return await this.orderRepo.save(<Order>{
            userId,
            orderState: OrderState.CART,
            orderDinners: [],
        });
    }

    // Private Methods

    private isOrderable(order: Order): boolean {
        return (
            order &&
            isDate(order.rsvDate) &&
            isString(order.deliveryAddress) &&
            isPhoneNumber(order.phoneNumber, 'KR') &&
            isNumberString(order.cardNumber)
        );
    }

    private async updatePriceOfOrder(orderId: number) {
        const order = await this.orderRepo.findOne({
            relations: { orderDinners: { orderDinnerOptions: true }, user: true },
            where: { orderId },
        });

        let price: number = 0;

        for(let od of order.orderDinners)
            await this.getPriceOfOrderDinner(od)
                .then(pr => {
                    od.totalDinnerPrice = pr;
                    price += pr;
                });

        const discount = order.user.grade === UserGrade.VIP ? CONFIG.user.discountForVip : 0;

        order.totalPrice = price;
        order.paymentPrice = price - discount;

        order.user = undefined;

        return await this.orderRepo.save(order);
    }

    /**
     * OrderDinner의 가격을 계산 (주의! 계산만 할 뿐, DB와 엔티티에 적용하지 않는다.)
     * @param orderDinner 
     * @returns 해당 OrderDinner의 가격
     */
    private async getPriceOfOrderDinner(orderDinner: OrderDinner|number): Promise<number> {
        const od = await this.orderDinnerRepo.findOne({
            relations: {
                orderDinnerOptions: {
                    dinnerOption: true,
                },
            },
            where: { orderDinnerId: orderDinner instanceof OrderDinner ? orderDinner.orderDinnerId : orderDinner }
        });

        let price: number = 0;

        const dinner = await this.menuService.getDinnerById(od.dinnerId);
        price += dinner.dinnerPrice;

        const style = await this.menuService.getStyleById(od.styleId);
        price += style.stylePrice;

        od.orderDinnerOptions.forEach(option => {
            price += option.dinnerOption.dinnerOptionPrice * option.amount;
        });

        return price;
    }
}