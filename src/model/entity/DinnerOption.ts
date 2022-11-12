import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { Dinner } from "./Dinner";
import { OrderDinner } from "./OrderDinner";

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

  @ManyToOne(() => Dinner, (dinner) => dinner.dinnerOptions)
  @JoinColumn([{ name: "dinner_id", referencedColumnName: "dinnerId" }])
  dinner: Dinner;

  @ManyToMany(() => OrderDinner, (orderDinner) => orderDinner.dinnerOptions)
  orderDinners: OrderDinner[];
}
