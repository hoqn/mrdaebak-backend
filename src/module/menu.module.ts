import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { MenuController } from "@/controller";
import { Dinner, DinnerOption, Ingredient, IngredientCategory, IngSchedule, Style } from "@/model/entity";
import { IngredientService, IngScheduleService, MenuService } from "@/service";
@Module({
    imports: [
        TypeOrmModule.forFeature([Dinner, Style, DinnerOption, Ingredient, IngSchedule, IngredientCategory])
    ],
    exports: [TypeOrmModule, MenuService],
    controllers: [MenuController],
    providers: [MenuService, IngredientService, IngScheduleService],
})
export class MenuModule { }