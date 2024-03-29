import { Exclude } from "class-transformer";
import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";
import { StaffRole } from "../enum";

@Entity("staff")
export class Staff {

  @PrimaryColumn("varchar", { length: 50 })
  staffId: string;

  @Column("varchar", { length: 50 })
  staffName: string;

  @Column("varchar", { length: 255 })
  @Exclude()
  password: string;

  @Column("varchar", { nullable: true, length: 50 })
  phoneNumber: string | null;

  @Column("int", { default: StaffRole.PENDING_COOK })
  role: StaffRole;

  @CreateDateColumn({ type: 'timestamp' })
  joinDate: Date;
}
