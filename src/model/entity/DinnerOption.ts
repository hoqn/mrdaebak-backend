import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { Dinner } from "./Dinner";
import { OrderDinner } from "./OrderDinner";
import { OrderDinnerOption } from "./OrderDinnerOption";

@Entity("dinner_option")
export class DinnerOption {
  @PrimaryGeneratedColumn("increment")
  dinnerOptionId: number;

  @Column("int")
  dinnerId: number;

  @Column("varchar", { length: 50 })
  dinnerOptionName: string;

  @Column("varchar", { length: 255 })
  dinnerOptionDetail: string;

  @Column("int")
  dinnerOptionPrice: number;

  // Relations

  @ManyToOne(() => Dinner, (dinner) => dinner.dinnerOptions)
  @JoinColumn([{ name: "dinner_id", referencedColumnName: "dinnerId" }])
  dinner: Dinner;

  @OneToMany(() => OrderDinnerOption, (o) => o.dinnerOption)
  orderDinnerOptions: OrderDinnerOption[];
}
