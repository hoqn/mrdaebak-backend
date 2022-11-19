import { IngredientController } from "@/controller/ingredient.controller";
import { Ingredient, IngredientCategory } from "@/model/entity";
import { IngredientService } from "@/service";
import { IngScheduleModule } from "@/_experimental/schedules/ingschedule.module";
import { IngScheduleService } from "@/_experimental/schedules/ingschedule.service";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [
        IngScheduleModule,
        TypeOrmModule.forFeature([Ingredient, IngredientCategory]),
    ],
    exports: [TypeOrmModule, IngredientService],
    controllers: [IngredientController],
    providers: [IngredientService, IngScheduleService],
})
export class IngredientModule {}