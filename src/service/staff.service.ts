import { IdDuplicatedException } from "@/exception/IdDuplicatedException";
import { PageOptionsDto, PageResultDto, PageResultPromise } from "@/model/dto/common.dto";
import { CreateStaffReq, UpdateStaffReq } from "@/model/dto/staff.dto";
import { Staff } from "@/model/entity";
import { StaffRole } from "@/model/enum";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, ILike, Not, Repository, UpdateResult } from "typeorm";
import PasswordEncryptor from "./utils/passwordEncryptor";

export class StaffService {
    constructor(
        @InjectRepository(Staff) private readonly staffRepo: Repository<Staff>
    ) { }

    async addNewMember(role: StaffRole, dto: CreateStaffReq) {
        const existing = await this.staffRepo.findOneBy({ staffId: dto.staffId });
        if(existing) throw new IdDuplicatedException();

        const member = await this.staffRepo.save(<Staff> {
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

        if(pageOptions.orderable) qb.orderBy(pageOptions.orderBy, pageOptions.orderDirection);
        qb.skip(pageOptions.skip).take(pageOptions.take);

        const [items, count] = await qb.getManyAndCount();

        return new PageResultDto(pageOptions, count, items);
    }

    async getMember(staffId: string): Promise<Staff> {
        return await this.staffRepo.findOneBy({ staffId });
    }

    async updateMember(staffId: string, body: UpdateStaffReq): Promise<UpdateResult> {
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