// importing types
import type { UserAgentSchema } from './userAgent.schema.type.js';

export type RefreshTokenSchema = {
    tokenHash: string,
    uuid: string,
    userAgent: UserAgentSchema,
    ip?: String,
    lastLoginAt: Date,
    expiresAt: Date,
};