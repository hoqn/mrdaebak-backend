import { OrderController } from "@/controller";
import { StaffAlarmEventGateway } from "@/gateway/staff.gateway";
import { DinnerOption, Ingredient, IngredientCategory, Order, OrderDinner } from "@/model/entity";
import { IngredientService, OrderService } from "@/service";
import { IngScheduleModule } from "@/_experimental/schedules/ingschedule.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MenuModule, UserModule } from ".";

@Module({
    imports: [
        IngScheduleModule,
        MenuModule,
        UserModule,
        TypeOrmModule.forFeature([Order, OrderDinner, DinnerOption, Ingredient, IngredientCategory]),
    ],
    exports: [TypeOrmModule, OrderService],
    controllers: [OrderController],
    providers: [OrderService, IngredientService, StaffAlarmEventGateway],
})
export class OrderModule { }