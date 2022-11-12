import { IsArray, IsCreditCard, IsDate, IsDateString, IsEnum, IsNumber, IsNumberString, IsObject, IsOptional, IsPhoneNumber, IsString } from "class-validator";

export class CreateOrderDto {
    @IsDate()
    rsvDate: Date;

    @IsString()
    deliveryAddress: string;

    @IsPhoneNumber('KR')
    phoneNumber: string;

    @IsCreditCard()
    cardNumber: string;

    @IsString()
    request: string;
}

export class AddOrderDinnerDto {
    @IsNumber()
    degreeId: number;

    @IsNumber()
    dinnerId: number;
    @IsArray()
    dinnerOptionIds: number[];

    @IsNumber()
    styleId: number;
}

export class UpdateOrderMetaDto {
    @IsDateString() @IsOptional()
    rsvDate?: Date;

    @IsString() @IsOptional()
    deliveryAddress?: string;

    @IsPhoneNumber('KR') @IsOptional()
    phoneNumber?: string;

    @IsNumberString() @IsOptional()
    cardNumber?: string;

    @IsString() @IsOptional()
    request?: string;
}