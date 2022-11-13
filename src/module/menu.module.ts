import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Dinner, DinnerOption, Style } from "@/model/entity";
import { MenuController } from "@/controller";
import { MenuService } from "@/service";
import { IngredientModule } from "./ingredient.module";

@Module({
    imports: [
        IngredientModule,
        TypeOrmModule.forFeature([Dinner, Style, DinnerOption])
    ],
    exports: [TypeOrmModule, MenuService],
    controllers: [MenuController],
    providers: [MenuService],
})
export class MenuModule { }