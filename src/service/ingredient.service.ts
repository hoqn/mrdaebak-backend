import AppConfig from '@/config';

import { PageOptionsDto, PageResultDto, PageResultPromise } from "@/model/dto/common.dto";
import { DinnerIngredient, Ingredient, IngredientCategory, OrderDinner, StyleIngredient } from "@/model/entity";
import { IngSchedule } from "@/model/entity/ingschedule";
import { OrderDinnerOption } from "@/model/entity/OrderDinnerOption";
import { IngScheduleService } from "@/service/ingschedule.service";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as moment from "moment";
import { DataSource, MoreThan, Repository, UpdateQueryBuilder } from "typeorm";

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
            if (pageOptions.orderable) qb.orderBy(pageOptions.order_by, pageOptions.order_direction)
            qb.skip(pageOptions.skip).take(pageOptions.take);
        }

        const [items, count] = await qb.getManyAndCount();

        return new PageResultDto(pageOptions, count, items);
    }

    async getIngredient(ingredientId: number) {
        return this.ingredientRepo.findOneBy({ ingredientId });
    }
    /*
        async createIngredient(body: CreateIngredientDto) {
            return await this.ingredientRepo.save(<Ingredient>{
                ...body,
            });
        }
    
        async updateIngredient(ingredientId: number, body: UpdateIngredientDto) {
            return this.ingredientRepo.createQueryBuilder()
                .update().where({ ingredientId })
                .set(body)
                .execute();
        }
    */
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
            if (pageOptions.orderable) qb.orderBy(pageOptions.order_by, pageOptions.order_direction);
            qb.skip(pageOptions.skip).take(pageOptions.take);
        }

        const [items, count] = await qb.getManyAndCount();

        return new PageResultDto(pageOptions, count, items);
    }

    // Stock Application

    async calculateIngredientStockForOrder(orderId: number, addHook?: (ingredientId: number, addAmount: number) => Promise<void>) {
        const orderDinners = await this.dataSource.getRepository(OrderDinner).find({
            select: ['orderDinnerId'],
            where: { orderId },
        });

        const ingredients: Map<number, number> = new Map();

        for (let orderDinner of orderDinners) {
            await this.calculateIngredientStockForOrderDinner(orderDinner.orderDinnerId, (ingredientId, amount) => {
                ingredients.set(ingredientId, ingredients.get(ingredientId) ?? 0 + amount);
                console.log(ingredients);
            });
        }

        return ingredients;
    }

    async calculateIngredientStockForOrderDinner(orderDinnerId: number, addHook?: (ingredientId: number, amount: number) => void) {
        const ingredients: Map<number, number> = new Map();

        const addIng: (ingredientId: number, amount: number) => void
            = addHook ? addHook : (ingredientId: number, amount: number) => {
                ingredients.set(ingredientId,
                    ingredients.has(ingredientId)
                        ? ingredients.get(ingredientId) + amount
                        : amount
                );
            };

        const orderDinner = await this.dataSource.getRepository(OrderDinner).findOneBy({ orderDinnerId });

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

        console.log('Ingredients:', ingredients);

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

    public async setRsvAmount(ingredientId: number, amount: number, mode: SET_MODE, date: Date) {
        return this.setAmount(ingredientId, 'rsv', amount, mode, date);
    }

    public async setOutAmount(ingredientId: number, amount: number, mode: SET_MODE, date: Date) {
        return this.setAmount(ingredientId, 'out', amount, mode, date);
    }

    public async setInAmount(ingredientId: number, amount: number, mode: SET_MODE, date: Date) {
        return this.setAmount(ingredientId, 'in', amount, mode, date);
    }

    public async setOrderAmount(ingredientId: number, amount: number, mode: SET_MODE, date: Date) {
        return this.setAmount(ingredientId, 'order', amount, mode, date);
    }

    private async setAmount(ingredientId: number, field: 'in' | 'out' | 'rsv' | 'order', amount: number, mode: SET_MODE, date: Date) {
        const ingredientQuery = this.ingredientRepo.createQueryBuilder()
            .update().where({ ingredientId });

        if (field === 'in') {
            if (mode === 'set') {
                const { stock } = await this.ingredientRepo.findOne({
                    select: ['stock'],
                    where: { ingredientId },
                });
                this.ingScheduleService.setInAmount(date, ingredientId, amount, 'set');
                this.setStockQuery(ingredientQuery, amount - stock, 'add');
            } else {
                this.ingScheduleService.setInAmount(date, ingredientId, amount, 'add');
                this.setStockQuery(ingredientQuery, amount, 'add');
            }
        }

        else if (field === 'out') {
            if (mode === 'set') {
                const { stock } = await this.ingredientRepo.findOne({
                    select: ['stock'],
                    where: { ingredientId },
                });
                this.ingScheduleService.setOutAmount(date, ingredientId, amount, 'set');
                this.setStockQuery(ingredientQuery, - amount + stock, 'add');
            } else {
                this.ingScheduleService.setOutAmount(date, ingredientId, amount, 'add');
                this.setStockQuery(ingredientQuery, amount, 'add');
            }
        }

        else if (field === 'rsv') {
            return this.ingScheduleService.setRsvAmount(date, ingredientId, amount, mode);
        }

        else if (field === 'order') {
            return this.ingScheduleService.setOrderAmount(date, ingredientId, amount, mode);
        }

        console.log(ingredientQuery.getQueryAndParameters());

        return ingredientQuery.execute();
    }

    public async getOrderAmountByDate(date: Date) {
        return await this.ingScheduleService.getOrderAmountByDate(date);
    }

    public async copyAllOrderToInAmount(date: Date) {
        const orders = await this.dataSource.getRepository(IngSchedule).createQueryBuilder()
            .select(['ingredient_id', 'order_amount'])
            .where('date = :date', { date: moment(date).format('yyyy-MM-DD') })
            .getMany();

        for (let order of orders) {
            await this.setInAmount(order.ingredientId, order.orderAmount, 'add', date);
        }
    }

    public async moveRsvToOutAmount(ingredientId: number, amount: number, date: Date) {
        await Promise.all([
            this.setOutAmount(ingredientId, amount, 'add', date),
            this.setRsvAmount(ingredientId, -amount, 'add', date),
        ]);
    }

    //Utils
    public static getNextIngredientDeliveryDate(date: Date, includeThatDay: boolean): Date {
        const yoil = date.getDay();

        for (let i = includeThatDay ? 0 : 1; i <= 7; i++) {
            if (AppConfig.ingredientDeliveryDays[(yoil + i) % 7]) {
                return moment(date).add(i, 'days').toDate();
            }
        }

        return null;
    }

}