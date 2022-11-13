import { AfterInsert, Entity, OneToOne, PrimaryColumn } from "typeorm";
import { OrderDinner } from "./OrderDinner";

@Entity("order_dinner_option")
export class OrderDinnerOption {
    @PrimaryColumn("int")
    orderDinnerId: number;

    @PrimaryColumn("int")
    dinnerOptionId: number;
}