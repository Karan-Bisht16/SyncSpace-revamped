import mongoose from 'mongoose';
// importing types
import type { ErrorDocument } from '@syncspace/shared';
// importing schemas
import { userAgentSchema } from './schemas/userAgent.schema.js';

export const errorSchema = new mongoose.Schema<ErrorDocument>({
    route: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    count: {
        type: Number,
        default: 0,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    meta: {
        origin: {
            type: String,
        },
        ip: {
            type: String,
        },
        userAgent: {
            type: userAgentSchema,
            required: true,
        },
        stack: {
            type: mongoose.Schema.Types.Mixed,
        },
    },
}, { timestamps: true });

errorSchema.index({ route: 1, 'meta.origin': 1 });
errorSchema.index({ createdAt: -1 });

export const Error = mongoose.model<ErrorDocument>('Error', errorSchema);