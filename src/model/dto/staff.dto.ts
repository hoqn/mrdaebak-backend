import { PartialType } from "@nestjs/mapped-types";
import { IsEnum, IsIn, IsOptional, IsPhoneNumber, IsString, Max } from "class-validator";
import { Staff } from "../entity";
import { StaffRole } from "../enum";

export class CreateStaffDto {
    @IsString()
    readonly staffId: string;

    @IsString()
    readonly password: string;

    @IsString()
    readonly staffName: string;

    @IsString() @IsOptional() @IsPhoneNumber('KR', { message: '알맞은 전화번호를 입력해주세요.' })
    readonly phoneNumber: string | null;

    @IsEnum(StaffRole, { always: false })
    readonly role: keyof typeof StaffRole;

    get staffRole(): StaffRole {
        return StaffRole[this.role];
    }
}

export class UpdateStaffDto extends PartialType(CreateStaffDto) { }