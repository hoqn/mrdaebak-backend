import { Dinner, DinnerIngredient, DinnerOption, Ingredient, IngredientCategory, Order, OrderDinner, Staff, SteakDonenessDegree, Style, StyleIngredient, StyleOption, User } from "@/model/entity";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { join } from "path";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

export default <TypeOrmModuleOptions>{
    ... require("../../config").db,
    entities: [
        //join(__dirname, '{src,dist}/model/entity/**/*.{js,ts}'),
        Dinner, DinnerIngredient, DinnerOption,
        Style, StyleIngredient, StyleOption,
        Ingredient, IngredientCategory,
        Order, OrderDinner,
        Staff, User,
        SteakDonenessDegree, //DinnerStyle,
    ],
    synchronize: true,
    /* TODO: false로 바꿀 것! */
    namingStrategy: new SnakeNamingStrategy(),
};