import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DinnerOption } from "./DinnerOption";
import { Ingredient } from "./Ingredient";
import { Style } from "./Style";

@Entity("dinner")
export class Dinner {
  @PrimaryGeneratedColumn('increment')
  dinnerId: number;

  @Column("varchar", { length: 50 })
  dinnerName: string;

  @Column("varchar", { length: 100 })
  dinnerNameEn: string;

  @Column("int")
  dinnerPrice: number;

  @Column("varchar", { length: 255 })
  dinnerDetail: string;

  @ManyToMany(() => Ingredient, (ingredient) => ingredient.dinners)
  @JoinTable({ 
    name: "dinner_ingredient",
    joinColumns: [{ name: "dinner_id", referencedColumnName: "dinnerId" }],
    inverseJoinColumns: [{ name: "ingredient_id", referencedColumnName: "ingredientId" }],
  })
  ingredients: Ingredient[];

  @OneToMany(() => DinnerOption, (dinnerOption) => dinnerOption.dinner)
  dinnerOptions: DinnerOption[];

  @ManyToMany(() => Style, (style) => style.dinners)
  @JoinTable({
    name: "dinner_style",
    joinColumns: [{ name: "dinner_id", referencedColumnName: "dinnerId" }],
    inverseJoinColumns: [{ name: "style_id", referencedColumnName: "styleId" }],
  })
  styles: Style[];
}
