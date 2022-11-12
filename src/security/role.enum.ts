import { StaffRole } from "@/model/entity";

export enum SecurityRole {
    USER = 0x00,
    STAFF_DELIVERY = 0x11,
    STAFF_COOK = 0x12,
    OWNER = 0x20,
}

export namespace SecurityRole {
    export function fromStaffRole(staffRole: StaffRole): SecurityRole | null {
        const _StaffRoleToSecurityRole = {
            [StaffRole.OWNER]: SecurityRole.OWNER,
            [StaffRole.COOK]: SecurityRole.STAFF_COOK,
            [StaffRole.DELIVERY]: SecurityRole.STAFF_DELIVERY,
        };

        if (staffRole in _StaffRoleToSecurityRole)
            return _StaffRoleToSecurityRole[staffRole];
        else
            return null;
    }
    export function toStaffRole(securityRole: SecurityRole): StaffRole | null {
        const _SecurityRoleToStaffRole = {
            [SecurityRole.OWNER]: StaffRole.OWNER,
            [SecurityRole.STAFF_COOK]: StaffRole.COOK,
            [SecurityRole.STAFF_DELIVERY]: StaffRole.DELIVERY,
        };

        if (securityRole in _SecurityRoleToStaffRole)
            return _SecurityRoleToStaffRole[securityRole];
        else
            return null;
    }
}