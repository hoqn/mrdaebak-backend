import { IdDuplicatedException } from "@/exception/IdDuplicatedException";
import { CreateStaffReq } from "@/model/dto/staff.dto";
import { Staff } from "@/model/entity";
import { StaffRole } from "@/model/enum";
import { ListParams } from "@/model/list.params";
import { ListResult, ListResultPromise } from "@/model/list.result";
import { OrderParams } from "@/model/order.params";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, ILike, Not, Repository, UpdateResult } from "typeorm";
import PasswordEncryptor from "./utils/passwordEncryptor";

export class StaffService {
    constructor(
        @InjectRepository(Staff) private readonly staffRepo: Repository<Staff>
    ) { }

    async createPendingMember(dto: CreateStaffReq) {
        const existing = await this.staffRepo.findOneBy({ staffId: dto.staffId });
        if(existing) throw new IdDuplicatedException();

        const member = dto.toEntity();
        member.password = PasswordEncryptor.encrypt(dto.password);
        member.role = StaffRole.PENDING;
        
        await this.staffRepo.save(member);

        member.password = undefined;

        return member;
    }

    async getMembers(listParams: ListParams, orderParams?: OrderParams): ListResultPromise<Staff> {
        return this.getMembersBy({}, listParams, orderParams);
    }

    async getMembersBy(query: { staffName?: string, role?: StaffRole },
        listParams: ListParams, orderParams?: OrderParams
    ): ListResultPromise<Staff> {
        const qb = this.staffRepo.createQueryBuilder()
            .select();

        if (query.staffName) qb.andWhere({ staffName: ILike(`%${query.staffName}%`) });
        if (query.role !== undefined) qb.andWhere({ role: query.role });

        if (orderParams) orderParams.adaptTo(qb);

        listParams.adaptTo(qb);

        const [items, count] = await qb.getManyAndCount();

        return new ListResult(listParams, count, items.map(i => { i.password = undefined; return i;}));
    }

    async getMember(staffId: string): Promise<Staff> {
        return await this.staffRepo.findOneBy({ staffId });
    }

    async updateMember(staffId: string, body: Partial<Staff>): Promise<UpdateResult> {
        const qb = this.staffRepo.createQueryBuilder()
            .update()
            .where({ staffId });

        const updateBody: any = {};

        if (body.staffName) updateBody.staffName = body.staffName;
        if (body.phoneNumber) updateBody.phoneNumber = body.phoneNumber;
        if (body.role) updateBody.role = body.role;
        if (body.password) updateBody.password = PasswordEncryptor.encrypt(body.password);

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