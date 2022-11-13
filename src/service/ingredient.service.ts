import { PageOptionsDto, PageResultDto, PageResultPromise } from "@/model/dto/common.dto";
import { CreateIngredientReq, UpdateIngredientReq } from "@/model/dto/ingredient.dto";
import { DinnerIngredient, Ingredient, IngredientCategory } from "@/model/entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class IngredientService {
    constructor(
        @InjectRepository(Ingredient) private readonly ingredientRepo: Repository<Ingredient>,
        @InjectRepository(IngredientCategory) private readonly ingCategoryRepo: Repository<IngredientCategory>,
    ) {}

    async getAllIngredients(
        pageOptions: PageOptionsDto,
    ) {
        return this.getIngredientsBy({}, pageOptions);
    }

    async getIngredientsBy(
        query: {
            ingredientName?: string,
            dinnerId?: number,
            styleId?: number,  
        },
        pageOptions: PageOptionsDto,
    ): PageResultPromise<Ingredient> {
        const qb = this.ingredientRepo.createQueryBuilder('i');

        if(query.dinnerId !== undefined) {
            qb
                .innerJoin('dinner_ingredient', 'di', 'i.ingredient_id=di.ingredient_id')
                .innerJoin('dinner', 'd', 'di.dinner_id=d.dinner_id')
                .where('di.dinner_id=:dinnerId', { dinnerId: query.dinnerId });
        }

        if(query.styleId !== undefined) {
            qb
                .innerJoin('style_ingredient', 'si', 'i.ingredient_id=si.ingredient_id')
                .innerJoin('style', 's', 'si.style_id=s.style_id')
                .where('si.style_id=:styleId', { styleId: query.styleId });
        }
        
        if(query.ingredientName !== undefined) qb.andWhere({ ingredientName: query.ingredientName });

        if(pageOptions.orderable) qb.orderBy(pageOptions.orderBy, pageOptions.orderDirection)
        qb.skip(pageOptions.skip).take(pageOptions.take);

        const [items, count] = await qb.getManyAndCount();

        return new PageResultDto(pageOptions, count, items);
    }

    async getIngredientById(ingredientId: number) {
        return this.ingredientRepo.findOneBy({ ingredientId });
    }

    async addNewIngredient(body: CreateIngredientReq) {
        return await this.ingredientRepo.save(body.toEntity());
    }

    async updateIngredient(ingredientId: number, body: UpdateIngredientReq) {
        const qb = this.ingredientRepo.createQueryBuilder()
            .update().where({ ingredientId }).set(body);
        const result = qb.execute();

        return result;
    }



    async getAllIngredientCategories(        
        pageOptions: PageOptionsDto
    ) {
        return this.getIngredientCategoriesBy({}, pageOptions);
    }

    async getIngredientCategoriesBy(
        query: {
            categoryName?: string,
        },
        pageOptions: PageOptionsDto
    ) {
        const qb = this.ingCategoryRepo.createQueryBuilder('c');

        if(query.categoryName !== undefined) qb.andWhere({ categoryName: query.categoryName });

        if(pageOptions.orderable) qb.orderBy(pageOptions.orderBy, pageOptions.orderDirection);
        qb.skip(pageOptions.skip).take(pageOptions.take);

        const [items, count] = await qb.getManyAndCount();

        return new PageResultDto(pageOptions, count, items);
    }
}