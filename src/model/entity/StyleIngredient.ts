import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Ingredient } from "./Ingredient";
import { Style } from "./Style";

@Index("FK_Ingredient_TO_Style_ingredient_1", ["ingredientId"], {})
@Index("FK_Ingredient_TO_Style_ingredient_2", ["categoryId"], {})
@Entity("style_ingredient", { schema: "cowball_mrdaebak" })
export class StyleIngredient {
  @Column("int", { primary: true, name: "style_id" })
  styleId: number;

  @Column("int", { primary: true, name: "ingredient_id" })
  ingredientId: number;

  @Column("int", { primary: true, name: "category_id" })
  categoryId: number;

  @Column("int", { name: "ingredient_number", nullable: true })
  ingredientNumber: number | null;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.styleIngredients, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "ingredient_id", referencedColumnName: "ingredientId" }])
  ingredient: Ingredient;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.styleIngredients2, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "category_id", referencedColumnName: "categoryId" }])
  category: Ingredient;

  @ManyToOne(() => Style, (style) => style.styleIngredients, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "style_id", referencedColumnName: "styleId" }])
  style: Style;
}
