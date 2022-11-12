import { SelectQueryBuilder } from "typeorm";

export type OrderDirection = 'ASC' | 'DESC';

export class OrderParams {
    public by: string;
    public direction: OrderDirection;

    constructor(by: string, direction?: OrderDirection) {
        this.by = by;
        this.direction = direction ? direction : 'ASC';
    }

    public adaptTo(qb: SelectQueryBuilder<any>) {
        qb.orderBy(this.by, this.direction);
    }
}