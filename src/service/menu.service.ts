import { Dinner, DinnerOption, Style, StyleOption } from "@/model/entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class MenuService {

    constructor(
        @InjectRepository(Dinner) private readonly dinnerRepo: Repository<Dinner>,
        @InjectRepository(Style) private readonly styleRepo: Repository<Style>,
        @InjectRepository(DinnerOption) private readonly dinnerOptionRepo: Repository<DinnerOption>,
    ) {}

    async getAllDinners(): Promise<Dinner[]> {
        return await this.dinnerRepo.find();
    }

    async getDinnerById(dinnerId: number) {
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

    async getAllStyles(): Promise<Style[]> {
        return await this.styleRepo.find();
    }

    async getStylesWithDinnerId(dinnerId: number): Promise<Style[]> {
        return await this.dinnerRepo.findOne({
            relations: { styles: true },
            where: {
                dinnerId: dinnerId,
            },
        }).then(dinner => dinner.styles);
    }

    async getStyleById(styleId: number) {
        return await this.styleRepo.findOneBy({ styleId });
    }

    async getStyleOptions(styleId: number): Promise<StyleOption[]> {
        return await this.styleRepo.findOne({
            relations: { styleOptions: true },
            where: { styleId }
        }).then(style => style.styleOptions);
    }
}