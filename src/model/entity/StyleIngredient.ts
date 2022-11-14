import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Ingredient } from "./Ingredient";
import { Style } from "./Style";

@Entity("style_ingredient")
export class StyleIngredient {
    @PrimaryColumn({ name: "style_id" })
    styleId: number;

    @PrimaryColumn({ name: "ingredient_id" })
    ingredientId: number;

    @Column("int", { name: "amount", default: 1 })
    amount: number;

    @ManyToOne(() => Style, o => o.styleIngredients)
    @JoinColumn({ name: "style_id", referencedColumnName: "styleId" })
    style: Style;

    @ManyToOne(() => Ingredient, o => o.styleIngredients)
    @JoinColumn({ name: "ingredient_id", referencedColumnName: "ingredientId" })
    ingredient: Ingredient;
}