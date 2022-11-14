import { StaffAlarmEventGateway } from "@/gateway/staff.gateway";
import { Module } from "@nestjs/common";

@Module({
    exports: [StaffAlarmEventGateway],
    providers: [StaffAlarmEventGateway],
})
export class AlarmModule { }