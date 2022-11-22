import { Ingredient } from "@/model/entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('ing_schedule')
export class IngSchedule {
    @PrimaryColumn('date', { name: 'date'})
    public date: Date;

    @PrimaryColumn('int', { name: 'ingredient_id' })
    public ingredientId: number;

    @Column('int', { name: 'rsv_amount', default: 0 })
    public rsvAmount: number;
    
    @Column('int', { name: 'order_amount', default: 0 })
    public orderAmount: number;

    @Column('int', { name: 'in_amount', default: 0 })
    public inAmount: number;

    @Column('int', { name: 'out_amount', default: 0 })
    public outAmount: number;

    @Column('int', { name: 'prev_amount', default: 0 })
    public prevAmount: number;
    
    // Relations
    
    @ManyToOne(() => Ingredient)
    @JoinColumn({ name: 'ingredient_id', referencedColumnName: 'ingredientId' })
    public ingredient: Ingredient;
}