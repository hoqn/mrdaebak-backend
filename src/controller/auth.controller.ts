import { NoIdException } from "@/exception";
import { LoginUserDto } from "@/model/dto/user.dto";
import { AuthService } from "@/service/auth.service";
import { ClientTypeQuery } from "@/types/QueryParams";
import { ResBody } from "@/types/responseBody";
import { HttpException, HttpStatus, Inject, Req, Res, UseGuards, Version } from "@nestjs/common";
import {
    Controller,
    Body,
    Query,
    Get,
    Post,
    Delete,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request, Response } from "express";

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
        @Res() res: Response,
        @Body() dto: { staffId: string, password: string },
    ) {
        try {
            const token = await this.authService.loginStaff(dto.staffId, dto.password);
            
            res.json(<ResBody>{
                result: {
                    'access-token': token,
                },
            });
        } catch(e) {
            if(e instanceof NoIdException)
                res.status(HttpStatus.NOT_FOUND).json(<ResBody>{
                    code: 1,
                    message: 'ID가 존재하지 않습니다.',
                });
            else
                throw HttpException;
        }
        return;
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