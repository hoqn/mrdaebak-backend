import { IdDuplicatedException, OutOfLimitException } from "@/exception";
import { PageOptionsDto, PageResultDto, PageResultPromise } from "@/model/dto/common.dto";
import { CreateIngredientReq, UpdateIngredientReq, UpdateIngredientStockDto } from "@/model/dto/ingredient.dto";
import { Dinner, DinnerIngredient, DinnerOption, Ingredient, IngredientCategory, Order, OrderDinner, Style, StyleIngredient } from "@/model/entity";
import { OrderDinnerOption } from "@/model/entity/OrderDinnerOption";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntityTarget, MoreThan, ObjectType, Repository } from "typeorm";

@Injectable()
export class IngredientService {
    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(Ingredient) private readonly ingredientRepo: Repository<Ingredient>,
        @InjectRepository(IngredientCategory) private readonly ingCategoryRepo: Repository<IngredientCategory>,
    ) { }

    // Ingredients

    async getAllIngredients(
        pageOptions: PageOptionsDto,
    ) {
        return this.getIngredientsBy({}, pageOptions);
    }

    async getDinnerIngredients(dinnerId: number) {
        return await this.dataSource.getRepository(DinnerIngredient)
            .find({
                relations: { ingredient: true },
                where: { dinnerId }
            });
    }

    async getStyleIngredients(styleId: number) {
        return await this.dataSource.getRepository(StyleIngredient)
            .find({
                relations: { ingredient: true },
                where: { styleId }
            });
    }

    async getIngredientsBy(
        query: {
            ingredientName?: string,
            dinnerId?: number,
            styleId?: number,
        },
        pageOptions?: PageOptionsDto,
    ): PageResultPromise<Ingredient> {
        const qb = this.ingredientRepo.createQueryBuilder('i');

        if (query.dinnerId !== undefined) {
            qb
                .innerJoin('dinner_ingredient', 'di', 'i.ingredient_id=di.ingredient_id')
                .innerJoin('dinner', 'd', 'di.dinner_id=d.dinner_id')
                .where('di.dinner_id=:dinnerId', { dinnerId: query.dinnerId });
        }

        if (query.styleId !== undefined) {
            qb
                .innerJoin('style_ingredient', 'si', 'i.ingredient_id=si.ingredient_id')
                .innerJoin('style', 's', 'si.style_id=s.style_id')
                .where('si.style_id=:styleId', { styleId: query.styleId });
        }

        if (query.ingredientName !== undefined) qb.andWhere({ ingredientName: query.ingredientName });

        if (pageOptions !== undefined) {
            if (pageOptions.orderable) qb.orderBy(pageOptions.orderBy, pageOptions.orderDirection)
            qb.skip(pageOptions.skip).take(pageOptions.take);
        }

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
        
        const result = await qb.execute();

        return result;
    }

    // Categories

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

        if (query.categoryName !== undefined) qb.andWhere({ categoryName: query.categoryName });

        if (pageOptions.orderable) qb.orderBy(pageOptions.orderBy, pageOptions.orderDirection);
        qb.skip(pageOptions.skip).take(pageOptions.take);

        const [items, count] = await qb.getManyAndCount();

        return new PageResultDto(pageOptions, count, items);
    }

    // Stocks

    async setIngredientTodayStock(ingredientId: number, amount: number, mode: 'ADD' | 'SET') {
        const current = await this.ingredientRepo.findOne({
            select: {
                prevStock: true,
                todayArrived: true,
                todayOut: true,
            },
            where: { ingredientId }
        });

        if(mode === 'ADD') current.todayArrived += amount;
        else current.todayArrived = amount;

        if (current.todayArrived < 0 || current.currentStock < 0)
            throw new OutOfLimitException();

        await this.ingredientRepo.update({ ingredientId }, {
            todayArrived: current.todayArrived,
        });
        
        return { ingredientId, ...current };
    }
    
    // Ingredients Order

    async getIngredientOrderStocks(pageOptions: PageOptionsDto) {
        const qb = this.ingredientRepo.createQueryBuilder('i')
            .select().where({ orderedNumber: MoreThan(0) });

        if (pageOptions.orderable) qb.orderBy(pageOptions.orderBy, pageOptions.orderDirection);
        qb.skip(pageOptions.skip).take(pageOptions.take);

        const [items, count] = await qb.getManyAndCount();

        return new PageResultDto(pageOptions, count, items);
    }

    async setIngredientOrderStock(ingredientId: number, amount: number, mode: 'ADD' | 'SET') {
        const current = await this.ingredientRepo.findOne({
            select: {
                orderedNumber: true,
            },
            where: { ingredientId }
        });

        if(mode === 'ADD') current.orderedNumber += amount;
        else current.orderedNumber = amount;

        if (current.orderedNumber < 0)
            throw new OutOfLimitException();

        await this.ingredientRepo.update({ ingredientId }, {
            orderedNumber: current.orderedNumber,
        });

        return { ingredientId, ...current };
    }

    async receiveAllIngredientOrderStock() {
        this.ingredientRepo.update(
            { orderedNumber: MoreThan(0) },
            { todayArrived: () => `today_arrived + orderd_number`, orderedNumber: 0 }
        )
    }

    // Stock Applications

    async safeDecreaseIngredientStockForOrder(orderId: number): Promise<boolean> {
        const ingredients = await this.calculateIngredientStockForOrder(orderId);

        for(let [ingredientId, amount] of ingredients.entries()) {
            const { currentStock } = await this.ingredientRepo.findOne({
                select: { currentStock: true },
                where: { ingredientId },
            });

            if (currentStock - amount < 0)
                return false; // 불가
        }

        // 가능

        for(let [ingredientId, amount] of ingredients.entries()) {
            await this.ingredientRepo.update({ ingredientId }, {
                todayOut: () => `today_out - ${amount}`
            });
        }

        return true;
    }

    async calculateIngredientStockForOrder(orderId: number) {
        const ingredients: Map<number, number> = new Map();

        const orderDinners = await this.dataSource.getRepository(OrderDinner).find({
            where: { orderId }
        });

        const addIng = (ingredientId: number, addAmount: number) => {
            if(ingredients[ingredientId] === undefined) ingredients[ingredientId] = 0;
            ingredients[ingredientId] += addAmount;
        }

        for(let orderDinner of orderDinners) {
            // Dinner
            const di = await this.dataSource.getRepository(DinnerIngredient).findOneBy({
                dinnerId: orderDinner.dinnerId
            });
            addIng(di.ingredientId, di.amount);

            // Style
            const si = await this.dataSource.getRepository(StyleIngredient).findOneBy({
                styleId: orderDinner.styleId
            });
            addIng(si.ingredientId, si.amount);

            // Options
            const orderOptions = await this.dataSource.getRepository(OrderDinnerOption).find({
                relations: { dinnerOption: true },
                where: { orderDinnerId: orderDinner.orderDinnerId }
            });
            for(let orderOption of orderOptions) {
                addIng(orderOption.dinnerOption.ingredientId, orderOption.dinnerOption.ingredientAmount);
            }
        }

        return ingredients;
    }

}