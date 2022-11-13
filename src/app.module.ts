import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule, CartModule, MenuModule, OrderModule, UserModule } from '@/module';

import typeormConfig from '@/config/typeorm.config';
import { IngredientModule } from './module/ingredient.module';

const typeOrmModule = TypeOrmModule.forRoot(typeormConfig);

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