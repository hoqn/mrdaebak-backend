import { CONFIG } from "@/config";
import {
  Column,
  Entity, JoinColumn,
  ManyToMany,
  ManyToOne, OneToMany, PrimaryGeneratedColumn
} from "typeorm";
import { Dinner } from "./Dinner";
import { IngredientCategory } from "./IngredientCategory";
import { Style } from "./Style";
import { StyleIngredient } from "./StyleIngredient";

@Entity("ingredient")
export class Ingredient {
  @PrimaryGeneratedColumn('increment')
  ingredientId: number;

  @Column("int")
  categoryId: number;

  @Column("varchar", { length: 50 })
  ingredientName: string;

  /**
   * 발주 시 가격
   */
  @Column("int")
  ingredientPrice: number;

  /**
   * 전일 재고: 어제까지의 양
   */
  @Column("int", { default: 0 })
  prevStock: number;

  /**
   * 당일 입고: 오늘 배송오기로 한 양
   */
  @Column("int", { default: 0 })
  todayArrived: number;

  /**
   * 당일 출고: 오늘 현재까지 나간 양
   */
  @Column("int", { default: 0 })
  todayOut: number;

  /**
   * 현재 재고: 현재의 양
   */
  //@Column("int", { default: 0 }) //
  //currentStock: number;

  @Column("int", { default: 0 })
  /*public get currentStock(): number {
    if(
      this.prevStock === undefined ||
      this.todayArrived === undefined ||
      this.todayOut === undefined
    ){
      return undefined;
    }
    else {
      const result = this.prevStock + this.todayArrived - this.todayOut;
      return result;
    }
  }*/
  currentStock: number;

  public static readonly CURRENT_STOCK_CALC_QUERY = 'prev_stock + today_arrived - today_out';

  /**
   * 발주 수량: 발주되어 배송을 기다리는 양
   */
  @Column("int", { default: 0 })
  orderedNumber: number;

  // Relations
  
  @ManyToOne(() => IngredientCategory, o => o.ingredients )
  @JoinColumn({ name: "category_id", referencedColumnName: "categoryId" })
  category: IngredientCategory;

  @ManyToMany(() => Dinner, (dinner) => dinner.ingredients)
  dinners: Dinner[];

  @OneToMany(() => StyleIngredient, o => o.ingredient)
  styleIngredients: StyleIngredient[];
}
