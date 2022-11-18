import { CreateUserDto } from "@/model/dto/user.dto";
import { User } from "@/model/entity";
import { UserService } from "@/service";
import { Test } from "@nestjs/testing";
import { Repository } from "typeorm";

describe('USER API', () => {
    let userService: UserService;
    let userRepo: Repository<User>;

    describe('USER 추가', async () => {

        const module = await Test.createTestingModule({
            providers: [UserService],
            controllers: []
        }).compile();
        userService = module.get(UserService);

        const request: CreateUserDto = <CreateUserDto>{
            userId: "example123",
            userName: "전호균",
            password: "password",
            address: "전북 전주시 덕진구",
            phoneNumber: "01012341234",
            cardNumber: "1234123412341234",
        };
        
        it('아이디가 중복되면 거부한다.', async () => {


            userService.createUser(request);


        });
    });
});