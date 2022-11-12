import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Dinner } from "./Dinner";
import { Ingredient } from "./Ingredient";

@Index("FK_Ingredient_TO_Dinner_ingredient_1", ["ingredientId"], {})
@Index("FK_Ingredient_TO_Dinner_ingredient_2", ["categoryId"], {})
@Entity("dinner_ingredient", { schema: "cowball_mrdaebak" })
export class DinnerIngredient {
  @Column("int", { primary: true, name: "dinner_id" })
  dinnerId: number;

  @Column("int", { primary: true, name: "ingredient_id" })
  ingredientId: number;

  @Column("int", { primary: true, name: "category_id" })
  categoryId: number;

  @Column("int", { name: "ingredient_number", nullable: true })
  ingredientNumber: number | null;

  @ManyToOne(() => Dinner, (dinner) => dinner.dinnerIngredients, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "dinner_id", referencedColumnName: "dinnerId" }])
  dinner: Dinner;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.dinnerIngredients, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "ingredient_id", referencedColumnName: "ingredientId" }])
  ingredient: Ingredient;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.dinnerIngredients2, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "category_id", referencedColumnName: "categoryId" }])
  category: Ingredient;
}
