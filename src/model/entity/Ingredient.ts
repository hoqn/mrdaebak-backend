import {
  Column,
  Entity, JoinColumn,
  ManyToMany,
  ManyToOne, OneToMany, PrimaryGeneratedColumn
} from "typeorm";
import { Dinner } from "./Dinner";
import { IngredientCategory } from "./IngredientCategory";
import { Style } from "./Style";
import { StyleIngredient } from "./StyleIngredient";

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

  // Relations
  
  @ManyToOne(() => IngredientCategory, o => o.ingredients )
  @JoinColumn({ name: "category_id", referencedColumnName: "categoryId" })
  category: IngredientCategory;

  @ManyToMany(() => Dinner, (dinner) => dinner.ingredients)
  dinners: Dinner[];

  @OneToMany(() => StyleIngredient, o => o.ingredient)
  styleIngredients: StyleIngredient[];
}
