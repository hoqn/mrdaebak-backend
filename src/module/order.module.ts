import { OrderController } from "@/controller";
import { StaffAlarmEventGateway } from "@/gateway/staff.gateway";
import { DinnerOption, Order, OrderDinner } from "@/model/entity";
import { OrderService } from "@/service/order.service";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AlarmModule } from "./alarm.module";
import { MenuModule } from "./menu.module";

@Module({
    imports: [
        MenuModule,
        TypeOrmModule.forFeature([Order, OrderDinner, DinnerOption]),
        AlarmModule,
    ],
    exports: [TypeOrmModule, OrderService],
    controllers: [OrderController],
    providers: [OrderService],
})
export class OrderModule { }