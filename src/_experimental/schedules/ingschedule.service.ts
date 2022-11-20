import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as moment from "moment";
import { Repository } from "typeorm";
import { IngSchedule } from "./ingschedule.entity";

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

        for(let date = moment(dateRange[0]); date.isSameOrBefore(toMoment); date.add(1, 'days')) {
            const dateString = moment(date).format('yyyy-MM-DD');
            const qb = this.ingScheduleRepo.createQueryBuilder();
            
            if(ingredientId !== undefined) qb.where({ ingredientId });
            const items: any[] = await qb.andWhere('date = :date', { date: dateString })
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

    public async setInAmount(date: Date, ingredientId: number, amount: number, mode: 'add'|'set') {
        const ingSch = await this.ingScheduleRepo.findOneBy({ date, ingredientId });

        if(!ingSch) {
            return await this.ingScheduleRepo.insert(<IngSchedule>{
                date,
                ingredientId,
                inAmount: amount,
            });
        } else {
            return await this.ingScheduleRepo.update(
                { date, ingredientId }, {
                    inAmount:
                        mode === 'add'
                            ? amount > 0 ? () => `in_amount + ${amount}` : () => `in_amount - ${-amount}`
                            : amount,
                }
            );
        }
        
    }

    public async getInAmount(date: Date, ingredientId?: number) {
        return await this.ingScheduleRepo.find({
            where: { date, ingredientId }
        });
    }

    public async pushRsvAmount(date: Date, ingredientId: number, addAmount: number) {
        console.log(`ID: ${ingredientId}`);
        const exist = await this.ingScheduleRepo.createQueryBuilder()
            .where(`ingredient_id = :id AND date = :date`, {
                date: moment(date).format('YYYY-MM-DD'),
                id: ingredientId,
            })
            .getOne();

        //console.log(exist);

        if (exist) {
            return await this.ingScheduleRepo.update({ date, ingredientId }, {
                rsvAmount: () => addAmount >= 0 ? `rsv_amount + ${addAmount}` : `rsv_amount - ${-addAmount}`
            });
        } else {
            return await this.ingScheduleRepo.insert({
                date,
                ingredientId,
                rsvAmount: addAmount,
            })
        }
    }
}