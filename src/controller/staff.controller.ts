import { IdDuplicatedException } from "@/exception";
import { PageOptionsDto } from "@/model/dto/common.dto";
import { CreateStaffDto, UpdateStaffDto } from "@/model/dto/staff.dto";
import { Staff } from "@/model/entity";
import { StaffRole } from "@/model/enum";
import { StaffService } from "@/service/staff.service";
import { BadRequestException, Body, Controller, Delete, Get, InternalServerErrorException, NotAcceptableException, NotFoundException, Param, Patch, Post, Query } from "@nestjs/common";

@Controller('staff')
export class StaffController {
    constructor(
        private readonly staffService: StaffService
    ) { }

    @Post()
    async createMember(
        @Body() body: CreateStaffDto,
    ) {
        const role = body.staffRole;

        if (role >= StaffRole.COOK) throw new BadRequestException();

        console.log('Role', role);

        return await this.staffService.createMember(role, body)
            .catch(e => {
                console.log(e);
                if (e instanceof IdDuplicatedException)
                    throw new NotAcceptableException(undefined, 'ID가 중복됩니다.')
                else
                    throw new InternalServerErrorException(e);
            });
    }

    @Get()
    async getMembers(
        @Query('staff_name') staffName?: string,
        @Query('role') role?: keyof typeof StaffRole,
        @Query() pageOptions?: PageOptionsDto,
    ) {
        const staffRole = StaffRole[role];

        return await this.staffService.getMembersBy({
            staffName, role: staffRole,
        }, pageOptions);
    }

    @Get(':staffId')
    async getMember(@Param('staffId') staffId: string) {
        const member: Staff = await this.staffService.getMember(staffId);
        if (!member) throw new NotFoundException();

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
        @Body() body: UpdateStaffDto,
    ) {
        const result = await this.staffService.updateMember(staffId, body);

        if (!result) throw new NotFoundException();

        return result;
    }

    // OWNER만
    @Post(':staffId/approve')
    async approveMember(
        @Param('staffId') staffId: string,
    ) {
        return this.staffService.approveMember(staffId);
    }
}