export class NoIdException extends Error {
    constructor() {
        super('ID가 존재하지 않습니다.');
    }
}