import { AuthService } from "@/service/auth.service";
import { Body, Controller, Delete, Post, Res, UnauthorizedException, Version } from "@nestjs/common";
import { Response } from "express";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) { }

    @Version('1')
    @Post('users')
    async loginUser(
        @Res() res: Response,
        @Body() dto: { userId: string, password: string },
    ) {
        res.json({
            'access-token': await this.authService.loginUser(dto.userId, dto.password),
        });
        return;
    }

    @Version('1')
    @Post('staff')
    async loginStaff(
        @Body() dto: { staffId: string, password: string },
    ) {
        const token = await this.authService.loginStaff(dto.staffId, dto.password);

        if(!token) throw new UnauthorizedException();

        return { 'access-token': token };
    }

    @Version('1')
    @Delete('users')
    logoutUser(
        @Res() res: Response,
    ) {
        const token = res.header['authorization'];
        console.log(token);
        /* TODO */

        res.json({});
        return;
    }

    @Version('1')
    @Delete('staff')
    logoutStaff(
        @Res() res: Response,
    ) {
        const token = res.header['authorization'];
        console.log(token);
        /* TODO */

        res.json({});
        return;
    }
}