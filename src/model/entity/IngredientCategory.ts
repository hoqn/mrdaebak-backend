import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Ingredient } from "./Ingredient";

@Entity("ingredient_category")
export class IngredientCategory {
  @PrimaryGeneratedColumn('increment')
  categoryId: number;

  @Column("varchar", { length: 25 })
  categoryName: string;

  @OneToMany(() => Ingredient, (ingredient) => ingredient.category)
  ingredients: Ingredient[];
}
