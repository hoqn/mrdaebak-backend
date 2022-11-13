import { IdDuplicatedException } from "@/exception";
import { PageOptionsDto, PageResultDto, PageResultPromise } from "@/model/dto/common.dto";
import { CreateUserDto, PatchUserDto } from "@/model/dto/user.dto";
import { User } from "@/model/entity";
import { UserGrade } from "@/model/enum/userGrade.enum";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import PasswordEncryptor from "./utils/passwordEncryptor";

/**
 * @Todo 아이디 중복 등 확인하는 매커니즘 추가
 */

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>
    ) { }

    async createUser(body: CreateUserDto) {
        // ID 중복 체크
        const existing = await this.userRepo.findOneBy({ userId: body.userId });
        if (existing) throw new IdDuplicatedException();

        const qb = this.userRepo.createQueryBuilder()
            .insert();

        qb.values({
            ...body,
            password: PasswordEncryptor.encrypt(body.password),
        });

        return qb.execute();
    }

    async getUsers() {
        return await this.userRepo.find();
    }

    async getUsersBy(
        query: {
            grade?: UserGrade, userName?: string,
        }, pageOptions: PageOptionsDto,
    ): PageResultPromise<User> {
        const qb = this.userRepo.createQueryBuilder();

        if(query.userName) qb.andWhere({ userName: ILike(`%${query.userName}%`) });
        if(query.grade !== undefined) qb.andWhere({ grade: query.grade});

        if(pageOptions.orderable) qb.orderBy(pageOptions.orderBy, pageOptions.orderDirection);
        qb.skip(pageOptions.skip).take(pageOptions.take);

        const [items, count] = await qb.getManyAndCount();

        return new PageResultDto(pageOptions, count, items);
    }

    async getUserByUserId(userId: string): Promise<User> {
        return await this.userRepo.findOneBy({ userId: userId });
    }

    async updateUser(userId: string, dto: PatchUserDto) {
        /*const user = await this.userRepo.findOneBy({userId});

        if(dto.userName) user.userName = dto.userName;
        if(dto.address) user.address = dto.address;
        if(dto.phoneNumber) user.phoneNumber = dto.address;
        if(dto.cardNumber) user.cardNumber = dto.cardNumber;
        
        if(dto.password)
            user.password = PasswordEncryptor.encrypt(dto.password);

        await this.userRepo.save(user);*/
        const qb = this.userRepo.createQueryBuilder()
            .update();
        
        qb.set(dto);

        return await qb.execute();
    }

    async deleteUser(userId: string) {
        return this.userRepo.createQueryBuilder()
            .delete()
            .where({ userId })
            .execute();
    }
}