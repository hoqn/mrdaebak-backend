import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Dinner } from "./Dinner";
import { Ingredient } from "./Ingredient";
import { StyleOption } from "./StyleOption";

@Entity("style")
export class Style {
  @PrimaryGeneratedColumn("increment")
  styleId: number;

  @Column("varchar", { length: 50 })
  styleName: string;

  @Column("int")
  stylePrice: number;

  @Column("varchar", { length: 255 })
  styleDetail: string;

  @ManyToMany(() => Dinner, (dinner) => dinner.styles)
  dinners: Dinner[];

  @ManyToMany(() => Ingredient, (ingredient) => ingredient.styles)
  @JoinTable({
    name: "style_ingredient",
    joinColumn: { name: "style_id", referencedColumnName: "styleId" },
    inverseJoinColumn: { name: "ingredient_id", referencedColumnName: "ingredientId" },
  })
  ingredients: Ingredient[];

  @OneToMany(() => StyleOption, (styleOption) => styleOption.style)
  styleOptions: StyleOption[];
}
