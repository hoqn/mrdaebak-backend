import { SecurityRole } from "./role.enum";

export enum ClientType {
    USER = 'USER',
    STAFF = 'STAFF',
}

export interface SessionUser {
    type: ClientType;
    id: string;
    role: SecurityRole;
}