import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn
} from "typeorm";
import { DinnerOption } from "./DinnerOption";
import { Order } from "./Order";
import { OrderDinnerOption } from "./OrderDinnerOption";
import { SteakDonenessDegree } from "./SteakDonenessDegree";

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
  @JoinColumn([{ name: "order_id", referencedColumnName: "orderId" }])
  order: Order;

  @ManyToOne(() => SteakDonenessDegree)
  @JoinColumn({ name: "degree_id", referencedColumnName: "degreeId" })
  degree: SteakDonenessDegree;

  /*
  @ManyToMany(() => DinnerOption, (dinnerOption) => dinnerOption.orderDinners)
  @JoinTable({
    name: 'order_dinner_option',
    joinColumn: { name: 'order_dinner_id', referencedColumnName: 'orderDinnerId' },
    inverseJoinColumn: { name: 'dinner_option_id', referencedColumnName: 'dinnerOptionId' },
  })
  dinnerOptions: DinnerOption[];
  */

  @OneToMany(() => OrderDinnerOption, o => o.orderDinner)
  dinnerOptions: OrderDinnerOption[];
}
