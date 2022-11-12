import { IdDuplicatedException } from "@/exception/IdDuplicatedException";
import { CreateStaffDto } from "@/model/dto/staff.dto";
import { Staff, StaffRole } from "@/model/entity";
import { HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import PasswordEncryptor from "./utils/passwordEncryptor";

export class StaffService {
    constructor(
        @InjectRepository(Staff) private readonly staffRepo: Repository<Staff>
    ) { }

    async createMember(dto: CreateStaffDto) {
        // ID 중복 체크
        const existing = await this.staffRepo.findOneBy({ staffId: dto.staffId });
        if (existing) throw new IdDuplicatedException();

        const member = dto.toEntity();

        member.password = PasswordEncryptor.encrypt(dto.password);

        member.joinDate = new Date();
        member.role = StaffRole.PENDING;

        await this.staffRepo.save(member);

        member.password = undefined;
        return member;
    }

    async getMembers() {
        return await this.staffRepo.find();
    }

    async getMembersBy({ staffName, role }: { staffName?: string, role?: StaffRole }) {
        return await this.staffRepo.findBy({
            staffName: staffName ? ILike(`%${staffName}%`) : undefined,
            role,
        });
    }

    async getMemberByStaffId(staffId: string): Promise<Staff> {
        return await this.staffRepo.findOneBy({
            staffId: staffId
        });
    }

    async updateMember(staffId: string, body: Partial<Staff>): Promise<boolean> {
        const member = await this.staffRepo.findOneBy({ staffId: staffId });

        console.log('mem: ', member);

        if(!member) return false;

        if(body.staffName) member.staffName = body.staffName;
        if(body.phoneNumber) member.phoneNumber = body.phoneNumber;
        if(body.role) member.role = body.role;

        if(body.password)
            member.password = PasswordEncryptor.encrypt(body.password);

        console.log('MEMBER: ', member);

        this.staffRepo.save(member);

        return true;
    }
}