import { CartController } from "@/controller";
import { StaffAlarmEventGateway } from "@/gateway/staff.gateway";
import { IngredientService } from "@/service";
import { OrderService } from "@/service/order.service";
import { IngScheduleModule } from "@/_experimental/schedules/ingschedule.module";
import { Module } from "@nestjs/common";
import { MenuModule } from "./menu.module";
import { OrderModule } from "./order.module";
import { UserModule } from "./user.module";

@Module({
    imports: [
        IngScheduleModule,
        UserModule,
        OrderModule,
        MenuModule,
    ],
    //exports: [TypeOrmModule],
    controllers: [CartController],
    providers: [OrderService, IngredientService,StaffAlarmEventGateway],
})
export class CartModule { }