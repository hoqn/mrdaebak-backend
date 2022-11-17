import { User } from "@/model/entity";
import { CreateUserDto, PatchUserDto } from "@/model/dto/user.dto";
import { UserService } from "@/service/user.service";
import { Body, Controller, Delete, Get, HttpStatus, InternalServerErrorException, NotAcceptableException, NotFoundException, Param, Patch, Post, Query, Res, SetMetadata, UseGuards, Version } from "@nestjs/common";
import { Response } from "express";
import { ExclusiveOrRoleGuard, BaseAuthGuard, RoleGuard } from "@/security/guard";
import { SecurityRoles } from "@/security/role.decorator";
import { SecurityRole } from "@/security/role.enum";
import { UserGrade } from "@/model/enum/userGrade.enum";
import { PageOptionsDto } from "@/model/dto/common.dto";
import { ClientType } from "@/security";
import { IdDuplicatedException } from "@/exception";

@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) { }

    @Get()
    @UseGuards(BaseAuthGuard, RoleGuard)
    @SecurityRoles(SecurityRole.OWNER, SecurityRole.STAFF_COOK, SecurityRole.STAFF_DELIVERY)
    async getUsers(
        @Query('grade') grade?: keyof typeof UserGrade,
        @Query('user_name') userName?: string,
        @Query() pageOptions?: PageOptionsDto,
    ) {
            const users = await this.userService.getUsersBy({
                grade: grade ? UserGrade[grade] : undefined, userName
            }, pageOptions);

            if(!users) throw new NotFoundException();

            return users;
    }

    @Post()
    async createUser(
        @Body() body: CreateUserDto,
    ) {
        return await this.userService.createUser(body)
            .catch(e => {
                if(e instanceof IdDuplicatedException)
                    throw new NotAcceptableException(undefined, 'ID가 중복됩니다.')
                else
                    throw new InternalServerErrorException(e);
            });
    }

    @Version('1') @Get(':userId')
    @UseGuards(BaseAuthGuard, ExclusiveOrRoleGuard)
    @SecurityRoles(SecurityRole.OWNER, SecurityRole.STAFF_COOK, SecurityRole.STAFF_DELIVERY)
    @SetMetadata('param', 'userId')
    async getUser(
        @Param('userId') userId: string,
    ) {
        const user = await this.userService.getUserByUserId(userId);

        if(!user) throw new NotFoundException();

        return user;
    }

    @Version('1') @Patch(':userId')
    @UseGuards(BaseAuthGuard, ExclusiveOrRoleGuard)
    @SecurityRoles()
    @SetMetadata('param', 'userId')
    async patchUser(
        @Param('userId') userId: string,
        @Body() dto: PatchUserDto,
    ) {
        return await this.userService.updateUser(userId, dto);
    }

    @Delete(':userId')
    @UseGuards(BaseAuthGuard, ExclusiveOrRoleGuard)
    @SecurityRoles()
    @SetMetadata('param', 'userId')
    async deleteUser(
        @Param('userId') userId: string,
    ) {
        return await this.userService.deleteUser(userId);
    }
}