import { AuthService } from "@/service";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy, StrategyOptions, VerifiedCallback } from "passport-jwt";
import { JWT_SECRET_KEY } from "./constants";
import { SessionUser } from "./sessionUser";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private authService: AuthService
    ) {
        super(<StrategyOptions>{
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: true,
            secretOrKey: JWT_SECRET_KEY,
        });
    }

    async validate(payload: SessionUser, done: VerifiedCallback) {
        const user = await this.authService.validateUserToken(payload);
        
        if(!user) return done(new UnauthorizedException(), false);

        return done(null, <SessionUser> {
            type: user.type,
            role: user.role,
            id: user.id,
        });
    }
}