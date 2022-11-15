import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { AuthModule, CartModule, MenuModule, OrderModule, UserModule } from '@/module';

import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { CONFIG } from './config';
import { Dinner, DinnerIngredient, DinnerOption, Ingredient, IngredientCategory, Order, OrderDinner, Staff, SteakDonenessDegree, Style, StyleIngredient, StyleOption, User } from './model/entity';
import { OrderDinnerOption } from './model/entity/OrderDinnerOption';
import { IngredientModule } from './module/ingredient.module';

const typeOrmConfig = <TypeOrmModuleOptions>{
  ...CONFIG.db,
  entities: [
    //join(__dirname, '{src,dist}/model/entity/**/*.{js,ts}'),
    Dinner, DinnerOption, DinnerIngredient,
    Style, StyleOption, StyleIngredient,
    Ingredient, IngredientCategory,
    Order, OrderDinner, OrderDinnerOption,
    Staff, User,
    SteakDonenessDegree, //DinnerStyle,
  ],
  synchronize: false,
  /* TODO: false로 바꿀 것! */
  namingStrategy: new SnakeNamingStrategy(),
  timezone: 'local',
  logging: ['error'],
};

const typeOrmModule = TypeOrmModule.forRoot(typeOrmConfig);

/*
async function migration(typeormConfig: any) {
  const connection = await createConnection(typeormConfig);
  await connection.query('USE mrdaebak');
  await connection.query('SET foreign_key_checks=0');
  await connection.synchronize();
  await connection.query('SET foreign_key_checks=1');
}

migration(typeormConfig);
*/

@Module({
  imports: [
    typeOrmModule,
    AuthModule,
    MenuModule,
    UserModule,
    OrderModule,
    CartModule,
    IngredientModule,
  ]
})
export class AppModule { }