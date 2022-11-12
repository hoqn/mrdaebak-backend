import { IsEnum, IsOptional, IsPhoneNumber, IsString } from "class-validator";
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

    public toEntity(): Staff {
        const entity = new Staff();

        entity.staffId = this.staffId;
        entity.staffName = this.staffName;
        entity.password = this.password;
        entity.phoneNumber = this.phoneNumber;

        return entity;
    }
}

export class UpdateStaffReq {
    @IsString() @IsOptional()
    readonly password?: string;

    @IsString() @IsOptional()
    readonly staffName?: string;

    @IsString() @IsOptional() @IsPhoneNumber('KR', {always: false})
    readonly phoneNumber?: string | null;

    @IsEnum(StaffRole) @IsOptional()
    readonly role?: keyof typeof StaffRole;

    public toStaffRole(): StaffRole {
        return StaffRole[this.role];
    }
}