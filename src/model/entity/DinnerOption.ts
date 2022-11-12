import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne
} from "typeorm";
import { Dinner } from "./Dinner";
import { OrderDinner } from "./OrderDinner";

@Index("FK_Dinner_TO_Dinner_option_1", ["dinnerId"], {})
@Entity("dinner_option", { schema: "cowball_mrdaebak" })
export class DinnerOption {
  @Column("int", { primary: true, name: "dinner_option_id" })
  dinnerOptionId: number;

  @Column("int", { primary: true, name: "dinner_id" })
  dinnerId: number;

  @Column("varchar", { name: "dinner_option_name", nullable: true, length: 50 })
  dinnerOptionName: string | null;

  @Column("varchar", {
    name: "dinner_option_detail",
    nullable: true,
    length: 255,
  })
  dinnerOptionDetail: string | null;

  @Column("int", { name: "dinner_option_price", nullable: true })
  dinnerOptionPrice: number | null;

  @ManyToOne(() => Dinner, (dinner) => dinner.dinnerOptions)
  @JoinColumn([{ name: "dinner_id", referencedColumnName: "dinnerId" }])
  dinner: Dinner;

  @ManyToMany(() => OrderDinner, (orderDinner) => orderDinner.dinnerOptions)
  orderDinners: OrderDinner[];
}
