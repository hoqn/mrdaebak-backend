import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Dinner, DinnerOption, Style } from "@/model/entity";
import { MenuController } from "@/controller";
import { MenuService } from "@/service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Dinner, Style, DinnerOption])
    ],
    exports: [TypeOrmModule, MenuService],
    controllers: [MenuController],
    providers: [MenuService],
})
export class MenuModule { }