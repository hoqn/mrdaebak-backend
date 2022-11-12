import { ListParams } from "./list.params";

export class ListResult<T> {
    public readonly page: number;
    public readonly pageMax: number;
    public readonly length: number;
    public readonly lengthMax: number;
    public readonly items: T[];

    constructor(params: ListParams, lengthMax: number, items: T[]) {
        this.page = params.page;
        this.pageMax = Math.max(Math.ceil(lengthMax/params.take), 1),
        this.length = items.length;
        this.lengthMax = lengthMax;
        this.items = items;
    }
}

export declare type ListResultPromise<T> = Promise<ListResult<T>>;