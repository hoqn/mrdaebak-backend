import { IsNumber, IsOptional, IsString } from "class-validator";
import { Ingredient } from "../entity";

export class CreateIngredientReq {
    @IsString()
    readonly ingredientName: string;

    @IsNumber()
    readonly ingredientPrice: number;

    @IsNumber()
    readonly categoryId: number;

    @IsNumber()
    readonly currentStock: number;

    public toEntity(): Ingredient {
        return <Ingredient> {
            categoryId: this.categoryId,
            ingredientName: this.ingredientName,
            ingredientPrice: this.ingredientPrice,
            currentStock: this.currentStock,
        };
    }
}

export class UpdateIngredientReq {
    @IsString() @IsOptional()
    readonly ingredientName?: string;

    @IsNumber() @IsOptional()
    readonly ingredientPrice?: number;

    @IsNumber() @IsOptional()
    readonly categoryId?: number;

    //@IsNumber() @IsOptional()
    //readonly prevStock?: number;

    //@IsNumber() @IsOptional()
    //readonly todayArrived?: number;

    @IsNumber() @IsOptional()
    readonly todayOut?: number;

    @IsNumber() @IsOptional()
    readonly currentStock?: number;

    @IsNumber() @IsOptional()
    readonly orderedNumber?: number;
}