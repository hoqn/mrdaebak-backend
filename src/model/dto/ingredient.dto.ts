import { PartialType } from "@nestjs/mapped-types";
import { IsBoolean, IsIn, IsNumber, IsOptional, IsString } from "class-validator";
import { Ingredient } from "../entity";

export class CreateIngredientReq {
    @IsString()
    readonly ingredientName: string;

    @IsNumber()
    readonly ingredientPrice: number;

    @IsNumber()
    readonly categoryId: number;
}

export class UpdateIngredientReq extends PartialType(CreateIngredientReq) { }

export type UpdateIngredientStockDtoArray = UpdateIngredientStockDto[];

export class UpdateIngredientStockDto {
    @IsNumber()
    readonly ingredientId: number;

    @IsNumber()
    readonly amount: number;
}