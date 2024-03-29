import { AfterInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { DinnerOption } from "./DinnerOption";
import { OrderDinner } from "./OrderDinner";

@Entity("order_dinner_option")
export class OrderDinnerOption {
    @PrimaryColumn("int", { name: "order_dinner_id" })
    orderDinnerId: number;

    @PrimaryColumn("int", { name: "dinner_option_id" })
    dinnerOptionId: number;

    @Column("int")
    amount: number;

    // Relations

    @ManyToOne(() => OrderDinner, o => o.orderDinnerOptions, { orphanedRowAction: 'delete' })
    @JoinColumn({ name: "order_dinner_id", referencedColumnName: "orderDinnerId" })
    orderDinner: OrderDinner;

    @ManyToOne(() => DinnerOption, o => o.dinnerOptionId, { orphanedRowAction: 'delete' })
    @JoinColumn({ name: "dinner_option_id", referencedColumnName: "dinnerOptionId", })
    dinnerOption: DinnerOption;
}