import { CreateOrderDinnerDto, UpdateOrderDinnerDto, UpdateOrderMetaDto } from "@/model/dto/order.dto";
import { Order } from "@/model/entity";
import { BaseAuthGuard, ExclusiveOrRoleGuard } from "@/security/guard";
import { SecurityRoles } from "@/security/role.decorator";
import { OrderService } from "@/service/order.service";
import { BadRequestException, Body, Controller, Delete, Get, HttpException, HttpStatus, InternalServerErrorException, NotFoundException, Param, Patch, Post, Put, Res, SetMetadata, UseGuards } from "@nestjs/common";
import { Response } from "express";

@Controller('cart')
export class CartController {
    constructor(
        private readonly orderService: OrderService,
    ) { }

    @UseGuards(BaseAuthGuard, ExclusiveOrRoleGuard)
    @SetMetadata('param', 'userId')
    @SecurityRoles()
    @Get(':userId')
    async getCart(
        @Param('userId') userId: string,
    ) {
        const cart = await this.orderService.getOrCreateCart(userId)

        if (!cart) throw new NotFoundException();

        return cart;
    }

    @UseGuards(BaseAuthGuard, ExclusiveOrRoleGuard)
    @SetMetadata('param', 'userId')
    @SecurityRoles()
    @Post(':userId')
    async addToCart(
        @Param('userId') userId: string,
        @Body() dto: CreateOrderDinnerDto,
    ) {
        const cart = await this.orderService.getOrCreateCart(userId);
        return await this.orderService.addOrderDinner(cart.orderId, dto);
    }

    @UseGuards(BaseAuthGuard, ExclusiveOrRoleGuard)
    @SetMetadata('param', 'userId')
    @SecurityRoles()
    @Patch(':userId')
    async updateCartMeta(
        @Param('userId') userId: string,
        @Body() dto: UpdateOrderMetaDto,
    ) {
        const cart = await this.orderService.getOrCreateCart(userId);

        const result = await this.orderService.updateOrder(cart.orderId, dto);

        return result;
    }

    @Delete(':userId/:orderDinnerId')
    async deleteCartItem(
        @Param('userId') userId: string,
        @Param('orderDinnerId') orderDinnerId: number,
    ) {
        const cart = await this.orderService.getOrCreateCart(userId);
        const orderDinner = await this.orderService.getOrderDinner(orderDinnerId, cart.orderId);

        if (!orderDinner) throw new NotFoundException();

        return await this.orderService.deleteOrderDinner(orderDinnerId);
    }

    @Patch(':userId/:orderDinnerId')
    async updateCartItem(
        @Param('userId') userId: string,
        @Param('orderDinnerId') orderDinnerId: number,
        @Body() dto: UpdateOrderDinnerDto,
    ) {
        const cart = await this.orderService.getOrCreateCart(userId);
        const orderDinner = await this.orderService.getOrderDinner(orderDinnerId, cart.orderId);

        if (!orderDinner) throw new NotFoundException();

        return await this.orderService.updateOrderDinner(orderDinner.orderDinnerId, dto);
    }

}