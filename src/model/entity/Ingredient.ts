import {
  Column,
  Entity, JoinColumn,
  ManyToOne, PrimaryGeneratedColumn
} from "typeorm";
import { IngredientCategory } from "./IngredientCategory";

@Entity("ingredient")
export class Ingredient {
  @PrimaryGeneratedColumn('increment')
  ingredientId: number;

  @Column("int")
  categoryId: number;

  @Column("varchar", { length: 50 })
  ingredientName: string;

  @Column("int")
  ingredientPrice: number;

  @Column("int", { default: 0 })
  prevStock: number;

  @Column("int", { default: 0 })
  todayArrived: number;

  @Column("int", { default: 0 })
  todayOut: number;

  @Column("int", { default: 0 })
  currentStock: number;

  @Column("int", { default: 0 })
  orderedNumber: number;
  
  @ManyToOne(
    () => IngredientCategory,
    (ingredientCategory) => ingredientCategory.ingredients,
  )
  @JoinColumn([{ name: "category_id", referencedColumnName: "categoryId" }])
  category: IngredientCategory;
}
