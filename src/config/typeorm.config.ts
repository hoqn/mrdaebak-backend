import { Dinner, DinnerOption, Ingredient, IngredientCategory, Order, OrderDinner, Staff, SteakDonenessDegree, Style, StyleOption, User } from "@/model/entity";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { join } from "path";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

export default <TypeOrmModuleOptions>{
    ... require("../../config").db,
    entities: [
        //join(__dirname, '{src,dist}/model/entity/**/*.{js,ts}'),
        Dinner, DinnerOption,
        Style, StyleOption,
        Ingredient, IngredientCategory,
        Order, OrderDinner,
        Staff, User,
        SteakDonenessDegree, //DinnerStyle,
    ],
    synchronize: true,
    /* TODO: false로 바꿀 것! */
    namingStrategy: new SnakeNamingStrategy(),
    timezone: 'local',
    logging: ['error'],
};