import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Style } from "./Style";

@Index("FK_Style_TO_Style_option_1", ["styleId"], {})
@Entity("style_option", { schema: "cowball_mrdaebak" })
export class StyleOption {
  @Column("int", { primary: true, name: "style_option_id" })
  styleOptionId: number;

  @Column("int", { primary: true, name: "style_id" })
  styleId: number;

  @Column("varchar", {
    name: "style_option_detail",
    nullable: true,
    length: 255,
  })
  styleOptionDetail: string | null;

  @Column("int", { name: "style_option_price", nullable: true })
  styleOptionPrice: number | null;

  @ManyToOne(() => Style, (style) => style.styleOptions, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "style_id", referencedColumnName: "styleId" }])
  style: Style;
}
