import {
  BeforeUpdate,
  Column, Entity, JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { OrderState } from "../enum";
import { OrderDinner } from "./OrderDinner";
import { User } from "./User";

@Entity("order")
export class Order {
  @PrimaryGeneratedColumn('increment')
  orderId: number;

  @Column()
  userId: string;

  @Column("timestamp", { nullable: true })
  orderDate: Date | null;

  @Column("timestamp", { nullable: true })
  rsvDate: Date | null;

  @Column("int", { default: OrderState.CART })
  orderState: OrderState = OrderState.CART;

  @Column("varchar", { nullable: true, length: 255 })
  deliveryAddress: string | null;

  @Column("varchar", { nullable: true, length: 50 })
  phoneNumber: string | null;

  @Column("varchar", { nullable: true, length: 50 })
  cardNumber: string | null;

  @Column("int", { nullable: true })
  totalPrice: number | null;

  @Column("int", { nullable: true })
  paymentPrice: number | null;

  @Column("varchar", { length: 255, default: "" })
  request: string = '';

  // Relations

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: User;

  @OneToMany(() => OrderDinner, (orderDinner) => orderDinner.order)
  orderDinners: OrderDinner[];
}