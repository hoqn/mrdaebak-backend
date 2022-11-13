import { CreateOrderDinnerDto, UpdateOrderMetaDto } from "@/model/dto/order.dto";
import { Order } from "@/model/entity";
import { BaseAuthGuard, ExclusiveOrRoleGuard } from "@/security/guard";
import { SecurityRoles } from "@/security/role.decorator";
import { OrderService } from "@/service/order.service";
import { BadRequestException, Body, Controller, Get, HttpException, HttpStatus, InternalServerErrorException, NotFoundException, Param, Patch, Post, Res, SetMetadata, UseGuards } from "@nestjs/common";
import { Response } from "express";

@Controller('users')
export class CartController {
    constructor(
        private readonly orderService: OrderService,
    ) { }

    @UseGuards(BaseAuthGuard, ExclusiveOrRoleGuard)
    @SetMetadata('param', 'userId')
    @SecurityRoles()
    @Get(':userId/cart')
    async getCart(
        @Param('userId') userId: string,
    ) {
        const cart= await this.orderService.getOrCreateCart(userId)

        if(!cart) throw new NotFoundException();

        return cart;
    }

    @Post(':userId/cart')
    async addToCart(
        @Param('userId') userId: string,
        @Body() body: CreateOrderDinnerDto,
    ) {
        const cart = await this.orderService.getOrCreateCart(userId);

        return await this.orderService.addOrderDinner(cart.orderId, body);
    }

    @Patch(':userId/cart')
    async updateCartMeta(
        @Param('userId') userId: string,
        @Body() body: UpdateOrderMetaDto,
    ) {
        const cart = await this.orderService.getOrCreateCart(userId);

        const result = await this.orderService.updateOrderMeta(cart.orderId, body);

        return result;
    }
}