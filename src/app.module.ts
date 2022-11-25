import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { AuthModule, CartModule, MenuModule, OrderModule, StoreModule, UserModule } from '@/module';

import { IngSchedule } from '@/model/entity/ingschedule';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { CONFIG } from './config';
import { LegacyController } from './controller';
import { Dinner, DinnerIngredient, DinnerOption, Ingredient, IngredientCategory, Order, OrderDinner, Staff, Style, StyleIngredient, User } from './model/entity';
import { OrderDinnerOption } from './model/entity/OrderDinnerOption';
import { IngredientModule } from './module/ingredient.module';

const typeOrmConfig = <TypeOrmModuleOptions>{
  ...CONFIG.db,
  entities: [
    //join(__dirname, '{src,dist}/model/entity/**/*.{js,ts}'),
    Dinner, DinnerOption, DinnerIngredient,
    Style, StyleIngredient,
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
  ],
  controllers: [LegacyController],
})
export class AppModule { }