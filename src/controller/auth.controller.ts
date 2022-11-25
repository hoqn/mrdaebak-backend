import { NoIdException } from "@/exception";
import { LoginStaffDto, LoginUserDto } from "@/model/dto/auth.dto";
import { AuthService } from "@/service/auth.service";
import { Body, Controller, Delete, NotFoundException, Post, Res, UnauthorizedException, Version } from "@nestjs/common";
import { Response } from "express";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) { }

    @Post('users')
    async loginUser(
        @Body() dto: LoginUserDto,
    ) {
        const token = await this.authService.loginUser(dto.userId, dto.password)
            .catch(e => {
                if (e instanceof NoIdException)
                    throw new NotFoundException();
                else
                    throw e;
            });

        if (!token) throw new UnauthorizedException();

        return {
            'userId': dto.userId,
            'access-token': token,
        };
    }

    @Post('staff')
    async loginStaff(
        @Body() dto: LoginStaffDto,
    ) {
        const token = await this.authService.loginStaff(dto.staffId, dto.password)
            .catch(e => {
                if (e instanceof NoIdException)
                    throw new NotFoundException();
                else
                    throw e;
            });

        if (!token) throw new UnauthorizedException();

        return {
            'staffId': dto.staffId,
            'access-token': token,
        };
    }

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