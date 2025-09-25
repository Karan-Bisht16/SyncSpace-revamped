import mongoose from 'mongoose';
// importing types
import type { UserAgentSchema } from '@syncspace/shared';

export const userAgentSchema = new mongoose.Schema<UserAgentSchema>({
    raw: {
        type: String,
        required: true,
    },
    browser: {
        name: {
            type: String,
        },
        version: {
            type: String,
        },
    },
    os: {
        name: {
            type: String,
        },
        version: {
            type: String,
        },
    },
    device: {
        type: {
            type: String,
        },
        model: {
            type: String,
        },
    },
});