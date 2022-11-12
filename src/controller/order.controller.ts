import { OrderState } from "@/model/entity";
import { ListParams } from "@/model/list.params";
import { OrderDirection, OrderParams } from "@/model/order.params";
import { OrderService } from "@/service/order.service";
import { ResBody } from "@/types/responseBody";
import { Body, Controller, Delete, ForbiddenException, Get, Param, Put, Query } from "@nestjs/common";

@Controller('orders')
export class OrderController {
    constructor(
        private readonly orderService: OrderService
    ) { }

    @Get()
    async getOrders(
        @Query('user_id') userId?: string,
        @Query('state') orderState?: keyof typeof OrderState,
        @Query('page') page?: number,
        @Query('order_by') orderBy?: string,
        @Query('order_direction') orderDirection?: OrderDirection,
    ) {
        const mOrderState = orderState ? OrderState[orderState.toUpperCase()] : undefined;
        if (mOrderState === OrderState.CART) throw new ForbiddenException();

        return await this.orderService.getOrdersBy({ 
                userId,
                orderState: mOrderState
            }, new ListParams(page), new OrderParams(orderBy, orderDirection));
    }

    @Get(':orderId/i/:orderDinnerId')
    async getOrderDinner(
        @Param('orderId') orderId: number,
        @Param('orderDinnerId') orderDinnerId: number,
    ) {
        return <ResBody> {
            result: await this.orderService.getOrderDinner(orderId, orderDinnerId),
        };
    }

    @Put(':orderId/i/:orderDinnerId')
    async updateOrderDinner(
        @Param('orderId') orderId: number,
        @Param('orderDinnerId') orderDinnerId: number,
    ) {
        return <ResBody> {
            result: await this.orderService
        }
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
        return <ResBody> {
            result: await this.orderService.setOrderState(orderId, OrderState[body.orderState]),
        };
    }
}