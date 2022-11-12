import { User } from "@/model/entity";
import { CreateUserDto, PatchUserDto } from "@/model/dto/user.dto";
import { UserService } from "@/service/user.service";
import { ResBody } from "@/types/responseBody";
import { ClientTypeQuery, UserGradeQuery } from "@/types/QueryParams";
import { Body, Controller, Delete, Get, HttpStatus, NotFoundException, Param, Patch, Post, Query, Res, SetMetadata, UseGuards, Version } from "@nestjs/common";
import { Response } from "express";
import { ExclusiveOrRoleGuard, BaseAuthGuard, RoleGuard } from "@/security/guard";
import { SecurityRoles } from "@/security/role.decorator";
import { SecurityRole } from "@/security/role.enum";

@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) { }

    // GET /users
    @Version('1') @Get()
    @UseGuards(BaseAuthGuard, RoleGuard)
    @SecurityRoles(SecurityRole.OWNER, SecurityRole.STAFF_COOK, SecurityRole.STAFF_DELIVERY)
    async getUsers(
        @Query('grade') grade: UserGradeQuery|undefined,
        @Query('user_name') userName: string|undefined,
        @Res() res: Response,
    ) {
        try {
            const users: User[] = await this.userService.getUsersBy({
                grade: grade === 'vip' ? 1 : grade === 'normal' ? 0 : undefined,
                userName,
            });

            res.json(<ResBody>{
                result: {
                    count: users.length,
                    items: users.map(user => {
                        user.password = undefined;
                        user.cardNumber = undefined;
                        return user;
                    }),
                },
            });
            return;
        } catch(e) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `${e.message}`,
            });
            return;
        }
    }

    // POST /users
    @Version('1') @Post()
    async newUser(
        @Query('type') type: ClientTypeQuery,
        @Body() dto: CreateUserDto,
        @Res() res: Response,
    ) {
        try {
            const { userId } = await this.userService.createUser(dto) || {};

            if (!userId)
                throw Error("회원 추가에 실패하였습니다.");
            
            res.json({
                status: HttpStatus.CREATED,
                userId: userId,
            });
            return;
        } catch(e) {
            res.status(HttpStatus.NOT_ACCEPTABLE).json({
                status: HttpStatus.NOT_ACCEPTABLE,
                message: `${e.message}`,
            });
            return;
        }
    }

    // GET /users/:userid
    @Version('1') @Get(':userid')
    @UseGuards(BaseAuthGuard, ExclusiveOrRoleGuard)
    @SecurityRoles(SecurityRole.OWNER, SecurityRole.STAFF_COOK, SecurityRole.STAFF_DELIVERY)
    @SetMetadata('param', 'userid')
    async getUser(
        @Param('userid') userId: string,
        @Res() res: Response,
    ) {
        const user = await this.userService.getUserByUserId(userId);

        if (!user) {
            res.status(HttpStatus.NOT_FOUND).json(<ResBody>{
                code: 1,
                message: `${userId} 회원을 찾을 수 없습니다.`,
            });
        } else {
            user.password = undefined;
            res.json(<ResBody>{
                result: {
                    user: user,
                }
            });
        }
        
        return;
    }

    @Version('1') @Patch(':userid')
    @UseGuards(BaseAuthGuard, ExclusiveOrRoleGuard)
    @SecurityRoles()
    @SetMetadata('param', 'userid')
    async patchUser(
        @Param('userid') userId: string,
        @Body() dto: PatchUserDto,
    ) {
        await this.userService.updateUser(userId, dto);
        return <ResBody>{
            message: '성공하였습니다',
        };
    }

    @Delete(':userId')
    @UseGuards(BaseAuthGuard, ExclusiveOrRoleGuard)
    @SecurityRoles()
    @SetMetadata('param', 'userId')
    async deleteUser(
        @Param('userId') userId: string,
    ) {
        const result = await this.userService.deleteUser(userId);

        if(result.affected < 1) throw new NotFoundException();

        return <ResBody> {
            code: 0,
            message: '성공하였습니다.',
        };
    }
}