import { PartialType } from "@nestjs/mapped-types";
import { Type } from "class-transformer";
import { IsArray, IsCreditCard, IsDate, IsDateString, IsEnum, IsInt, IsNumber, IsNumberString, IsObject, IsOptional, IsPhoneNumber, IsString, ValidateIf } from "class-validator";
import { Moment } from "moment";

/**
 * ORDER
 */

export class CreateOrderDto {
    @IsDateString() @IsOptional()
    rsvDate?: string;

    @IsString() @IsOptional()
    deliveryAddress?: string;

    @IsPhoneNumber('KR') @IsOptional()
    phoneNumber?: string;

    @IsNumberString() @IsOptional()
    cardNumber?: string;

    @IsString() @IsOptional()
    request?: string;
}

export class UpdateOrderMetaDto extends PartialType(CreateOrderDto) { }

/**
 * ORDERDINNER
 */

class DinnerOptionIdMapEntity {
    id: number;
    amount: number;
}

 export class CreateOrderDinnerDto {
    @IsNumber() @IsOptional()
    degreeId: number;

    @IsNumber()
    dinnerId: number;

    @IsArray() @IsOptional()
    dinnerOptionIds: DinnerOptionIdMapEntity[];

    @IsNumber()
    styleId: number;
}

export class UpdateOrderDinnerDto extends PartialType(CreateOrderDinnerDto) { }