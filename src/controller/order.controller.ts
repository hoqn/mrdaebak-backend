import { PageOptionsDto } from "@/model/dto/common.dto";
import { OrderState } from "@/model/enum";
import { OrderService } from "@/service/order.service";
import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, InternalServerErrorException, NotFoundException, Param, Post, Put, Query } from "@nestjs/common";

@Controller('orders')
export class OrderController {
    constructor(
        private readonly orderService: OrderService
    ) { }

    @Get()
    async getOrders(
        @Query('user_id') userId?: string,
        @Query('state') orderState?: keyof typeof OrderState,
        @Query() pageOptions?: PageOptionsDto,
    ) {
        const mOrderState = orderState ? OrderState[orderState.toUpperCase()] : undefined;
        if (mOrderState === OrderState.CART) throw new ForbiddenException();

        return await this.orderService.getOrdersBy({ 
                userId,
                orderState: mOrderState
            }, pageOptions);
    }

    @Post()
    async postOrderFromCart(
        @Body('userId') userId: string
    ) {
        return await this.orderService.newOrderFromCart(userId)
            .catch((e: Error) => {
                if(e.message === '0') throw new NotFoundException();
                else if(e.message === '1') throw new BadRequestException('주문하려면 더 많은 정보가 필요합니다.');
                
                throw new InternalServerErrorException();
            });
    }

    @Get(':orderId/i/:orderDinnerId')
    async getOrderDinner(
        @Param('orderId') orderId: number,
        @Param('orderDinnerId') orderDinnerId: number,
    ) {
        return await this.orderService.getOrderDinner(orderId, orderDinnerId);
    }

    @Put(':orderId/i/:orderDinnerId')
    async updateOrderDinner(
        @Param('orderId') orderId: number,
        @Param('orderDinnerId') orderDinnerId: number,
    ) {
        
    }

    @Delete(':orderId/i/:orderDinnerId')
    async deleteOrderDinner(
        @Param('orderId') orderId: number,
        @Param('orderDinnerId') orderDinnerId: number,
    ) {
        return await this.orderService.removeOrderDinner(orderId, orderDinnerId);
    }

    @Put(':orderId/state')
    async updateOrderState(
        @Param('orderId') orderId: number,
        @Body() body: {orderState: keyof typeof OrderState}
    ) {
        return await this.orderService.setOrderState(orderId, OrderState[body.orderState]);
    }
}