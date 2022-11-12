import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { Observable } from "rxjs";
import { SessionUser } from "..";
import { SecurityRole } from "../role.enum";

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(
        protected readonly reflector: Reflector,
    ) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const requiredRoles = this.reflector.get<SecurityRole[]>('roles', context.getHandler());

        if(!requiredRoles) return true;

        const request = context.switchToHttp().getRequest<Request>();
        const user = request.user as SessionUser;

        console.log('SESSION USER: ', user);

        return user && this.matchRoles(requiredRoles, user.role);
    }

    private matchRoles(requiredRoles: SecurityRole[], userRole: SecurityRole): boolean {
        return requiredRoles.some(role => role === userRole);
    }
}