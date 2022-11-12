import { IdDuplicatedException } from "@/exception";
import { CreateStaffReq, UpdateStaffReq } from "@/model/dto/staff.dto";
import { Staff } from "@/model/entity";
import { StaffRole } from "@/model/enum";
import { ListParams } from "@/model/list.params";
import { OrderDirection, OrderParams } from "@/model/order.params";
import { StaffService } from "@/service/staff.service";
import { ResBody } from "@/types/responseBody";
import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, HttpException, HttpStatus, InternalServerErrorException, NotAcceptableException, NotFoundException, Param, Patch, Post, Query, Res, Version } from "@nestjs/common";
import { Response } from "express";

@Controller('staff')
export class StaffController {
    constructor(
        private readonly staffService: StaffService
    ) { }

    @Post()
    async createMember(@Body() body: CreateStaffReq) {
        return await this.staffService.createPendingMember(body)
            .catch(e => {
                if(e instanceof IdDuplicatedException) 
                    throw new NotAcceptableException(undefined, 'ID가 중복됩니다.')
                else
                    throw new InternalServerErrorException(e);
            });
    }
    
    @Get()
    async getMembers(
        @Query('staff_name') staffName?: string,
        @Query('role') role?: 'PENDING' | 'OWNER' | 'DELIVERY' | 'COOK',
        @Query('page') page?: number,
        @Query('order_by') orderBy?: string,
        @Query('order_direction') orderDirection?: OrderDirection,
    ) {
        const staffRole = StaffRole[role];

        return await this.staffService.getMembersBy({
            staffName, role: staffRole,
        }, new ListParams(page), new OrderParams(orderBy, orderDirection)); 
    }

    @Get(':staffId')
    async getMember(@Param('staffId') staffId: string) {
        const member: Staff = await this.staffService.getMember(staffId);
        if(!member) throw new NotFoundException();
        
        member.password = undefined;

        return member;
    }

    @Delete(':staffId')
    async deleteMember(@Param('staffId') staffId: string) {
        return await this.staffService.deleteMember(staffId);
    }

    @Patch(':staffId')
    async patchMember(
        @Param('staffId') staffId: string,
        @Body() body: UpdateStaffReq,
    ) {
        const role = body.toStaffRole();
        if (!role) throw new BadRequestException('필수 인자 role이 누락되었습니다.');

        const result = await this.staffService.updateMember(staffId, {
            ...body,
            role,
        });

        if(!result) throw new NotFoundException();

        return result;
    }
}