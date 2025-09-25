import mongoose from 'mongoose';
import { ActionTypes, TargetTypes } from '@syncspace/shared';
// importing types
import type { InteractionDocument } from '@syncspace/shared';

export const interactionSchema = new mongoose.Schema<InteractionDocument>({
    description: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    action: {
        type: String,
        enum: ActionTypes,
        required: true,
    },
    target: {
        type: String,
        enum: TargetTypes,
        required: true,
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
    },
}, { timestamps: true });

interactionSchema.index({ userId: 1 });
interactionSchema.index({ createdAt: -1 });

export const Interaction = mongoose.model<InteractionDocument>('Interaction', interactionSchema);