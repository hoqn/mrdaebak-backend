import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { MenuController } from "@/controller";
import { Dinner, DinnerOption, Ingredient, IngredientCategory, Style } from "@/model/entity";
import { IngredientService, MenuService } from "@/service";
import { IngScheduleModule } from "@/_experimental/schedules/ingschedule.module";
import { IngScheduleService } from "@/_experimental/schedules/ingschedule.service";

@Module({
    imports: [
        IngScheduleModule,
        TypeOrmModule.forFeature([Dinner, Style, DinnerOption, Ingredient, IngredientCategory])
    ],
    exports: [TypeOrmModule, MenuService],
    controllers: [MenuController],
    providers: [MenuService, IngredientService],
})
export class MenuModule { }