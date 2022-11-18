import { PageOptionsDto } from "@/model/dto/common.dto";
import { UpdateOrderDinnerDto } from "@/model/dto/order.dto";
import { OrderState } from "@/model/enum";
import { OrderService } from "@/service/order.service";
import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, InternalServerErrorException, NotFoundException, Param, Patch, Post, Put, Query } from "@nestjs/common";

@Controller('orders')
export class OrderController {
    constructor(
        private readonly orderService: OrderService
    ) { }

    @Get()
    async getOrders(
        @Query('user_id') userId?: string,
        @Query('state') orderState?: keyof typeof OrderState,
        @Query('only_count') onlyCount?: boolean,
        @Query() pageOptions?: PageOptionsDto,
    ) {
        if(onlyCount) {
            return await this.orderService.getOrderCounts();
        }

        const mOrderState = orderState ? OrderState[orderState.toUpperCase()] : undefined;
        if (mOrderState === OrderState.CART) throw new ForbiddenException();

        return await this.orderService.getOrdersBy({ 
                userId,
                orderState: mOrderState
            }, pageOptions);
    }

    @Get(':orderId')
    async getOrder(
        @Param('orderId') orderId: number,
    ) {
        const order = this.orderService.getOrderById(orderId, true);

        if(!order) throw new NotFoundException();

        return order;
    }

    @Post()
    async postOrderFromCart(
        @Body('userId') userId: string
    ) {
        const { orderId } = await this.orderService.newOrderFromCart(userId)
            .catch((e: Error) => {
                if(e.message === '0') throw new NotFoundException();
                else if(e.message === '1') throw new BadRequestException('주문하려면 더 많은 정보가 필요합니다.');
                else throw e;
            });
        
        return {
            ...await this.orderService.getOrderById(orderId, false),
            becomeVip: false,
        };
    }

    @Get(':orderId/dinners/:orderDinnerId')
    async getOrderDinner(
        @Param('orderId') orderId: number,
        @Param('orderDinnerId') orderDinnerId: number,
    ) {
        const orderDinner = await this.orderService.getOrderDinnerById(orderDinnerId, orderId);

        if(!orderDinner) throw new NotFoundException();

        return orderDinner;
    }

    @Put(':orderId/dinners/:orderDinnerId')
    async updateOrderDinner(
        //@Param('orderId') orderId: number,
        @Param('orderDinnerId') orderDinnerId: number,
        @Body() body: UpdateOrderDinnerDto,
    ) {
        const orderDinner = await this.orderService.updateOrderDinner(orderDinnerId, body);

        if(!orderDinner) throw new NotFoundException();
        return orderDinner;
    }

    @Delete(':orderId/dinners/:orderDinnerId')
    async deleteOrderDinner(
        //@Param('orderId') orderId: number,
        @Param('orderDinnerId') orderDinnerId: number,
    ) {
        return await this.orderService.deleteOrderDinner(orderDinnerId);
    }

    @Put(':orderId/state')
    async updateOrderState(
        @Param('orderId') orderId: number,
        @Body() body: {orderState: keyof typeof OrderState}
    ) {
        return await this.orderService.setOrderState(orderId, OrderState[body.orderState]);
    }
}