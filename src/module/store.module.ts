import { Ingredient, IngredientCategory } from "@/model/entity";
import { IngredientService, StoreService } from "@/service";
import { IngScheduleModule } from "@/_experimental/schedules/ingschedule.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [
        IngScheduleModule,
        TypeOrmModule.forFeature([ Ingredient, IngredientCategory ]),
    ],
    providers: [StoreService, IngredientService],
})
export class StoreModule {}