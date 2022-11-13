import { Exclude } from "class-transformer";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { UserGrade } from "../enum/userGrade.enum";
import { Client } from "./Client.super";
import { Order } from "./Order";

@Entity("user")
export class User  extends Client{
  override get _id() {
    return this.userId;
  }

  @PrimaryColumn("varchar", { length: 50 })
  userId: string;

  @Column("varchar", { length: 50 })
  userName: string;

  @Exclude()
  @Column("varchar", {length: 255 })
  password: string;

  @Column("varchar", { length: 255 })
  address: string | null;

  @Column("varchar", { length: 50 })
  phoneNumber: string | null;

  @Column("varchar", { length: 50 })
  cardNumber: string | null;

  @Column("int", { default: 0 })
  orderNumber: number;

  @CreateDateColumn({type: "timestamp"})
  joinDate: Date;

  @Column("int", { default: UserGrade.NORMAL })
  grade: UserGrade;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}
