import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { DinnerIngredient } from "./DinnerIngredient";
import { IngredientCategory } from "./IngredientCategory";
import { StyleIngredient } from "./StyleIngredient";

@Index("FK_Ingredient_category_TO_Ingredient_1", ["categoryId"], {})
@Entity("ingredient", { schema: "cowball_mrdaebak" })
export class Ingredient {
  @Column("int", { primary: true, name: "ingredient_id" })
  ingredientId: number;

  @Column("int", { primary: true, name: "category_id" })
  categoryId: number;

  @Column("varchar", { name: "ingredient_name", nullable: true, length: 50 })
  ingredientName: string | null;

  @Column("int", { name: "ingredient_price", nullable: true })
  ingredientPrice: number | null;

  @Column("int", { name: "prev_stock", nullable: true })
  prevStock: number | null;

  @Column("int", { name: "today_arrived", nullable: true })
  todayArrived: number | null;

  @Column("int", { name: "today_out", nullable: true })
  todayOut: number | null;

  @Column("int", { name: "current_stock", nullable: true })
  currentStock: number | null;

  @Column("int", { name: "ordered_number", nullable: true })
  orderedNumber: number | null;

  @OneToMany(
    () => DinnerIngredient,
    (dinnerIngredient) => dinnerIngredient.ingredient
  )
  dinnerIngredients: DinnerIngredient[];

  @OneToMany(
    () => DinnerIngredient,
    (dinnerIngredient) => dinnerIngredient.category
  )
  dinnerIngredients2: DinnerIngredient[];

  @ManyToOne(
    () => IngredientCategory,
    (ingredientCategory) => ingredientCategory.ingredients,
    { onDelete: "RESTRICT", onUpdate: "RESTRICT" }
  )
  @JoinColumn([{ name: "category_id", referencedColumnName: "categoryId" }])
  category: IngredientCategory;

  @OneToMany(
    () => StyleIngredient,
    (styleIngredient) => styleIngredient.ingredient
  )
  styleIngredients: StyleIngredient[];

  @OneToMany(
    () => StyleIngredient,
    (styleIngredient) => styleIngredient.category
  )
  styleIngredients2: StyleIngredient[];
}
