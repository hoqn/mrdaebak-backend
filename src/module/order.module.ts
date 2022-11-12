import { OrderController } from "@/controller";
import { DinnerOption, Order, OrderDinner } from "@/model/entity";
import { OrderService } from "@/service/order.service";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MenuModule } from "./menu.module";

@Module({
    imports: [
        MenuModule,
        TypeOrmModule.forFeature([Order, OrderDinner, DinnerOption]),
    ],
    exports: [TypeOrmModule, OrderService],
    controllers: [OrderController],
    providers: [OrderService],
})
export class OrderModule { }