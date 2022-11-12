import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Style } from "./Style";

@Entity("style_option")
export class StyleOption {
  @PrimaryGeneratedColumn("increment")
  styleOptionId: number;

  @Column("varchar", { length: 255 })
  styleOptionDetail: string;

  @Column("int")
  styleOptionPrice: number;

  @ManyToOne(() => Style, (style) => style.styleOptions)
  @JoinColumn([{ name: "style_id", referencedColumnName: "styleId" }])
  style: Style;
}
