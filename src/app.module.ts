import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AlarmModule, AuthModule, CartModule, MenuModule, OrderModule, UserModule } from '@/module';

import typeormConfig from '@/config/typeorm.config';
import { IngredientModule } from './module/ingredient.module';
import { createConnection } from 'typeorm';
import { StaffAlarmEventGateway } from './gateway/staff.gateway';

const typeOrmModule = TypeOrmModule.forRoot(typeormConfig);

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
    AlarmModule,
    AuthModule,
    MenuModule,
    UserModule,
    OrderModule,
    CartModule,
    IngredientModule,
  ]
})
export class AppModule { }