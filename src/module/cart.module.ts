import { CartController } from "@/controller";
import { OrderService } from "@/service/order.service";
import { Module } from "@nestjs/common";
import { AlarmModule } from "./alarm.module";
import { MenuModule } from "./menu.module";
import { OrderModule } from "./order.module";

@Module({
    imports: [
        OrderModule,
        MenuModule,
        AlarmModule,
    ],
    //exports: [TypeOrmModule],
    controllers: [CartController],
    providers: [OrderService],
})
export class CartModule { }