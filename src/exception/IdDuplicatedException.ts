export class IdDuplicatedException extends Error{
    constructor() { super('ID가 중복되었습니다.'); }
}