import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as moment from "moment";
import { Between, Repository } from "typeorm";
import { IngSchedule } from "./ingschedule.entity";

type SET_MODE = 'add' | 'set';

@Injectable()
export class IngScheduleService {
    constructor(
        @InjectRepository(IngSchedule) private readonly ingScheduleRepo: Repository<IngSchedule>,
    ) { }

    public async getIngSchedule(dateRange: [Date, Date], ingredientId?: number) {
        const qb = this.ingScheduleRepo.createQueryBuilder()

        if (ingredientId !== undefined) qb.where({ ingredientId });

        return await qb
            .andWhere(`date >= '${moment(dateRange[0]).format('yyyy-MM-DD')}'`)
            .andWhere(`date <= '${moment(dateRange[1]).format('yyyy-MM-DD')}'`)
            .getMany();
    }

    public async getIngScheduleGroupByDate(dateRange: [Date, Date], ingredientId?: number) {
        let result: any[] = [];

        const toMoment = moment(dateRange[1]);

        for (let date = moment(dateRange[0]); date.isSameOrBefore(toMoment); date.add(1, 'days')) {
            const dateString = moment(date).format('yyyy-MM-DD');
            const qb = this.ingScheduleRepo.createQueryBuilder();

            if (ingredientId !== undefined)
                qb.where({ ingredientId });

            const items: any[] = await qb
                .andWhere('date = :date', { date: dateString })
                .select('ingredient_id as ingredientId')
                .addSelect('rsv_amount as rsvAmount')
                .addSelect('in_amount as inAmount')
                .addSelect('out_amount as outAmount')
                .addSelect('order_amount as orderAmount')
                .execute();

            result.push({
                date: dateString,
                items: items,
            });
        }

        return result;
    }

    // Update

    public async setInAmount(date: Date, ingredientId: number, amount: number, mode: SET_MODE) {
        this.setAmount(date, 'in_amount', ingredientId, amount, mode);
    }

    public async setOutAmount(date: Date, ingredientId: number, amount: number, mode: SET_MODE) {
        this.setAmount(date, 'out_amount', ingredientId, amount, mode);
    }

    public async setRsvAmount(date: Date, ingredientId: number, amount: number, mode: SET_MODE) {
        this.setAmount(date, 'rsv_amount', ingredientId, amount, mode);
    }

    public async setOrderAmount(date: Date, ingredientId: number, amount: number, mode: SET_MODE) {
        this.setAmount(date, 'order_amount', ingredientId, amount, mode);
    }

    public async getOrderAmountByOrderDate(date: Date) {
        return await this.ingScheduleRepo.createQueryBuilder()
            .where(`date = :date`)
            .setParameter('date', moment(date).format('yyyy-MM-DD'))
            .getMany()
            .then(result =>
                result.map(r => <object>{ ingredientId: r.ingredientId, orderAmount: r.orderAmount })
            );
    }

    public async getOrderAmountByDeliveredDate(date: Date) {
        throw new Error("개발 중");
    }

    private async setAmount(date: Date, field: 'rsv_amount' | 'in_amount' | 'out_amount' | 'order_amount', ingredientId: number, amount: number, mode: SET_MODE) {
        const dateString = moment(date).format('yyyy-MM-DD');

        const ingSch = await this.ingScheduleRepo.createQueryBuilder()
            .where('date = :date AND ingredient_id = :ingredientId')
            .setParameters({
                date: dateString,
                ingredientId: ingredientId,
            })
            .getCount();

        if (ingSch === 0) {
            return await this.ingScheduleRepo.query(`
                INSERT
                INTO ing_schedule
                ( date, ingredient_id, ${field} ) VALUES ( ${dateString}, ${ingredientId}, ${amount} );
            `);
        } else {
            return await this.ingScheduleRepo.query(`
                UPDATE ing_schedule
                SET ${field} = ${ mode === 'set' ? amount : `${field} + ${amount}` }
                WHERE date = '${dateString}' AND ingredient_id = ${ingredientId}
            `);
        }
    }
}