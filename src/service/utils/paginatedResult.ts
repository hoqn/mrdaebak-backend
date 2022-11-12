export class PaginationResult<T> {
    page: number;
    pageMax: number;
    length: number;
    lengthMax: number;
    items: T[];
}

export namespace PaginationResult {
    export function from<T>(options: PaginationOptions, lengthMax: number, items: T[]) {
        return <PaginationResult<T>> {
            page: options.page,
            pageMax: Math.max(Math.ceil(lengthMax / options.take), 1),
            length: items.length,
            lengthMax: lengthMax,
            items,
        };
    }
}

export interface PaginationOptions {
    page: number;
    take: number;
}

export namespace PaginationOptions {
    export const defaultOption = <PaginationOptions> {
        page: 1, take: 10,
    };

    export function from(page: number, take?: number) {
        const options = <PaginationOptions>{
            ...defaultOption,
            page: page
        };

        if(take) options.take = take;

        return options;
    }
}