import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UserController } from "@/controller";
import { User } from "@/model/entity";
import { UserService } from "@/service";

@Module({
    imports: [
      TypeOrmModule.forFeature([User])
    ],
    exports: [TypeOrmModule, UserService],
    controllers: [UserController],
    providers: [UserService],
  })
export class UserModule { }