import { Column, Entity } from "typeorm";

export enum StaffRole {
  PENDING = 0,
  DELIVERY = 1,
  COOK = 2,
  OWNER = 9,
}

@Entity("staff", { schema: "cowball_mrdaebak" })
export class Staff {
  @Column("varchar", { primary: true, name: "staff_id", length: 50 })
  staffId: string;

  @Column("varchar", { name: "staff_name", nullable: true, length: 50 })
  staffName: string | null;

  @Column("varchar", { name: "password", nullable: true, length: 255 })
  password: string | null;

  @Column("varchar", { name: "phone_number", nullable: true, length: 50 })
  phoneNumber: string | null;

  @Column("int", { name: "role", nullable: false })
  role: StaffRole = StaffRole.PENDING;

  @Column("timestamp", { name: "join_date", nullable: true })
  joinDate: Date | null;
}
