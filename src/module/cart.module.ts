import { CartController } from "@/controller";
import { StaffAlarmEventGateway } from "@/gateway/staff.gateway";
import { IngredientService } from "@/service";
import { OrderService } from "@/service/order.service";
import { Module } from "@nestjs/common";
import { IngredientModule } from "./ingredient.module";
import { MenuModule } from "./menu.module";
import { OrderModule } from "./order.module";
import { UserModule } from "./user.module";

@Module({
    imports: [
        IngredientModule,
        UserModule,
        OrderModule,
        MenuModule,
    ],
    //exports: [TypeOrmModule],
    controllers: [CartController],
    providers: [OrderService, StaffAlarmEventGateway],
})
export class CartModule { }