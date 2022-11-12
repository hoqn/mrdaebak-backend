import { Column, Entity } from "typeorm";

@Entity("steak_doneness_degree", { schema: "cowball_mrdaebak" })
export class SteakDonenessDegree {
  @Column("int", { primary: true, name: "degree_id" })
  degreeId: number;

  @Column("varchar", { name: "degree_en", nullable: true, length: 255 })
  degreeEn: string | null;

  @Column("varchar", { name: "degree_ko", nullable: true, length: 255 })
  degreeKo: string | null;
}
