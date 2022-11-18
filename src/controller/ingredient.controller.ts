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
        @Query() pageOptions: PageOptionsDto,
    ) {
        const ingredients = this.ingredientService.getAllIngredients(pageOptions);

        if (!ingredients) throw new NotFoundException();

        return ingredients;
    }

    @Post('items')
    async postIngredient(
        @Body() body: CreateIngredientReq,
    ) {
        return await this.ingredientService.addNewIngredient(body);
    }

    @Get('items/:ingredientId')
    async getIngredient(
        @Param('ingredientId') ingredientId: number,
    ) {
        return this.ingredientService.getIngredientById(ingredientId);
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