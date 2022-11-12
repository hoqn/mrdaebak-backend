import { StaffController } from "@/controller/staff.controller";
import { Staff } from "@/model/entity";
import { StaffService } from "@/service/staff.service";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [
        TypeOrmModule.forFeature([Staff])
    ],
    exports: [TypeOrmModule, StaffService],
    controllers: [StaffController],
    providers: [StaffService],
})
export class StaffModule { }