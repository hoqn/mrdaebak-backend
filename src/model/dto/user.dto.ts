import { PartialType } from "@nestjs/mapped-types";
import { IsString, IsOptional } from "class-validator";
import { User } from "../entity";

export class CreateUserDto {
    @IsString()
    readonly userId: string;

    @IsString()
    readonly password: string;

    @IsString()
    readonly userName: string;

    @IsString() @IsOptional()
    readonly address: string | null;

    @IsString() @IsOptional()
    readonly phoneNumber: string | null;

    @IsString() @IsOptional()
    readonly cardNumber: string | null;

    toEntity(): User {
        const entity = new User();

        entity.userId = this.userId;
        entity.userName = this.userName;
        entity.password = this.password;
        entity.address = this.address;
        entity.phoneNumber = this.phoneNumber;
        entity.cardNumber = this.cardNumber;

        return entity;
    }
}

export class PatchUserDto {
    @IsString() @IsOptional()
    readonly password: string;

    @IsString() @IsOptional()
    readonly userName: string;

    @IsString() @IsOptional()
    readonly address: string;

    @IsString() @IsOptional()
    readonly phoneNumber: string;

    @IsString() @IsOptional()
    readonly cardNumber: string;
}