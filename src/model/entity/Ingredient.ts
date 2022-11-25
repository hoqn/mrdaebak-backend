import {
  Column,
  Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn
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

  @Column("int", { default: 0 })
  ingredientPrice: number;

  @Column("int", { default: 0 })
  stock: number;

  // Relations

  @ManyToOne(() => IngredientCategory, o => o.ingredients)
  @JoinColumn({ name: "category_id", referencedColumnName: "categoryId" })
  category: IngredientCategory;
}
