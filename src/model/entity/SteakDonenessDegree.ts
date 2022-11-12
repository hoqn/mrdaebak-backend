import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("steak_doneness_degree")
export class SteakDonenessDegree {
  @PrimaryColumn("int")
  degreeId: number;

  @Column("varchar", { length: 255 })
  degreeEn: string;

  @Column("varchar", { length: 255 })
  degreeKo: string;
}
