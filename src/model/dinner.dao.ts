import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("DINNER")
export class DinnerDao {
    @PrimaryGeneratedColumn()
    dinnerId: number;

    @Column()
    dinnerName: string;

    @Column()
    dinnerPrice: string;

    @Column()
    dinnerDetail: string;
}