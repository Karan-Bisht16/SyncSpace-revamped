import mongoose from 'mongoose';
import { FeedLayouts, Themes } from '@syncspace/shared';
// importing types
import type { SettingSchema } from '@syncspace/shared';

export const settingSchema = new mongoose.Schema<SettingSchema>({
    startupSetting: {
        theme: {
            type: String,
            enum: Themes,
            required: true,
        },
        feedLayout: {
            type: String,
            enum: FeedLayouts,
            required: true,
        },
        showMature: {
            type: Boolean,
            required: true,
        },
        blurMature: {
            type: Boolean,
            required: true,
        },
        autoplayMedia: {
            type: Boolean,
            required: true,
        },
        openPostNewTab: {
            type: Boolean,
            required: true,
        },
    },
    generalSetting: {
        markMature: {
            type: Boolean,
            required: true,
        },
        showFollowers: {
            type: Boolean,
            required: true,
        },
        allowFollow: {
            type: Boolean,
            required: true,
        },
        pauseHistory: {
            type: Boolean,
            required: true,
        },
    },
});