import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";  
import { OrderDinner } from "./OrderDinner";

export enum OrderState {
  CART = 0x00,
  WAITING = 0x10,
  COOKING = 0x21,
  IN_DELIVERY = 0x22,
  DONE = 0xFF,
}

@Entity("order", { schema: "cowball_mrdaebak" })
export class Order {
  @PrimaryGeneratedColumn('increment')
  @Column("int", { primary: true, name: "order_id" })
  orderId: number;

  @Column()
  userId: string;

  @Column("timestamp", { name: "order_date", nullable: true })
  orderDate: Date | null;

  @Column("timestamp", { name: "rsv_date", nullable: true })
  rsvDate: Date | null;

  @Column("int", { name: "order_state", nullable: true, default: OrderState.CART })
  orderState: OrderState; //number | null;

  @Column("varchar", { name: "delivery_address", nullable: true, length: 255 })
  deliveryAddress: string | null;

  @Column("varchar", { name: "phone_number", nullable: true, length: 50 })
  phoneNumber: string | null;

  @Column("varchar", { name: "card_number", nullable: true, length: 50 })
  cardNumber: string | null;

  @Column("int", { name: "total_price", nullable: true })
  totalPrice: number | null;

  @Column("int", { name: "payment_price", nullable: true })
  paymentPrice: number | null;

  @Column("varchar", { name: "request", nullable: true, length: 255 })
  request: string | null;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: User;

  @OneToMany(() => OrderDinner, (orderDinner) => orderDinner.order)
  orderDinners: OrderDinner[];
}