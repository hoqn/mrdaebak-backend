import { OutOfLimitException } from "@/exception";
import { PageOptionsDto } from "@/model/dto/common.dto";
import { CreateIngredientReq, UpdateIngredientReq, UpdateIngredientStockDto, UpdateIngredientStockDtoArray } from "@/model/dto/ingredient.dto";
import { IngredientService } from "@/service";
import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Patch, Post, Put, Query } from "@nestjs/common";

@Controller('ingredients')
export class IngredientController {
    constructor(
        private readonly ingredientService: IngredientService,
    ) { }


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

        if(!dIngredients) throw new NotFoundException();

        return dIngredients;
    }
    @Get('style/:styleId')
    async getStyleIngredients(
        @Param('styleId') styleId: number,
    ) {
        const dIngredients = await this.ingredientService.getStyleIngredients(styleId);

        if(!dIngredients) throw new NotFoundException();

        return dIngredients;
    }

    @Post('items')
    async postIngredient(
        @Body() body: CreateIngredientReq,
    ) {
        return await this.ingredientService.createIngredient(body);
    }

    @Get('items/:ingredientId')
    async getIngredient(
        @Param('ingredientId') ingredientId: number,
    ) {
        return this.ingredientService.getIngredient(ingredientId);
    }

    @Patch('items/:ingredientId')
    async patchIngredient(
        @Param('ingredientId') ingredientId: number,
        @Body() body: UpdateIngredientReq,
    ) {
        return this.ingredientService.updateIngredient(ingredientId, body);
    }

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
    async postIngStock(
        @Body() body: UpdateIngredientStockDto | UpdateIngredientStockDto[]
    ) {
        return this.setIngStock(body, 'POST');
    }

    @Put('stocks')
    async putIngStock(
        @Body() body: UpdateIngredientStockDto | UpdateIngredientStockDto[]
    ) {
        return this.setIngStock(body, 'PUT');
    }

    private async setIngStock(
        body: UpdateIngredientStockDto | UpdateIngredientStockDto[],
        mode: 'POST' | 'PUT',
    ) {
        const items: UpdateIngredientStockDto[] = !Array.isArray(body)
            ? new Array(body as unknown as UpdateIngredientStockDto)
            : body as unknown as UpdateIngredientStockDto[];
        const result = [];

        const paramMode = mode === 'POST' ? 'ADD' : 'SET';

        console.log(items);
        for(let item of items) {
            result.push(
                await this.ingredientService.setIngredientTodayStock(
                    item.ingredientId, item.amount, paramMode
                ).catch(e => {
                    return {
                        ingredientId: item.ingredientId,
                        error: e,
                    };
                })
            );
        }

        return result.length === 1 ? result[0] : result;
    }

    // Ingredient Orders

    @Get('orders')
    async getIngOrders(
        @Body() pageOptions: PageOptionsDto,
    ) {
        return this.ingredientService.getIngredientOrderStocks(pageOptions);
    }

    @Post('orders')
    async postIngOrder(
        @Body() body: UpdateIngredientStockDto | UpdateIngredientStockDto[],
    ) {
        return this.setIngOrder(body, 'POST');
    }

    @Put('orders')
    async putIngOrder(
        @Body() body: UpdateIngredientStockDto | UpdateIngredientStockDto[],
    ) {
        return this.setIngOrder(body, 'PUT');
    }

    private async setIngOrder(
        body: UpdateIngredientStockDto | UpdateIngredientStockDto[],
        mode: 'POST' | 'PUT',
    ) {
        const items: UpdateIngredientStockDto[] = !Array.isArray(body)
            ? new Array(body as unknown as UpdateIngredientStockDto)
            : body as unknown as UpdateIngredientStockDto[];
        const result = [];

        const paramMode = mode === 'POST' ? 'ADD' : 'SET';

        for(let item of items)
            result.push( await
                this.ingredientService.setIngredientOrderStock(
                    item.ingredientId, item.amount, paramMode
                ).catch(e => <object>{
                        ingredientId: item.ingredientId,
                        error: e,
                    }
                ));

        return result.length === 1 ? result[0] : result;
    }
}