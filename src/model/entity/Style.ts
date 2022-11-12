import { Column, Entity, ManyToMany, OneToMany } from "typeorm";
import { Dinner } from "./Dinner";
import { StyleIngredient } from "./StyleIngredient";
import { StyleOption } from "./StyleOption";

@Entity("style", { schema: "cowball_mrdaebak" })
export class Style {
  @Column("int", { primary: true, name: "style_id" })
  styleId: number;

  @Column("varchar", { name: "style_name", nullable: true, length: 50 })
  styleName: string | null;

  @Column("int", { name: "style_price", nullable: true })
  stylePrice: number | null;

  @Column("varchar", { name: "style_detail", nullable: true, length: 255 })
  styleDetail: string | null;

  @ManyToMany(() => Dinner, (dinner) => dinner.styles)
  dinners: Dinner[];

  @OneToMany(() => StyleIngredient, (styleIngredient) => styleIngredient.style)
  styleIngredients: StyleIngredient[];

  @OneToMany(() => StyleOption, (styleOption) => styleOption.style)
  styleOptions: StyleOption[];
}
