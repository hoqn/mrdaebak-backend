import { SelectQueryBuilder } from "typeorm";

export class ListParams {
    public page: number;
    public take: number;

    constructor(page?: number, take?: number) {
        this.page = page ? page : 1;
        this.take = take ? take : 10;
    }

    public adaptTo(qb: SelectQueryBuilder<any>) {
        qb.limit(this.take).offset(this.take * (this.page - 1));
    }
}