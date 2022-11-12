interface IResBody {
    code: number;
    message: string;
    result: any?;
}

export type ResBody = Required<IResBody>;