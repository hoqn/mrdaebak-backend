import { IngredientController } from "@/controller/ingredient.controller";
import { Ingredient, IngredientCategory, IngSchedule } from "@/model/entity";
import { IngredientService } from "@/service";
import { IngScheduleService } from "@/service/ingschedule.service";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [
        TypeOrmModule.forFeature([Ingredient, IngredientCategory, IngSchedule]),
    ],
    exports: [TypeOrmModule, IngredientService, IngScheduleService],
    controllers: [IngredientController],
    providers: [IngredientService, IngScheduleService],
})
export class IngredientModule { }