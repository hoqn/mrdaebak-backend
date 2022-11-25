import { PageOptionsDto, PageResultDto, PageResultPromise } from "@/model/dto/common.dto";
import { Dinner, DinnerOption, Style } from "@/model/entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class MenuService {

    constructor(
        @InjectRepository(Dinner) private readonly dinnerRepo: Repository<Dinner>,
        @InjectRepository(Style) private readonly styleRepo: Repository<Style>,
        @InjectRepository(DinnerOption) private readonly dinnerOptionRepo: Repository<DinnerOption>,
    ) { }

    async getAllDinners(
        pageOptions: PageOptionsDto
    ): PageResultPromise<Dinner> {
        const qb = this.dinnerRepo.createQueryBuilder()
            .select();

        if (pageOptions.orderable) qb.orderBy(pageOptions.orderBy, pageOptions.orderDirection);
        qb.skip(pageOptions.skip).take(pageOptions.take);

        const [items, count] = await qb.getManyAndCount();

        return new PageResultDto(pageOptions, count, items);
    }

    async getDinnerById(dinnerId: number, widen: boolean = false) {
        if (widen)
            return await this.dinnerRepo.findOne({
                relations: {
                    dinnerOptions: true
                },
                where: {
                    dinnerId
                }
            });
        return await this.dinnerRepo.findOneBy({ dinnerId });
    }

    async getDinnerOptions(dinnerId: number): Promise<DinnerOption[]> {
        return await this.dinnerRepo.findOne({
            relations: { dinnerOptions: true },
            where: { dinnerId }
        }).then(dinner => dinner.dinnerOptions);
    }

    async getDinnerOption(dinnerOptionId: number): Promise<DinnerOption> {
        return await this.dinnerOptionRepo.findOneBy({ dinnerOptionId });
    }

    async getAllStyles(
        pageOptions: PageOptionsDto,
    ): PageResultPromise<Style> {
        return await this.getStylesBy({}, pageOptions);
    }

    async getStylesBy(
        query: { dinnerId?: number },
        pageOptions: PageOptionsDto,
    ): PageResultPromise<Style> {
        const qb = this.styleRepo.createQueryBuilder('s');

        if (query.dinnerId !== undefined) {
            qb
                .innerJoin('dinner_style', 'ds', 's.style_id=ds.style_id')
                .innerJoin('dinner', 'd', 'ds.dinner_id=d.dinner_id')
                .where('ds.dinner_id=:dinnerId', { dinnerId: query.dinnerId });
        }

        if (pageOptions.orderable) qb.orderBy(pageOptions.orderBy, pageOptions.orderDirection);
        qb.skip(pageOptions.skip).take(pageOptions.take);

        const [items, count] = await qb.getManyAndCount();

        return new PageResultDto(pageOptions, count, items);
    }

    async getStyleById(styleId: number) {
        return await this.styleRepo.findOneBy({ styleId });
    }
    /*
        async getStyleOptions(styleId: number): Promise<StyleOption[]> {
            return await this.styleRepo.findOne({
                relations: { styleOptions: true },
                where: { styleId }
            }).then(style => style.styleOptions);
        }
    */
}