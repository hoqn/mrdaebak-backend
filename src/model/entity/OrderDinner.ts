import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne, PrimaryGeneratedColumn
} from "typeorm";
import { DinnerOption } from "./DinnerOption";
import { Order } from "./Order";

@Entity("order_dinner")
export class OrderDinner {
  @PrimaryGeneratedColumn("increment")
  orderDinnerId: number;

  @Column("int")
  orderId: number;

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

  @ManyToMany(() => DinnerOption, (dinnerOption) => dinnerOption.orderDinners)
  @JoinTable({
    name: 'order_dinner_option',
    joinColumn: { name: 'order_dinner_id', referencedColumnName: 'orderDinnerId' },
    inverseJoinColumn: { name: 'dinner_option_id', referencedColumnName: 'dinnerOptionId' },
  })
  dinnerOptions: DinnerOption[];
}
