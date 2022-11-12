import { ClientTypeQuery } from "@/types/QueryParams";
import { SecurityRole } from "./role.enum";

export interface SessionUser {
    type: ClientTypeQuery;
    id: string;
    role: SecurityRole;
}