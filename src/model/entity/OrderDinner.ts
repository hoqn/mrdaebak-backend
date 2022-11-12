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

@Entity("order_dinner", { schema: "cowball_mrdaebak" })
export class OrderDinner {
  @PrimaryGeneratedColumn('increment') @Column("int", { primary: true, name: "order_dinner_id" })
  orderDinnerId: number;

  @Column("int", { primary: true, name: "order_id" })
  orderId: number;

  @Column("int", { name: "total_dinner_price", nullable: true })
  totalDinnerPrice: number | null;

  @Column("int", { name: "degree_id", nullable: true })
  degreeId: number | null;

  @Column("int", { name: "dinner_id" })
  dinnerId: number;

  @Column("int", { name: "style_id" })
  styleId: number;

  @ManyToOne(() => Order, (order) => order.orderDinners)
  @JoinColumn([{ name: "order_id", referencedColumnName: "orderId" }])
  order: Order;

  @ManyToMany(() => DinnerOption, (dinnerOption) => dinnerOption.orderDinners)
  @JoinTable({
    name: 'order_dinner_option',
    joinColumns: [
      { name: 'order_dinner_id', referencedColumnName: 'orderDinnerId' },
      { name: 'order_id', referencedColumnName: 'orderId' },
    ],
    inverseJoinColumns: [
      { name: 'dinner_option_id', referencedColumnName: 'dinnerOptionId' },
    ],
  })
  dinnerOptions: DinnerOption[];
}
