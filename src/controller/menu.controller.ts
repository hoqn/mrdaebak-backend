import { Style } from "@/model/entity";
import { ResBody } from "@/types/responseBody";
import { Controller, Get, HttpStatus, Param, Query, Res } from "@nestjs/common";
import { Response } from "express";
import { MenuService } from "src/service/menu.service";

@Controller('menu')
export class MenuController {
    constructor(private readonly menuService: MenuService) {}
    
    @Get('dinners')
    async getDinners(
        @Res() res: Response,
    ) {
        const contents = await this.menuService.getAllDinners();
        res.json(<ResBody>{
            result: {
                count: contents.length,
                page: 1,
                items: contents,
            }
        });
        return;
    }

    @Get('dinners/:dinnerId')
    async getDinner(
        @Res() res: Response,
        @Param('dinnerId') dinnerId: number,
    ) {
        const dinner = await this.menuService.getDinnerById(dinnerId);

        if(!dinner) {
            res.status(HttpStatus.NOT_FOUND).json(<ResBody>{
                code: 0,
                message: '해당 디너가 존재하지 않습니다.',
            });
            return;
        }

        res.json(<ResBody>{
            result: dinner,
        });
        return;
    }

    @Get('dinners/:dinnerId/options')
    async getDinnerOptions(
        @Res() res: Response,
        @Param('dinnerId') dinnerId: number,
    ) {
        const options = await this.menuService.getDinnerOptions(dinnerId);

        if(!options) {
            res.status(HttpStatus.NOT_FOUND).json(<ResBody>{
                code: 0,
                message: '해당 디너 또는 옵션이 존재하지 않습니다.',
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
    }

    @Get('styles')
    async getStyles(
        @Query('dinner_id') dinnerId: number,
        @Res() res: Response,
    ) {
        const styles: Style[] = 
            dinnerId
                ? await this.menuService.getStylesWithDinnerId(dinnerId) 
                : await this.menuService.getAllStyles();

        res.json(<ResBody>{
            result: {
                count: styles.length,
                items: styles,
            }
        });
    }

    @Get('styles/:styleId')
    async getStyle(
        @Res() res: Response,
        @Param('styleId') styleId: number,
    ) {
        const style = await this.menuService.getStyleById(styleId);

        if(!style) {
            res.status(HttpStatus.NOT_FOUND).json(<ResBody>{
                code: 0,
                message: '해당 스타일이 존재하지 않습니다.',
            });
            return;
        }

        res.json(<ResBody>{
            result: style,
        });
        return;
    }

    @Get('styles/:styleId/options')
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
    }
}