import bcrypt from 'bcrypt';
import crypto from 'crypto';
// importing data
import { SALT_ROUNDS } from '../data/constants.js';

const sha256Hex = (data: crypto.BinaryLike) => {
    return crypto.createHash('sha256').update(data).digest();
};

export const hash = async (data: string | Buffer, urlSafe?: boolean) => {
    if (urlSafe) {
        return crypto
            .createHash('sha256')
            .update(data)
            .digest('base64url');
    }

    return await bcrypt.hash(sha256Hex(data), SALT_ROUNDS);
};

export const compare = async (data: string | Buffer, encrypted: string) => {
    return await bcrypt.compare(sha256Hex(data), encrypted);
};