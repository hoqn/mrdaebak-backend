import AppConfig from "@/config";

import { StaffAlarmEventGateway } from "@/gateway/staff.gateway";
import { PageOptionsDto, PageResultDto, PageResultPromise } from "@/model/dto/common.dto";
import { CreateOrderDinnerDto, UpdateOrderDinnerDto, UpdateOrderMetaDto } from "@/model/dto/order.dto";
import { DinnerOption, Ingredient, Order, OrderDinner, User } from "@/model/entity";
import { OrderDinnerOption } from "@/model/entity/OrderDinnerOption";
import { OrderState, UserGrade } from "@/model/enum";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { isDate, isNotEmpty, isNumberString, isPhoneNumber, isString } from "class-validator";
import * as moment from "moment";
import { Between, DataSource, DeleteResult, FindOperator, FindOptionsOrder, FindOptionsWhere, Not, QueryBuilder, Repository, UpdateQueryBuilder, UpdateResult } from "typeorm";
import { IngredientService } from "./ingredient.service";
import { MenuService } from "./menu.service";
import { UserService } from "./user.service";

@Injectable()
export class OrderService {

    constructor(
        @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
        @InjectRepository(OrderDinner) private readonly orderDinnerRepo: Repository<OrderDinner>,
        @InjectRepository(DinnerOption) private readonly dinnerOptionRepo: Repository<DinnerOption>,
        @InjectDataSource() private readonly dataSource: DataSource,
        private readonly menuService: MenuService,
        private readonly userService: UserService,
        private readonly ingredientService: IngredientService,
        private readonly staffAlarm: StaffAlarmEventGateway,
    ) { }

    /**
     * Order
     */

    public async getOrderCounts() {
        const qb = this.orderRepo.createQueryBuilder('o')
            .select('o.order_state, COUNT(o.order_id) as amount')
            .where({ orderState: Not(OrderState.CART) })
            .groupBy('o.order_state');
        return await qb.execute();
    }

    public async getAllOrders(pageOptions: PageOptionsDto) {
        return this.getOrdersBy({}, pageOptions);
    }

    public async getOrdersBy(
        query: { userId?: string, orderState?: OrderState, rsvDate?: FindOperator<any> },
        pageOptions?: PageOptionsDto
    ) {
        const qb = this.orderRepo.createQueryBuilder()
            .select();

        qb.andWhere({ orderState: Not(OrderState.CART) });

        if (query.userId !== undefined) qb.andWhere({ userId: query.userId });
        if (query.orderState !== undefined) qb.andWhere({ orderState: query.orderState });
        if (query.rsvDate !== undefined) qb.andWhere({ rsvDate: query.rsvDate });

        if (pageOptions) {
            if (pageOptions.orderable) qb.orderBy(pageOptions.order_by, pageOptions.order_direction);
            qb.skip(pageOptions.skip).take(pageOptions.take);
        }

        const [pure_items, count] = await qb.getManyAndCount();

        const items = [];
        for (let va of pure_items) {
            items.push({
                ...va, orderDinnerCount:
                    await this.orderDinnerRepo.countBy({ orderId: va.orderId }),
            });
        }

        // CART가 아닌 실제 주문이므로, 가격을 다시 계산할 필요는 없음.

        console.log(qb.getQuery(), '\n\n', pageOptions);

        return new PageResultDto(pageOptions, count, items);
    }

    public async getOrder(orderId: number, widen: boolean = false) {
        return this.orderRepo.findOne({
            relations: {
                orderDinners: widen ? {
                    orderDinnerOptions: true
                } : false,
            },
            where: { orderId, orderState: Not(OrderState.CART) },
        });
    }

    public async updateOrder(orderId: number, dto: UpdateOrderMetaDto) {

        const order = await this.orderRepo.findOneBy({ orderId });

        console.log('Update Order', orderId);

        if (order.orderState !== OrderState.CART) {
            if (dto.rsvDate !== undefined) {
                const rsvDate = order.rsvDate;
                const newRsvDate = new Date(dto.rsvDate);

                const ingredients = await this.ingredientService.calculateIngredientStockForOrder(orderId);

                for (let [ingredientId, amount] of ingredients) {
                    await this.ingredientService.setRsvAmount(ingredientId, -amount, 'add', rsvDate);
                    await this.ingredientService.setRsvAmount(ingredientId, amount, 'add', newRsvDate);
                }
            }
        }

        return this.orderRepo.update(
            { orderId },
            { ...dto },
        );
    }

