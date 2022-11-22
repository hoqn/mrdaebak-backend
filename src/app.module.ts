import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { AuthModule, CartModule, MenuModule, OrderModule, StoreModule, UserModule } from '@/module';

import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { CONFIG } from './config';
import { Dinner, DinnerIngredient, DinnerOption, Ingredient, IngredientCategory, Order, OrderDinner, Staff, Style, StyleIngredient, StyleOption, User } from './model/entity';
import { OrderDinnerOption } from './model/entity/OrderDinnerOption';
import { IngredientModule } from './module/ingredient.module';
import { IngSchedule } from './_experimental/schedules/ingschedule.entity';
import { IngScheduleModule } from './_experimental/schedules/ingschedule.module';

const typeOrmConfig = <TypeOrmModuleOptions>{
  ...CONFIG.db,
  entities: [
    //join(__dirname, '{src,dist}/model/entity/**/*.{js,ts}'),
    Dinner, DinnerOption, DinnerIngredient,
    Style, StyleOption, StyleIngredient,
    Ingredient, IngredientCategory,
    Order, OrderDinner, OrderDinnerOption,
    Staff, User,
    //SteakDonenessDegree, //DinnerStyle,
    IngSchedule,
  ],
  namingStrategy: new SnakeNamingStrategy(),
  timezone: 'local',
  logging: ['error'],
};

const typeOrmModule = TypeOrmModule.forRoot(typeOrmConfig);

@Module({
  imports: [
    typeOrmModule,
    AuthModule,
    MenuModule,
    UserModule,
    OrderModule,
    CartModule,
    IngredientModule,
    StoreModule,

    IngScheduleModule,
  ]
})
export class AppModule { }