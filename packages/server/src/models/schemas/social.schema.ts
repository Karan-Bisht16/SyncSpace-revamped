import mongoose from 'mongoose';
import { SocialTypes } from '@syncspace/shared';
// importing types
import type { SocialSchema } from '@syncspace/shared';

export const socialSchema = new mongoose.Schema<SocialSchema>({
    displayText: {
        type: String,
        trim: true,
        required: true,
    },
    url: {
        type: String,
        trim: true,
        required: true,
    },
    type: {
        type: String,
        enum: SocialTypes,
        trim: true,
        required: true,
    },
});