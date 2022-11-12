import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { Observable } from "rxjs";
import { SessionUser } from "..";
import { RoleGuard } from "./role.guard";

@Injectable()
export class ExclusiveOrRoleGuard extends RoleGuard {
    constructor(
        reflector: Reflector,
    ) {
        super(reflector);
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        if(super.canActivate(context)) {
            return true;
        }

        const parameterName = this.reflector.get<string>('param', context.getHandler());
        const request = context.switchToHttp().getRequest<Request>();
        const requiredId = request.params[parameterName];

        if(!requiredId) return false;
        
        const user = request.user as SessionUser;

        return user && user.id === requiredId;
    }
}