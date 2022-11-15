import { Type } from "class-transformer";
import { IsArray, IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";

export enum OrderDirection {
    ASC = 'ASC',
    DESC = 'DESC',
}

export class PageOptionsDto {
    @IsOptional()
    orderBy?: string;

    @IsEnum(OrderDirection) @IsOptional()
    readonly orderDirection?: OrderDirection;

    get orderable(): boolean {
        return this.orderBy !== undefined && this.orderDirection !== undefined;
    }

    @Type(() => Number) @Min(1)
    @IsInt() @IsOptional()
    readonly page?: number = 1;
    
    @Type(() => Number) @Min(1) @Max(100)
    @IsInt() @IsOptional()
    readonly take?: number = 10;

    get skip(): number {
        return (this.page - 1) * this.take;
    }
}

export class PageResultDto<T> {
    readonly page?: number;
    readonly pageMax?: number;
    readonly count?: number;
    readonly countMax?: number;

    @IsArray()
    readonly items: T[];

    constructor(options: PageOptionsDto|undefined, countMax: number, items: T[]) {
        if(options !== undefined) {
            this.page = options.page;
            this.pageMax = Math.ceil(countMax / options.take);
            this.count = items.length;
            this.countMax = countMax;
        }
        this.items = items;
    }
}

export type PageResultPromise<T> = Promise<PageResultDto<T>>;