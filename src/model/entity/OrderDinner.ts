import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn
} from "typeorm";
import { Dinner } from "./Dinner";
import { DinnerOption } from "./DinnerOption";
import { Order } from "./Order";
import { OrderDinnerOption } from "./OrderDinnerOption";
import { SteakDonenessDegree } from "./SteakDonenessDegree";
import { Style } from "./Style";

@Entity("order_dinner")
export class OrderDinner {
  @PrimaryGeneratedColumn("increment")
  orderDinnerId: number;

  @Column("int", { nullable: true })
  orderId: number | null;

  @Column("int", { nullable: true })
  totalDinnerPrice: number | null;

  @Column("int", { nullable: true })
  degreeId: number | null;

  @Column("int")
  dinnerId: number;

  @Column("int")
  styleId: number;

  @ManyToOne(() => Order, (order) => order.orderDinners)
  @JoinColumn({ name: "order_id", referencedColumnName: "orderId" })
  order: Order;

  @ManyToOne(() => SteakDonenessDegree)
  @JoinColumn({ name: "degree_id", referencedColumnName: "degreeId" })
  degree: SteakDonenessDegree;

  // Relations

  /*
  @ManyToMany(() => DinnerOption, (dinnerOption) => dinnerOption.orderDinners)
  @JoinTable({
    name: 'order_dinner_option',
    joinColumn: { name: 'order_dinner_id', referencedColumnName: 'orderDinnerId' },
    inverseJoinColumn: { name: 'dinner_option_id', referencedColumnName: 'dinnerOptionId' },
  })
  dinnerOptions: DinnerOption[];
  */

  @ManyToOne(() => Dinner)
  @JoinColumn({ name: 'dinner_id', referencedColumnName: 'dinnerId' })
  dinner: Dinner;

  @ManyToOne(() => Style)
  @JoinColumn({ name: 'style_id', referencedColumnName: 'styleId' })
  style: Style;

  @OneToMany(() => OrderDinnerOption, o => o.orderDinner, {cascade: true})
  orderDinnerOptions: OrderDinnerOption[];
}
