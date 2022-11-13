import { PageOptionsDto, PageResultPromise } from "@/model/dto/common.dto";
import { Dinner, Style } from "@/model/entity";
import { IngredientService } from "@/service";
import { Controller, Get, HttpStatus, NotFoundException, Param, Query, Res } from "@nestjs/common";
import { MenuService } from "src/service/menu.service";

@Controller('menu')
export class MenuController {
    constructor(
        private readonly menuService: MenuService,
        private readonly ingredientService: IngredientService
    ) {}
    
    @Get('dinners')
    async getDinners(
        @Query() pageOptions: PageOptionsDto,
    ): PageResultPromise<Dinner> {
        return await this.menuService.getAllDinners(pageOptions);
    }

    @Get('dinners/:dinnerId')
    async getDinner(
        @Param('dinnerId') dinnerId: number,
    ) {
        const dinner = await this.menuService.getDinnerById(dinnerId);

        if(!dinner) throw new NotFoundException();

        return dinner;
    }

    @Get('dinners/:dinnerId/options')
    async getDinnerOptions(
        @Param('dinnerId') dinnerId: number,
    ) {
        return await this.menuService.getDinnerOptions(dinnerId);
    }

    @Get('dinners/:dinnerId/ingredients')
    async getDinnerIngredients(
        @Param('dinnerId') dinnerId: number,
        @Query() pageOptions: PageOptionsDto,
    ) {
        return await this.ingredientService.getIngredientsBy({ 
            dinnerId 
        }, pageOptions);
    }

    @Get('styles')
    async getStyles(
        @Query('dinner_id') dinnerId?: number,
        @Query() pageOptions?: PageOptionsDto,
    ) {
        const styles = dinnerId
                ? await this.menuService.getStylesBy({ dinnerId }, pageOptions) 
                : await this.menuService.getAllStyles(pageOptions);
        
        if(!styles) throw new NotFoundException();

        return styles;
    }

    @Get('styles/:styleId')
    async getStyle(
        @Param('styleId') styleId: number,
    ) {
        const style = await this.menuService.getStyleById(styleId);

        if(!style) throw new NotFoundException();

        return style;
    }

    /* @Get('styles/:styleId/options')
    async getStyleOptions(
        @Res() res: Response,
        @Param('styleId') styleId: number,
    ) {
        const options = await this.menuService.getStyleOptions(styleId);

        if(!options) {
            res.status(HttpStatus.NOT_FOUND).json(<ResBody>{
                code: 0,
                message: '해당 스타일 또는 옵션이 존재하지 않습니다.',
            });
            return;
        }

        res.json(<ResBody>{
            result: {
                count: options.length,
                page: 1,
                items: options,
            }
        });
        return;
    } */

    @Get('styles/:styleId/ingredients')
    async getStyleIngredients(
        @Param('styleId') styleId: number,
        @Query() pageOptions: PageOptionsDto,
    ) {
        return await this.ingredientService.getIngredientsBy({ 
            styleId 
        }, pageOptions);
    }
}