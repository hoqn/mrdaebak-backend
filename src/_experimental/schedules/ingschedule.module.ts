import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { IngScheduleController } from "./ingschedule.controller";
import { IngSchedule } from "./ingschedule.entity";
import { IngScheduleService } from "./ingschedule.service";

@Module({
    imports: [TypeOrmModule.forFeature([IngSchedule])],
    controllers: [IngScheduleController],
    providers: [IngScheduleService],
    exports: [TypeOrmModule, IngScheduleService],
})
export class IngScheduleModule { }