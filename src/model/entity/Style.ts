import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Dinner } from "./Dinner";
import { Ingredient } from "./Ingredient";
import { StyleIngredient } from "./StyleIngredient";
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

  // Relations

  @OneToMany(() => StyleIngredient, o => o.style)
  styleIngredients: StyleIngredient[];

  @OneToMany(() => StyleOption, o => o.style)
  styleOptions: StyleOption[];
}
