import { IsArray, IsEnum, IsOptional, IsPhoneNumber, IsString } from "class-validator";
import { Staff, StaffRole } from "../entity";

export class CreateStaffDto {
    @IsString()
    readonly staffId: string;

    @IsString()
    readonly password: string;

    @IsString()
    readonly staffName: string;

    @IsString() @IsOptional() @IsPhoneNumber('KR')
    readonly phoneNumber: string|null;

    toEntity(): Staff {
        const entity = new Staff();

        entity.staffId = this.staffId;
        entity.staffName = this.staffName;
        entity.password = this.password;
        entity.phoneNumber = this.phoneNumber;

        return entity;
    }
}

export class ApproveStaffDto {
    @IsEnum(['OWNER', 'COOK', 'DELIVERY'])
    readonly role: 'OWNER'|'COOK'|'DELIVERY';

    @IsString()
    readonly staffId: string;
}