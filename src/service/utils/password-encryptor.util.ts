import * as crypto from 'crypto';

/**
 * 이후 salt 추가할까?
 * https://velog.io/@jiheon/Node.js-crypto%EB%A1%9C-%EB%B9%84%EB%B0%80%EB%B2%88%ED%98%B8-%EC%95%94%ED%98%B8%ED%99%94%ED%95%98%EA%B8%B0#%EB%B9%84%EB%B0%80%EB%B2%88%ED%98%B8-%EC%95%94%ED%98%B8%ED%99%94%ED%95%98%EA%B8%B0
 */

export default class PasswordEncryptor {
    private constructor() { }

    private static readonly hashAlgorithm = 'sha512';
    //private static readonly salt = process.env.PASSWORD_ENC_SECRET;

    public static encrypt(password: string) {
        return crypto.createHash(this.hashAlgorithm)
            .update(password)
            .digest('base64');
    }
}