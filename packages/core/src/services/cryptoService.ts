import crypto from 'crypto';

export class CryptoService {
    valueToUniqueString(value: string) {
        return crypto.createHash('md5').update(value).digest('hex');
    }
}

export default new CryptoService();
