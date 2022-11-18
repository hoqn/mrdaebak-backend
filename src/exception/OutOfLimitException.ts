export class OutOfLimitException extends Error {
    constructor(message?: string) {
       super(message);
    }
}