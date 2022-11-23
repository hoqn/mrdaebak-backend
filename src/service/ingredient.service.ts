import { IdDuplicatedException, OutOfLimitException } from "@/exception";
import { PageOptionsDto, PageResultDto, PageResultPromise } from "@/model/dto/common.dto";
import { CreateIngredientReq, UpdateIngredientReq, UpdateIngredientStockDto } from "@/model/dto/ingredient.dto";
import { Dinner, DinnerIngredient, DinnerOption, Ingredient, IngredientCategory, Order, OrderDinner, Style, StyleIngredient } from "@/model/entity";
import { OrderDinnerOption } from "@/model/entity/OrderDinnerOption";
import { IngScheduleService } from "@/_experimental/schedules/ingschedule.service";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntityTarget, MoreThan, ObjectType, QueryBuilder, Repository, UpdateQueryBuilder } from "typeorm";

type SET_MODE = 'set' | 'add';

@Injectable()
export class IngredientService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly ingScheduleService: IngScheduleService,
        @InjectRepository(Ingredient) private readonly ingredientRepo: Repository<Ingredient>,
        @InjectRepository(IngredientCategory) private readonly ingCategoryRepo: Repository<IngredientCategory>,
    ) { }

    // Ingredients

    public async getAllIngredients(pageOptions?: PageOptionsDto) {
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

    async getIngredient(ingredientId: number) {
        return this.ingredientRepo.findOneBy({ ingredientId });
    }

    async createIngredient(body: CreateIngredientReq) {
        return await this.ingredientRepo.save(body.toEntity());
    }

    async updateIngredient(ingredientId: number, body: UpdateIngredientReq) {
        return this.ingredientRepo.createQueryBuilder()
            .update().where({ ingredientId })
            .set(body)
            .execute();
    }

    // Categories

    async getAllIngredientCategories(pageOptions?: PageOptionsDto) {
        return this.getIngredientCategoriesBy({}, pageOptions);
    }

    async getIngredientCategoriesBy(
        query: {
            categoryName?: string,
        },
        pageOptions?: PageOptionsDto
    ) {
        const qb = this.ingCategoryRepo.createQueryBuilder('c');

        if (query.categoryName !== undefined) qb.andWhere({ categoryName: query.categoryName });

        if (pageOptions !== undefined) {
            if (pageOptions.orderable) qb.orderBy(pageOptions.orderBy, pageOptions.orderDirection);
            qb.skip(pageOptions.skip).take(pageOptions.take);
        }

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

        if (mode === 'ADD') current.todayArrived += amount;
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

        if (mode === 'ADD') current.orderedNumber += amount;
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

    // Stock Application

    async calculateIngredientStockForOrder(orderId: number, addHook?: (ingredientId: number, addAmount: number) => Promise<void>) {
        const ingredients: Map<number, number> = new Map();

        const orderDinners = await this.dataSource.getRepository(OrderDinner).find({
            where: { orderId }
        });

        const addIng = async (ingredientId: number, addAmount: number) => {
            ingredients.set(ingredientId,
                ingredients.has(ingredientId)
                    ? ingredients.get(ingredientId) + addAmount
                    : addAmount
            );

            if (addHook)
                await addHook(ingredientId, addAmount);
        }

        for (let orderDinner of orderDinners) {

            // Dinner
            const dis = await this.dataSource.getRepository(DinnerIngredient).findBy({
                dinnerId: orderDinner.dinnerId
            });
            for (let di of dis) {
                await addIng(di.ingredientId, di.amount);
            }

            // Style
            const sis = await this.dataSource.getRepository(StyleIngredient).findBy({
                styleId: orderDinner.styleId
            });
            for (let si of sis) {
                await addIng(si.ingredientId, si.amount);
            }

            // Options
            const orderOptions = await this.dataSource.getRepository(OrderDinnerOption).find({
                relations: { dinnerOption: true },
                where: { orderDinnerId: orderDinner.orderDinnerId }
            });
            for (let orderOption of orderOptions) {
                await addIng(orderOption.dinnerOption.ingredientId, orderOption.dinnerOption.ingredientAmount * orderOption.amount);
            }
        }

        return ingredients;
    }

    /**
     * Stock Management - CurrentStock
     */

    // 주의해서 사용
    public async setStock(ingredientId: number, amount: number, mode: SET_MODE) {
        return this.setStockQuery(undefined, amount, mode)
            .where({ ingredientId })
            .execute();
    }

    public async getStock(ingredientId: number) {
        return this.ingredientRepo.findOne({
            select: ['ingredientId', 'stock'],
            where: { ingredientId }
        });
    }

    public async getStocks() {
        return this.ingredientRepo.find({
            select: ['ingredientId', 'stock']
        });
    }

    private setStockQuery(queryBuilder: UpdateQueryBuilder<Ingredient> | undefined, amount: number, mode: SET_MODE) {
        const qb = queryBuilder ? queryBuilder : this.ingredientRepo.createQueryBuilder().update();
        return qb.set({
            stock: mode === 'set'
                ? amount
                : () => `stock + ${amount}`
        });
    }

    /**
     * Stock Management
     */

    public async setRsvAmount(ingredientId: number, amount: number, mode: SET_MODE) {
        return this.setAmount(ingredientId, 'rsv', amount, mode);
    }

    public async setOutAmount(ingredientId: number, amount: number, mode: SET_MODE) {
        return this.setAmount(ingredientId, 'out', amount, mode);
    }

    public async setInAmount(ingredientId: number, amount: number, mode: SET_MODE) {
        return this.setAmount(ingredientId, 'in', amount, mode);
    }

    public async setOrderAmount(ingredientId: number, amount: number, mode: SET_MODE) {
        return this.setAmount(ingredientId, 'order', amount, mode);
    }

    public async getOrderAmountByOrderDate(date: Date) {
        return await this.ingScheduleService.getOrderAmountByOrderDate(date);
    }

    private async setAmount(ingredientId: number, field: 'in' | 'out' | 'rsv' | 'order', amount: number, mode: SET_MODE) {
        const ingredientQuery = this.ingredientRepo.createQueryBuilder()
            .update().where({ ingredientId });

        if (field === 'in') {
            if (mode === 'set') {
                const { stock } = await this.ingredientRepo.findOne({
                    select: ['stock'],
                    where: { ingredientId },
                });
                this.ingScheduleService.setInAmount(new Date(), ingredientId, amount, 'set');
                this.setStockQuery(ingredientQuery, amount - stock, 'add');
            } else {
                this.ingScheduleService.setInAmount(new Date(), ingredientId, amount, 'add');
                this.setStockQuery(ingredientQuery, amount, 'add');
            }
        }

        else if (field === 'out') {
            if (mode === 'set') {
                const { stock } = await this.ingredientRepo.findOne({
                    select: ['stock'],
                    where: { ingredientId },
                });
                this.ingScheduleService.setOutAmount(new Date(), ingredientId, amount, 'set');
                this.setStockQuery(ingredientQuery, - amount + stock, 'add');
            } else {
                this.ingScheduleService.setOutAmount(new Date(), ingredientId, amount, 'add');
                this.setStockQuery(ingredientQuery, amount, 'add');
            }
        }

        else if (field === 'rsv') {
            return this.ingScheduleService.setRsvAmount(new Date(), ingredientId, amount, mode);
        }

        else if (field === 'order') {
            return this.ingScheduleService.setOrderAmount(new Date(), ingredientId, amount, mode);
        }

        console.log(ingredientQuery.getQueryAndParameters());

        return ingredientQuery.execute();
    }

}