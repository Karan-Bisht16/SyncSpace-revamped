import mongoose from 'mongoose';
import { ResourceTypes } from '@syncspace/shared';
// importing types
import type { FileSchema } from '@syncspace/shared';

export const fileSchema = new mongoose.Schema<FileSchema>({
    url: {
        type: String,
        trim: true,
        required: true,
    },
    publicId: {
        type: String,
        trim: true,
        required: true,
    },
    resourceType: {
        type: String,
        enum: ResourceTypes,
        trim: true,
        required: true,
    },
    format: {
        type: String,
        trim: true,
        required: true,
    }
});