    public async setOrderState(orderId: number, state: OrderState) {
        const result = await this.orderRepo.update(
            { orderId },
            { orderState: state },
        );

        if (result.affected > 0) {

            const { rsvDate } = await this.orderRepo.findOne({
                select: ['rsvDate'], where: { orderId }
            });

            /*if (state === OrderState.HOLD) {
                await this.ingredientService.calculateIngredientStockForOrder(orderId)
                    .then(async (ingredientMap) => {
                        for (let [key, value] of ingredientMap) {
                            await Promise.all([
                                this.ingredientService.setRsvAmount(key, value, 'add', rsvDate),
                            ]);
                        }
                    });
            }*/

            if (state === OrderState.DONE) {
                // 완료됨 -> 재료에 반영
                await this.ingredientService.calculateIngredientStockForOrder(orderId)
                    .then(async (ingredientMap) => {
                        for (let [key, value] of ingredientMap) {
                            await this.ingredientService.moveRsvToOutAmount(key, value, rsvDate);
                        }
                    });
            }
        }

        return result;
    }

    /**
     * ORDERDINNER
     */

    public async getOrderDinner(orderDinnerId: number, orderId?: number) {
        return this.orderDinnerRepo.findOne({
            relations: { orderDinnerOptions: true },
            where: { orderDinnerId, orderId },
        });
    }

    public async addOrderDinner(orderId: number, dto: CreateOrderDinnerDto) {
        const orderDinner = <OrderDinner>{
            orderId,
            dinnerId: dto.dinnerId,
            styleId: dto.styleId,
            degreeId: dto.degreeId,
            dinnerAmount: dto.dinnerAmount,
            orderDinnerOptions: [],
        };

        for (let option of dto.dinnerOptionIds) {
            if (option.amount < 1) continue;
            orderDinner.orderDinnerOptions.push(<OrderDinnerOption>{
                dinnerOptionId: option.id,
                amount: option.amount,
            });
        }

        const result = await this.orderDinnerRepo.save(orderDinner);

        await this.updatePriceOfOrder(orderDinner.orderId);

        return await this.orderDinnerRepo.findOneBy({ orderDinnerId: result.orderDinnerId })
    }

    public async updateOrderDinner(orderDinnerId: number, dto: UpdateOrderDinnerDto) {
        const orderDinner = await this.orderDinnerRepo.findOne({
            relations: { orderDinnerOptions: true },
            where: { orderDinnerId },
        });

        const order = await this.orderRepo.findOneBy({ orderId: orderDinner.orderId });

        //원래의 재료
        const oldIngredients = await this.ingredientService.calculateIngredientStockForOrderDinner(orderDinnerId);

        if (dto.dinnerId !== undefined) orderDinner.dinnerId = dto.dinnerId;
        if (dto.styleId !== undefined) orderDinner.styleId = dto.styleId;
        if (dto.degreeId !== undefined) orderDinner.degreeId = dto.degreeId;
        if (dto.dinnerAmount !== undefined) orderDinner.dinnerAmount = dto.dinnerAmount;
        if (dto.dinnerOptionIds !== undefined)
            orderDinner.orderDinnerOptions = dto.dinnerOptionIds.map(ent => {
                const option = new OrderDinnerOption();
                option.orderDinnerId = orderDinnerId;
                option.dinnerOptionId = ent.id;
                option.amount = ent.amount;
                console.log(option);
                return option;
            });

        const result = await this.orderDinnerRepo.save(orderDinner);

        await this.updatePriceOfOrder(orderDinner.orderId);

        if (order.orderState !== OrderState.CART) {

            //새로 필요한 재료
            const newIngredients = await this.ingredientService.calculateIngredientStockForOrderDinner(orderDinnerId);

            //원래의 재료를 RsvAmount에서 제외하고, 새로 필요한 재료로 업데이트
            const rsvDate = order.rsvDate;
            const ingredientAmountDiffers: Map<number, number> = new Map();
            const ingredients = await this.dataSource.getRepository(Ingredient).find({ select: ['ingredientId'] });
            for (let { ingredientId } of ingredients) {
                const oldAmount = oldIngredients.get(ingredientId) ?? 0;
                const newAmount = newIngredients.get(ingredientId) ?? 0;
                const differ = newAmount - oldAmount;
                if (differ !== 0) ingredientAmountDiffers.set(ingredientId, differ);
            }
            for (let [key, value] of ingredientAmountDiffers) {
                await this.ingredientService.setRsvAmount(key, value, 'add', rsvDate);
            }
            // ==
        }

        return await this.orderDinnerRepo.findOneBy({ orderDinnerId: result.orderDinnerId });
    }

