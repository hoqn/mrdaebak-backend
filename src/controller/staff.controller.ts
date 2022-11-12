import { IdDuplicatedException } from "@/exception";
import { ApproveStaffDto, CreateStaffDto } from "@/model/dto/staff.dto";
import { Staff, StaffRole } from "@/model/entity";
import { StaffService } from "@/service/staff.service";
import { ResBody } from "@/types/responseBody";
import { Body, Controller, Get, HttpException, HttpStatus, Patch, Post, Query, Res, Version } from "@nestjs/common";
import { Response } from "express";

@Controller('staff')
export class StaffController {
    constructor(
        private readonly staffService: StaffService
    ) { }

    // 회원 가입(직원)
    // POST api/v1/staff
    @Version('1') @Post()
    async createMember(
        @Res() res: Response,
        @Body() body: CreateStaffDto,
    ) {
        try {
            await this.staffService.createMember(body);
        } catch (e) {
            if (e instanceof IdDuplicatedException) {
                res.status(HttpStatus.FORBIDDEN).json(<ResBody>{
                    code: 3,
                    message: "아이디가 중복되었습니다.",
                });
            }
            return;
        }

        res.json(<ResBody>{
            message: "성공했습니다.",
        })
    }

    // 직원 목록 조회
    // GET /api/v1/staff?staff_name={}&role={}
    @Version('1') @Get()
    async getMembers(
        @Res() res: Response,
        @Query('staff_name') staffName?: string,
        @Query('role') role?: 'PENDING' | 'OWNER' | 'DELIVERY' | 'COOK',
    ) {
        const staffRole =
            role === 'PENDING'
                ? StaffRole.PENDING
                : role === 'OWNER'
                    ? StaffRole.OWNER
                    : role === 'DELIVERY'
                        ? StaffRole.DELIVERY
                        : role === 'COOK'
                            ? StaffRole.COOK
                            : undefined;

        const members: Staff[] = await this.staffService.getMembersBy({
            staffName,
            role: staffRole,
        });

        res.json(<ResBody>{
            result: {
                count: members.length,
                items: members.map(member => {
                    member.password = undefined;
                    return member;
                }),
            },
        });
        return;
    }

    // 직원 승인
    // PATCH api/v1/staff
    @Version('1') @Patch()
    async approveMembers(
        @Res() res: Response,
        @Body() body: ApproveStaffDto,
    ) {
        const role =
            body.role === 'OWNER'
                ? StaffRole.OWNER
                : body.role === 'DELIVERY'
                    ? StaffRole.DELIVERY
                    : body.role === 'COOK'
                        ? StaffRole.COOK
                        : undefined;

        if (!role) throw new HttpException('필수 인자 role이 누락되었습니다.', HttpStatus.BAD_REQUEST);

        let count = 0;

        const result = await this.staffService.updateMember(body.staffId, <Staff>{
            role: role,
        });

        if(!result) {
            res.status(HttpStatus.NOT_FOUND).json(<ResBody>{
                code: 1,
                message: '수정할 수 없습니다.'
            });
            return;
        }

        res.json(<ResBody>{
            message: `요청이 처리되었습니다.`,
        });
        return;
    }
}