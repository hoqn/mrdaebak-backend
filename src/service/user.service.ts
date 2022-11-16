import { CONFIG } from "@/config";
import { IdDuplicatedException } from "@/exception";
import { PageOptionsDto, PageResultDto, PageResultPromise } from "@/model/dto/common.dto";
import { CreateUserDto, PatchUserDto } from "@/model/dto/user.dto";
import { User } from "@/model/entity";
import { UserGrade } from "@/model/enum/userGrade.enum";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";
import { IsPositive } from "class-validator";
import { ILike, Not, Repository } from "typeorm";
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

    private readonly ORDER_COUNT_FOR_VIP = CONFIG.user.orderCountForVip;

    async incrementOrderCount(userId: string, quantity: number) {
        // 고민... 일단은 OrderCount를 수동으로 조절하는 방식으로 구현했는데,
        // Update할 때마다 Order에서 해당 UserId의 개수를 조회해서 적용할지...
        await this.userRepo.createQueryBuilder('u')
            .update().where({ userId })
            .set({ orderCount: () => `order_count + ${quantity}` })
            .execute();

        // VIP 승급 여부를 백엔드에서 하는 게 나은가? DBMS에서 처리하는 게 나은가...?

        // VIP 승급 여부 확인
        const updatedOrderCount = await this.userRepo.createQueryBuilder()
            .select('order_count')
            .where({ userId })
            .execute()
            .then(r => r.orderCount);
        
        if(updatedOrderCount >= this.ORDER_COUNT_FOR_VIP) {
            await this.userRepo.createQueryBuilder()
                .update()
                .set({ grade: UserGrade.VIP })
                .where({ userId, grade: Not(UserGrade.VIP) })
                .execute();
            
            return { becomeVip: true };
        }

        return { becomeVip: false };
    }
    async decrementOrderCount(userId: string, quantity: number) {
        return await this.userRepo.createQueryBuilder('u')
            .update().where({ userId })
            .set({ orderCount: () => `order_count - ${quantity}` });
    }
}