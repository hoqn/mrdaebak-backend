import { SetMetadata } from "@nestjs/common";
import { SecurityRole } from "./role.enum";

export const SecurityRoles = (...roles: SecurityRole[]) => SetMetadata('roles', roles);