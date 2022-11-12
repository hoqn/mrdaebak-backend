import { Column, Entity, OneToMany } from "typeorm";
import { Order } from "./Order";

@Entity("user", { schema: "cowball_mrdaebak" })
export class User {
  @Column("varchar", { primary: true, name: "user_id", length: 50 })
  userId: string;

  @Column("varchar", { name: "user_name", nullable: true, length: 50 })
  userName: string | null;

  @Column("varchar", { name: "password", nullable: true, length: 255 })
  password: string | null;

  @Column("varchar", { name: "address", nullable: true, length: 255 })
  address: string | null;

  @Column("varchar", { name: "phone_number", nullable: true, length: 50 })
  phoneNumber: string | null;

  @Column("varchar", { name: "card_number", nullable: true, length: 50 })
  cardNumber: string | null;

  @Column("int", { name: "order_number", nullable: true })
  orderNumber: number | null;

  @Column("timestamp", { name: "join_date", nullable: true })
  joinDate: Date | null;

  @Column("int", { name: "grade", nullable: true })
  grade: number | null;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}
