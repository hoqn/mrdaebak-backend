import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { Dinner } from "./Dinner";
import { Ingredient } from "./Ingredient";

@Entity("dinner_ingredient")
export class DinnerIngredient {
    @PrimaryColumn()
    dinnerId: number;

    @PrimaryColumn()
    ingredientId: number;

    @Column("int", { default: 1 })
    ingredientNumber: number;

    @ManyToOne(() => Dinner)
    @JoinColumn({ name: "dinner_id", referencedColumnName: "dinnerId" })
    dinner: Dinner;
}