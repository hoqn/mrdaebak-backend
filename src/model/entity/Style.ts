import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Dinner } from "./Dinner";

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
}