    public async deleteOrderDinner(orderDinnerId: number) {
        const orderDinner = await this.dataSource.getRepository(OrderDinner)
            .findOneBy({ orderDinnerId });

        const order = await this.orderRepo.findOneBy({ orderId: orderDinner.orderId });

        // 원래의 재료
        const oldIngredients = await this.ingredientService.calculateIngredientStockForOrderDinner(orderDinnerId);

        if (!orderDinner) throw new NotFoundException();

        await this.dataSource.getRepository(OrderDinnerOption)
            .delete({ orderDinnerId });

        const result = await this.dataSource.getRepository(OrderDinner)
            .delete({ orderDinnerId });

        await this.updatePriceOfOrder(orderDinner.orderId);

        if (order.orderState !== OrderState.CART) {
            //원래의 재료를 RsvAmount에서 제외
            const rsvDate = order.rsvDate;
            for (let [ingredientId, amount] of oldIngredients) {
                await this.ingredientService.setRsvAmount(ingredientId, -amount, 'add', rsvDate);
            }
            // ==   
        }

        return result;
    }

    public async copyOrderDinners(fromOrderId: number, toOrderId: number) {

        const orderDinners = await this.orderDinnerRepo.findBy({ orderId: fromOrderId });

        for (let orderDinner of orderDinners) {
            const options = await this.dataSource.getRepository(OrderDinnerOption)
                .findBy({ orderDinnerId: orderDinner.orderDinnerId });

            orderDinner.orderId = toOrderId;
            orderDinner.orderDinnerId = undefined;
            const { orderDinnerId } = await this.orderDinnerRepo.save(orderDinner);

            let promises: Promise<any>[] = [];
            options.forEach(option => {
                option.orderDinnerId = orderDinnerId;
                promises.push(
                    this.dataSource.getRepository(OrderDinnerOption).save(option)
                );
            });

            await Promise.all(promises);
        }

        return await this.getOrder(toOrderId, true);
    }

    /**
     * CART -> ORDER
     */

    public async newOrderFromCart(userId: string) {
        console.log('Order UserId', userId);

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
            orderState: rsvDate.isBefore(today) ? OrderState.WAITING : OrderState.HOLD,
        }).execute();

        // 예약 재료량 업데이트 (비동기)
        this.ingredientService.calculateIngredientStockForOrder(cart.orderId)
            .then((ings) => {
                for (let [key, value] of ings)
                    this.ingredientService.setRsvAmount(Number(key), value, 'add', cart.rsvDate);
            });


        // (단골 할인보다 후순위로 -> '이번 주문'으로 단골 여부가 달라질 수 있기 때문)
        const becomeVip = (await this.userService.incrementOrderCount(cart.userId, 1)).becomeVip;

        // 실시간 알림 -> 직원
        (async () => {
            if (result && result.affected > 0) {
                // 실시간 알림 보냄
                const order = await this.getOrder(cart.orderId, true);
                this.staffAlarm.notifyNewOrder(order);
            }
        })();

        return { ...await this.getOrder(cart.orderId, true), becomeVip: becomeVip };
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
        if (!userId) return null;

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

    private async updatePriceOfOrder(orderId: number, updateOrderDinner: boolean = true) {
        const order = await this.orderRepo.findOne({
            relations: { orderDinners: { orderDinnerOptions: true }, user: true },
            where: { orderId },
        });

        let price: number = 0;

        for (let od of order.orderDinners)
            await this.getPriceOfOrderDinner(od, updateOrderDinner)
                .then(pr => {
                    od.totalDinnerPrice = pr;
                    price += pr;
                });

        const discount = order.user.grade === UserGrade.VIP ? AppConfig.user.discountForVip : 0;

        order.totalPrice = price;
        order.paymentPrice = Math.max(0, price - discount);

        order.user = undefined;

        return await this.orderRepo.save(order);
    }

    /**
     * OrderDinner의 가격을 계산 (주의! 계산만 할 뿐, DB와 엔티티에 적용하지 않는다.)
     * @param orderDinner 
     * @returns 해당 OrderDinner의 가격
     */
    private async getPriceOfOrderDinner(orderDinner: OrderDinner | number, updateToDb: boolean = true): Promise<number> {
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

        price *= od.dinnerAmount;

        await this.orderDinnerRepo.update({ orderDinnerId: od.orderDinnerId }, { totalDinnerPrice: price });

        return price;
    }
}