import { NoIdException } from "@/exception";
import { SecurityRole } from "@/security/role.enum";
import { SessionUser } from "@/security/sessionUser";
import { ClientTypeQuery } from "@/types/QueryParams";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { StaffService } from "./staff.service";
import { UserService } from "./user.service";
import PasswordEncryptor from "./utils/passwordEncryptor";

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly staffService: StaffService,
        private readonly jwtService: JwtService,
    ) {}
    
    async validateUserToken(payload: SessionUser) {
        console.log('Payload: ', payload);

        if(payload.type === 'customer') {
            return await this.userService.getUserByUserId(payload.id)
                .then(u => u ? {
                    type: 'customer',
                    role: SecurityRole.USER,
                    id: u.userId
                }: null);
        } else if(payload.type === 'staff') {
            return await this.staffService.getMemberByStaffId(payload.id)
                .then(u => {
                    if(u) {
                        //const role = SecurityRole.OWNER;
                        const role = SecurityRole.fromStaffRole(u.role);
                        if(!role) return null;
                        return {
                            type: 'staff',
                            role: role,
                            id: u.staffId,
                        }
                    }
                    return null;
                });
        }

        return null;
    }

    async loginUser(userId: string, password: string) {
        return this.login('customer', userId, password);
    }
    async loginStaff(staffId: string, password: string) {
        return this.login('staff', staffId, password);
    }

    private async login(type: ClientTypeQuery, id: string, password: string): Promise<string> {
        let e: Error = undefined;
        
        const requiredPassword = type === 'staff'
            ? await this.staffService.getMemberByStaffId(id).then(member => {
                if(member) return member.password
                else e = new NoIdException();
            })
            : await this.userService.getUserByUserId(id).then(user => {
                if(user) return user.password
                else e = new NoIdException();
            });

        if(e) throw e;

        const encrypedPassword = PasswordEncryptor.encrypt(password);

        if(requiredPassword === encrypedPassword) {
            return this.jwtService.sign(<SessionUser> {
                type, id: id,
            });
        }

        throw UnauthorizedException;
    }
}