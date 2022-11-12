import { OrderState } from "@/model/entity";
import { OrderService } from "@/service/order.service";
import { PaginationOptions } from "@/service/utils/paginatedResult";
import { ResBody } from "@/types/responseBody";
import { Body, Controller, Delete, ForbiddenException, Get, Param, Post, Put, Query, Res } from "@nestjs/common";
import { Response } from "express";

@Controller('orders')
export class OrderController {
    constructor(
        private readonly orderService: OrderService
    ) { }

    @Get()
    async getOrders(
        @Query('page') page?: number,
        @Query('user_id') userId?: string,
        @Query('state') orderState?: keyof typeof OrderState,
        @Query('sort_by') sortBy?: 'order_date' | 'rsv_date',
        @Query('sort_to') sortTo?: 'asc' | 'desc',
    ) {
        // 이후 확장성을 위해 값을 복사해서 사용하자..!
        const sortByValue = sortBy;
        const sortToValue = sortTo;

        const mOrderState = orderState ? OrderState[orderState.toUpperCase()] : undefined;
        if (mOrderState === OrderState.CART) throw new ForbiddenException();

        const items = await this.orderService.getOrders(
            { userId, orderState: mOrderState },
            PaginationOptions.from(page ? page : 1),
            { sortBy: sortByValue, sortTo: sortToValue });

        return <ResBody>{
            result: items,
        }
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