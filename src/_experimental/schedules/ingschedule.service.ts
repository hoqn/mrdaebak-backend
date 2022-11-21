import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as moment from "moment";
import { Repository } from "typeorm";
import { IngSchedule } from "./ingschedule.entity";

@Injectable()
export class IngScheduleService {
    constructor(
        @InjectRepository(IngSchedule) private readonly ingScheduleRepo: Repository<IngSchedule>,
    ) {}

    public async getIngSchedule(dateRange: [Date, Date], ingredientId?: number) {
        console.log('TIME ', dateRange[0]);
        return await this.ingScheduleRepo.createQueryBuilder('is')
            .where({ ingredientId })
            .andWhere('date >= :from AND date <= :to', {from: dateRange[0].toISOString(), to: dateRange[1].toISOString()})
            .getMany();
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

        if(exist) {
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