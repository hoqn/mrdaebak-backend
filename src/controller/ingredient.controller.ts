import AppConfig from "@/config";
import { PageOptionsDto } from "@/model/dto/common.dto";
import { UpdateIngredientStockDto } from "@/model/dto/ingredient.dto";
import { IngredientService } from "@/service";
import { IngScheduleService } from "@/service/ingschedule.service";
import { Body, Controller, Get, NotFoundException, Param, Post, Put, Query } from "@nestjs/common";
import * as moment from "moment";

@Controller('ingredients')
export class IngredientController {
    constructor(
        private readonly ingredientService: IngredientService,
        private readonly ingScheduleService: IngScheduleService,
    ) { }

    @Get('orders/delivered-day')
    async getDeliveredDay() {
        return AppConfig.ingredientDeliveryDays;
    }

    @Get('schedule')
    public async getSchedules(
        @Query('date_from') dateFrom: string | any,
        @Query('date_to') dateTo: string | any,
        @Query('ingredient_id') ingredientId?: number,
    ) {
        let d1 = dateFrom ? new Date(dateFrom) : new Date();
        let d2 = dateTo ? new Date(dateTo) : new Date();

        return await this.ingScheduleService.getIngScheduleGroupByDate([d1, d2], Number.isNaN(ingredientId) ? undefined : ingredientId);
    }


    @Get('items')
    async getIngredients(
        @Query('dinner_id') dinnerId?: number,
        @Query('style_id') styleId?: number,
        @Query() pageOptions?: PageOptionsDto,
    ) {
        const ingredients = await this.ingredientService.getIngredientsBy({
            dinnerId: dinnerId ? dinnerId : undefined,
            styleId: styleId ? styleId : undefined,
        }, pageOptions);

        if (!ingredients) throw new NotFoundException();

        return ingredients;
    }

    @Get('dinner/:dinnerId')
    async getDinnerIngredients(
        @Param('dinnerId') dinnerId: number,
    ) {
        const dIngredients = await this.ingredientService.getDinnerIngredients(dinnerId);

        if (!dIngredients) throw new NotFoundException();

        return dIngredients;
    }
    @Get('style/:styleId')
    async getStyleIngredients(
        @Param('styleId') styleId: number,
    ) {
        const dIngredients = await this.ingredientService.getStyleIngredients(styleId);

        if (!dIngredients) throw new NotFoundException();

        return dIngredients;
    }
    /*
        @Post('items')
        async postIngredient(
            @Body() body: CreateIngredientDto,
        ) {
            return await this.ingredientService.createIngredient(body);
        }
    */
    @Get('items/:ingredientId')
    async getIngredient(
        @Param('ingredientId') ingredientId: number,
    ) {
        return this.ingredientService.getIngredient(ingredientId);
    }
    /*
        @Patch('items/:ingredientId')
        async patchIngredient(
            @Param('ingredientId') ingredientId: number,
            @Body() body: UpdateIngredientDto,
        ) {
            return this.ingredientService.updateIngredient(ingredientId, body);
        }
    */
    @Get('categories')
    async getIngCategories(
        @Query() pageOptions: PageOptionsDto,
    ) {
        const categories = this.ingredientService.getAllIngredientCategories(pageOptions);

        if (!categories) throw new NotFoundException();

        return categories;
    }

    // Ingredient Stocks

    @Post('stocks')
    async postStocks(
        @Body() dto: UpdateIngredientStockDto | UpdateIngredientStockDto[]
    ) {
        return this.setStocks(dto, 'add');
    }

    @Put('stocks')
    async putStocks(
        @Body() dto: UpdateIngredientStockDto | UpdateIngredientStockDto[]
    ) {
        return this.setStocks(dto, 'set');
    }

    private async setStocks(
        dto: UpdateIngredientStockDto | UpdateIngredientStockDto[],
        mode: 'add' | 'set',
    ) {
        const items: UpdateIngredientStockDto[] = !Array.isArray(dto)
            ? new Array(dto as unknown as UpdateIngredientStockDto)
            : dto as unknown as UpdateIngredientStockDto[];
        const result = [];

        for (let item of items) {
            result.push(await
                this.ingredientService.setInAmount(item.ingredientId, item.amount, mode, new Date())
                    .catch(e => <object>{
                        ingredientId: item.ingredientId,
                        error: e,
                    })
            );
        }

        return result.length === 1 ? result[0] : result;
    }

    // Ingredient Orders

    @Get('orders')
    async getOrders(
        @Query('date') date?: string | any,
    ) {
        const d = date ? new Date(date) : new Date();
        const deliveredDate = IngredientService.getNextIngredientDeliveryDate(d, false);

        console.log(`incoming date: ${d} / delivered date: ${deliveredDate}`);

        return {
            date: moment(deliveredDate).format('yyyy-MM-DD'),
            items: await this.ingredientService.getOrderAmountByDate(deliveredDate)
        };
    }

    @Post('orders')
    async postOrders(
        @Body() body: UpdateIngredientStockDto | UpdateIngredientStockDto[],
    ) {
        return this.setOrders(body, 'add');
    }

    @Put('orders')
    async putOrders(
        @Body() body: UpdateIngredientStockDto | UpdateIngredientStockDto[],
    ) {
        return this.setOrders(body, 'set');
    }

    //    @Get('orders/delivered')
    //    async confirmGetOrders() {
    //        throw new Error();
    //    }

    private async setOrders(
        body: UpdateIngredientStockDto | UpdateIngredientStockDto[],
        mode: 'add' | 'set',
    ) {
        const items: UpdateIngredientStockDto[] = !Array.isArray(body)
            ? new Array(body as unknown as UpdateIngredientStockDto)
            : body as unknown as UpdateIngredientStockDto[];
        const result = [];

        const deliveredDate = IngredientService.getNextIngredientDeliveryDate(new Date(), false);

        for (let item of items)
            result.push(await
                this.ingredientService.setOrderAmount(item.ingredientId, item.amount, mode, deliveredDate)
                    .catch(e => <object>{
                        ingredientId: item.ingredientId,
                        error: e,
                    })
            );

        console.log(`incoming date: ${new Date()} / delivered date: ${deliveredDate}`);

        return result.length === 1 ? result[0] : result;
    }
}