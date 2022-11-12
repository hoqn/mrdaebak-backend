import { AddOrderDinnerDto, UpdateOrderMetaDto } from "@/model/dto/order.dto";
import { Order } from "@/model/entity";
import { BaseAuthGuard, ExclusiveOrRoleGuard } from "@/security/guard";
import { SecurityRoles } from "@/security/role.decorator";
import { OrderService } from "@/service/order.service";
import { ResBody } from "@/types/responseBody";
import { BadRequestException, Body, Controller, Get, HttpException, HttpStatus, InternalServerErrorException, Param, Patch, Post, Res, SetMetadata, UseGuards } from "@nestjs/common";
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
        @Res() res: Response,
        @Param('userId') userId: string,
    ) {
        const [ code, cart ] = await this.orderService.getOrCreateCart(userId, true)
            .catch(e => {
                console.error(e);
                throw new InternalServerErrorException();
            });

        if(code === 1) {
            res.status(HttpStatus.OK).json(<ResBody>{
                message: '기존에 있던 장바구니를 불러왔습니다.',
                result: cart,
            });
        } else if(code === 2) {
            res.status(HttpStatus.CREATED).json(<ResBody>{
                message: '장바구니가 존재하지 않아 새로 생성하였습니다.',
                result: cart,
            });
        } else {
            throw new BadRequestException();
        }

        return;
    }

    @Post(':userId/cart')
    async addToCart(
        @Param('userId') userId: string,
        @Body() body: AddOrderDinnerDto,
    ) {
        const [, cart] = await this.orderService.getOrCreateCart(userId, true);

        const order = await this.orderService.addToOrder(cart.orderId, body);

        return;
    }

    @Patch(':userId/cart')
    async updateCartMeta(
        @Param('userId') userId: string,
        @Body() body: UpdateOrderMetaDto,
    ) {
        const [, cart] = await this.orderService.getOrCreateCart(userId);

        return <ResBody> {
            result: await this.orderService.updateOrderMeta(cart.orderId, body),
        };
    }
}