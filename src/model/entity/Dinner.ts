import { Column, Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";
import { DinnerIngredient } from "./DinnerIngredient";
import { DinnerOption } from "./DinnerOption";
import { Style } from "./Style";

@Entity("dinner", { schema: "cowball_mrdaebak" })
export class Dinner {
  @Column("int", { primary: true, name: "dinner_id" })
  dinnerId: number;

  @Column("varchar", { name: "dinner_name", nullable: true, length: 50 })
  dinnerName: string | null;

  @Column("int", { name: "dinner_price", nullable: true })
  dinnerPrice: number | null;

  @Column("varchar", { name: "dinner_detail", nullable: true, length: 255 })
  dinnerDetail: string | null;

  @OneToMany(
    () => DinnerIngredient,
    (dinnerIngredient) => dinnerIngredient.dinner
  )
  dinnerIngredients: DinnerIngredient[];

  @OneToMany(() => DinnerOption, (dinnerOption) => dinnerOption.dinner)
  dinnerOptions: DinnerOption[];

  @ManyToMany(() => Style, (style) => style.dinners)
  @JoinTable({
    name: "dinner_style",
    joinColumns: [{ name: "dinner_id", referencedColumnName: "dinnerId" }],
    inverseJoinColumns: [{ name: "style_id", referencedColumnName: "styleId" }],
    schema: "cowball_mrdaebak",
  })
  styles: Style[];
}
