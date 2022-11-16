import { StaffAlarmEventGateway } from "@/gateway/staff.gateway";
import { PageOptionsDto, PageResultDto, PageResultPromise } from "@/model/dto/common.dto";
import { CreateOrderDinnerDto, UpdateOrderDinnerDto, UpdateOrderMetaDto } from "@/model/dto/order.dto";
import { DinnerOption, Order, OrderDinner, User } from "@/model/entity";
import { OrderDinnerOption } from "@/model/entity/OrderDinnerOption";
import { OrderState, UserGrade } from "@/model/enum";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { isDate, isNumberString, isPhoneNumber, isString } from "class-validator";
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

    /**
     * Order
     */

    public async getAllOrders(pageOptions: PageOptionsDto) {
        return this.getOrdersBy({}, pageOptions);
    }

    public async getOrdersBy(
        query: { userId?: string, orderState?: OrderState },
        pageOptions?: PageOptionsDto
    ): PageResultPromise<Order> {
        const qb = this.orderRepo.createQueryBuilder()
            .select();

        qb.andWhere({ orderState: Not(OrderState.CART) });

        if (query.userId) qb.andWhere({ userId: query.userId });
        if (query.orderState) qb.andWhere({ orderState: query.orderState });

        if(pageOptions) {
            if (pageOptions.orderable) qb.orderBy(pageOptions.orderBy, pageOptions.orderDirection);
            qb.skip(pageOptions.skip).take(pageOptions.take);
        }

        const [items, count] = await qb.getManyAndCount();

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

    public async getOrderDinnerById(orderDinnerId: number) {
        return this.orderDinnerRepo.findOneBy({ orderDinnerId });
    }

    public async addOrderDinner(orderId: number, dto: CreateOrderDinnerDto) {
        return this.orderDinnerRepo.createQueryBuilder()
            .insert()
            .values({ orderId, ...dto })
            .execute();
    }

    public async updateOrderDinner(orderDinnerId: number, dto: UpdateOrderDinnerDto) {
        const qb = this.orderDinnerRepo.createQueryBuilder()
            .update()
            .where({ orderDinnerId })
            .set({ ...dto });

        return await qb.execute();
    }

    public async deleteOrderDinner(orderDinnerId: number) {
        const qb = this.orderDinnerRepo.createQueryBuilder()
            .delete()
            .where({ orderDinnerId });

        return await qb.execute();
    }

    /**
     * CART -> ORDER
     */

    public async newOrderFromCart(userId: string) {
        const cart = await this.getCart(userId);

        if (!cart) throw new Error('0');
        if (!this.isOrderable(cart)) throw new Error('1');

        const userGrade: UserGrade
            = await this.dataSource.getRepository(User).createQueryBuilder('u')
                .select(['grade']).execute();

        // 단골 고객 할인 적용
        const discount = userGrade === UserGrade.VIP ? DISCOUNT_VIP : 0;

        const qb = (await this.makeUpdatePriceOfOrder(cart, discount))
            .where({ orderId: cart.orderId });

        const result = await qb.set({
            orderDate: () => 'NOW()',
            orderState: OrderState.WAITING,
        }).execute();

        // 재료 차감
        /*for(let orderDinner of cart.orderDinners) {
            const dinnerIngredients = (await this.ingredientService.getIngredientsBy({ dinnerId: orderDinner.dinnerId })).items;
            const styleIngredients = (await this.ingredientService.getIngredientsBy({ styleId: orderDinner.styleId })).items;
            const optionIngredients = (await this.ingredientService.getIngredientById({  })) 
            for(let ingredient of dinnerIngredients) {
                this.ingredientService.decreaseStock(ingredient.ingredientId, )
            }

            const usedIng = {};
            
            for(let ingredient of dinnerIngredients) {
                if(usedIng[ingredient.ingredientId] === undefined)
                    usedIng[ingredient.ingredientId] = 0;
                usedIng[ingredient.ingredientId] += ingredient.
            }
        }*/

        // 주문 횟수 증가 (비동기로)
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

        return { orderId: cart.orderId, becomeVip: becomeVip };
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
                orderDinners: { orderDinnerOptions: true }
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

    // Private Methods

    /**
     * 주문을 진행해도 되는지 체크
     * @param order
     * @returns 주문 가능한 상태인지 (정보가 모두 주어졌는지)
     */
    private isOrderable(order: Order): boolean {
        return (
            order &&
            isDate(order.rsvDate) &&
            isString(order.deliveryAddress) &&
            isPhoneNumber(order.phoneNumber, 'KR') &&
            isNumberString(order.cardNumber)
        );
    }

    /**
     * Order의 가격 정보를 계산하고 이를 적용하는 쿼리 빌더를 반환
     * @param order 
     * @param discount 할인 받을 금액 (총액이 0 이하라면 0으로 처리한다)
     * @param cascade (기본 true) OrderDinner들의 변화도 디비에 기록할 것인지
     * @param _qb 
     * @returns 해당 쿼리들이 적용된 쿼리 빌더
     */
    private async makeUpdatePriceOfOrder(order: Order, discount: number, cascade: boolean = true, _qb?: UpdateQueryBuilder<Order>) {
        const qb = _qb ?? this.orderRepo.createQueryBuilder('o').update()
            .where({ orderId: order.orderId });

        let price: number = 0;

        for (const orderDinner of order.orderDinners) {
            const tempPrice = await this.getPriceOfOrderDinner(orderDinner);
            if (cascade) {
                await this.orderDinnerRepo.createQueryBuilder('od')
                    .update().where({ orderId: order.orderId })
                    .set({ totalDinnerPrice: tempPrice })
                    .execute()
                    .then(() => {
                        orderDinner.totalDinnerPrice = tempPrice;
                    });
            }
            price += tempPrice;
        }

        qb.set({ totalPrice: price, paymentPrice: Math.max(price - discount, 0) });
        qb.setParameter('totalPrice', price);

        return qb;
    }

    /**
     * OrderDinner의 가격을 계산 (주의! 계산만 할 뿐, DB와 엔티티에 적용하지 않는다.)
     * @param orderDinner 
     * @returns 해당 OrderDinner의 가격
     */
    private async getPriceOfOrderDinner(orderDinner: OrderDinner): Promise<number> {
        let price: number = 0;

        const dinner = await this.menuService.getDinnerById(orderDinner.dinnerId);
        price += dinner.dinnerPrice;

        const style = await this.menuService.getStyleById(orderDinner.styleId);
        price += style.stylePrice;

        orderDinner.orderDinnerOptions.forEach(option => {
            price += option.dinnerOption.dinnerOptionPrice;
        });

        return price;
    }

    private async makeUpdateIngQuantity(orderDinner: OrderDinner) {
        
    }





}