import { CreateUserDto, PatchUserDto } from "@/model/dto/user.dto";
import { User } from "@/model/entity";
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

    async createUser(dto: CreateUserDto) {
        // ID 중복 체크
        const existing = await this.userRepo.findOneBy({ userId: dto.userId });
        if (existing) throw new HttpException("ID가 중복됩니다.", HttpStatus.FORBIDDEN);

        const user = dto.toEntity();

        user.password = PasswordEncryptor.encrypt(dto.password);

        user.joinDate = new Date();
        user.grade = 0;
        user.orderNumber = 0;
        user.orders = [];

        await this.userRepo.save(user);

        user.password = undefined;
        return user;
    }

    async getUsers() {
        return await this.userRepo.find();
    }

    async getUsersBy({
        grade, userName
    }: {
        grade?: number, userName?: string,
    }) {
        return await this.userRepo.findBy({
            grade,
            userName: userName ? ILike(`%${userName}%`) : undefined
        });
    }

    async getUserByUserId(userId: string): Promise<User> {
        return await this.userRepo.findOneBy({ userId: userId });
    }

    async updateUser(userId: string, dto: PatchUserDto) {
        const user = await this.userRepo.findOneBy({userId});

        if(dto.userName) user.userName = dto.userName;
        if(dto.address) user.address = dto.address;
        if(dto.phoneNumber) user.phoneNumber = dto.address;
        if(dto.cardNumber) user.cardNumber = dto.cardNumber;
        
        if(dto.password)
            user.password = PasswordEncryptor.encrypt(dto.password);

        await this.userRepo.save(user);
    }

    async deleteUser(userId: string) {
        return this.userRepo.createQueryBuilder()
            .delete()
            .where({ userId })
            .execute();
    }
}