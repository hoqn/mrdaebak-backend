import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("style_ingredient")
export class StyleIngredient {
    @PrimaryColumn()
    styleId: number;

    @PrimaryColumn()
    ingredientId: number;

    @Column("int", { default: 1 })
    ingredientNumber: number;
}