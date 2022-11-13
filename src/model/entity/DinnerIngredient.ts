import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("dinner_ingredient")
export class DinnerIngredient {
    @PrimaryColumn()
    dinnerId: number;

    @PrimaryColumn()
    ingredientId: number;

    @Column("int", { default: 1 })
    ingredientNumber: number;
}