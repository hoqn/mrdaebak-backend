import { AuthController } from "@/controller/auth.controller";
import { User } from "@/model/entity";
import { JwtStrategy } from "@/security/passport.jwt.strategy";
import { UserService } from "@/service";
import { AuthService } from "@/service/auth.service";
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StaffModule } from "./staff.module";
import { UserModule } from "./user.module";

const jwtSecretKey = process.env.JWT_SECRET;

@Module({
    imports: [
        UserModule,
        StaffModule,
        PassportModule,
        JwtModule.register({
            secret: jwtSecretKey,
            signOptions: {
                expiresIn: '60s',
            },
        }),
    ],
    exports: [AuthService],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
})
export class AuthModule { }