import { PartialType } from "@nestjs/mapped-types";
import { IsEnum, IsIn, IsOptional, IsPhoneNumber, IsString, Max } from "class-validator";
import { Staff } from "../entity";
import { StaffRole } from "../enum";

export class CreateStaffReq {
    @IsString()
    readonly staffId: string;

    @IsString()
    readonly password: string;

    @IsString()
    readonly staffName: string;

    @IsString() @IsOptional() @IsPhoneNumber('KR')
    readonly phoneNumber: string | null;

    @IsEnum(StaffRole, { always: false })
    readonly role: keyof typeof StaffRole;

    get staffRole(): StaffRole {
        return StaffRole[this.role];
    }
}

export class UpdateStaffReq extends PartialType(CreateStaffReq) {  }