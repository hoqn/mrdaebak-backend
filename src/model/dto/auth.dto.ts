import { IsString } from "class-validator";

export class LoginUserDto {
    @IsString()
    readonly userId: string;

    @IsString()
    readonly password: string;
}

export class LoginStaffDto {
    @IsString()
    readonly staffId: string;

    @IsString()
    readonly password: string;
}