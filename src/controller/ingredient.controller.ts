import { PageOptionsDto } from "@/model/dto/common.dto";
import { CreateIngredientReq, UpdateIngredientReq } from "@/model/dto/ingredient.dto";
import { IngredientService } from "@/service";
import { Body, Controller, Get, NotFoundException, Param, Patch, Post, Query } from "@nestjs/common";

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

        if(!ingredients) throw new NotFoundException();

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

        if(!categories) throw new NotFoundException();

        return categories;
    }

    @Post('categories')
    async postIngCategories(
        @Body() body
    ) {
        
    }
}