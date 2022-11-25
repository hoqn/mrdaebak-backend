import { Controller, Get, HttpStatus, Redirect, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";

@Controller()
export class LegacyController {
    @Get('ing-schedule')
    public async getIngredientSchedules(
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const redirect = req.originalUrl.replace('ing-schedule', 'ingredients/schedule');
        return res.redirect(HttpStatus.PERMANENT_REDIRECT, redirect);
    }
}