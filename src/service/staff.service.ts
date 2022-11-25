import { IdDuplicatedException } from "@/exception/IdDuplicatedException";
import { PageOptionsDto, PageResultDto, PageResultPromise } from "@/model/dto/common.dto";
import { CreateStaffDto, UpdateStaffDto } from "@/model/dto/staff.dto";
import { Staff } from "@/model/entity";
import { StaffRole } from "@/model/enum";
import { BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, ILike, Not, Repository, UpdateResult } from "typeorm";
import PasswordEncryptor from "./utils/password-encryptor.util";

export class StaffService {
    constructor(
        @InjectRepository(Staff) private readonly staffRepo: Repository<Staff>
    ) { }

    async createMember(role: StaffRole, dto: CreateStaffDto) {
        const existing = await this.staffRepo.findOneBy({ staffId: dto.staffId });
        if (existing) throw new IdDuplicatedException();

        const member = await this.staffRepo.save(<Staff>{
            staffId: dto.staffId,
            password: PasswordEncryptor.encrypt(dto.password),
            staffName: dto.staffName,
            phoneNumber: dto.phoneNumber,
            role: role,
        });

        return member;
    }

    async getMembers(
        pageOptions: PageOptionsDto,
    ): PageResultPromise<Staff> {
        return this.getMembersBy({}, pageOptions);
    }

    async getMembersBy(
        query: { staffName?: string, role?: StaffRole },
        pageOptions: PageOptionsDto,
    ): PageResultPromise<Staff> {
        const qb = this.staffRepo.createQueryBuilder();

        if (query.staffName) qb.andWhere({ staffName: ILike(`%${query.staffName}%`) });
        if (query.role !== undefined) qb.andWhere({ role: query.role });

        if (pageOptions.orderable) qb.orderBy(pageOptions.order_by, pageOptions.order_direction);
        qb.skip(pageOptions.skip).take(pageOptions.take);

        const [items, count] = await qb.getManyAndCount();

        return new PageResultDto(pageOptions, count, items);
    }

    async getMember(staffId: string): Promise<Staff> {
        return await this.staffRepo.findOneBy({ staffId });
    }

    async approveMember(staffId: string) {
        const currentRole: StaffRole = await this.staffRepo.createQueryBuilder()
            .select('role')
            .where({ staffId })
            .execute().then(o => o[0].role);

        if (currentRole >= StaffRole.PENDING_COOK && currentRole < StaffRole.COOK) {
            return this.staffRepo.createQueryBuilder()
                .update()
                .where({ staffId })
                .set({ role: () => `role + ${0x10}` })
                .execute();
        }

        throw new BadRequestException(`해당 직원은 승인할 수 없거나 이미 승인된 상태입니다. (${currentRole})`);
    }

    async updateMember(staffId: string, body: UpdateStaffDto): Promise<UpdateResult> {
        const qb = this.staffRepo.createQueryBuilder()
            .update()
            .where({ staffId });

        const updateBody = <Partial<Staff>>{
            ...body,
            role: body.staffRole,
        };

        if (updateBody.password !== undefined)
            updateBody.password = PasswordEncryptor.encrypt(body.password);

        return await qb.set(updateBody)
            .execute();
    }

    async deleteMember(staffId: string): Promise<DeleteResult> {
        return await this.staffRepo.createQueryBuilder()
            .delete()
            .where({ staffId })
            .execute();
    }
}