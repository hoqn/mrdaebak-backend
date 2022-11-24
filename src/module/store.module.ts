import { StoreService } from "@/service";
import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { IngredientModule } from "./ingredient.module";
import { OrderModule } from "./order.module";

@Module({
    imports: [
        IngredientModule,
        OrderModule,
        ScheduleModule.forRoot(),
    ],
    providers: [StoreService],
})
export class StoreModule { }