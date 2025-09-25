import mongoose from 'mongoose';
// importing types
import type { RefreshTokenSchema } from '@syncspace/shared';
// importing schemas
import { userAgentSchema } from './userAgent.schema.js';

export const refreshTokenSchema = new mongoose.Schema<RefreshTokenSchema>({
    tokenHash: {
        type: String,
        required: true,
    },
    uuid: {
        type: String,
        required: true,
    },
    userAgent: {
        type: userAgentSchema,
        required: true,
    },
    ip: {
        type: String,
    },
    lastLoginAt: {
        type: Date,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
});