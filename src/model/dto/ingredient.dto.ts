import { PartialType } from "@nestjs/mapped-types";
import { IsBoolean, IsIn, IsNumber, IsOptional, IsString } from "class-validator";
import { Ingredient } from "../entity";
/*
export class CreateIngredientDto {
    @IsString()
    readonly ingredientName: string;

    @IsNumber()
    readonly ingredientPrice: number;

    @IsNumber()
    readonly categoryId: number;
}

export class UpdateIngredientDto extends PartialType(CreateIngredientDto) { }
*/
export type UpdateIngredientStockDtoArray = UpdateIngredientStockDto[];

export class UpdateIngredientStockDto {
    @IsNumber()
    readonly ingredientId: number;

    @IsNumber()
    readonly amount: number;
}