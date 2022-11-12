import { Column, Entity, OneToMany } from "typeorm";
import { Ingredient } from "./Ingredient";

@Entity("ingredient_category", { schema: "cowball_mrdaebak" })
export class IngredientCategory {
  @Column("int", { primary: true, name: "category_id" })
  categoryId: number;

  @Column("varchar", { name: "category_name", nullable: true, length: 25 })
  categoryName: string | null;

  @OneToMany(() => Ingredient, (ingredient) => ingredient.category)
  ingredients: Ingredient[];
}
