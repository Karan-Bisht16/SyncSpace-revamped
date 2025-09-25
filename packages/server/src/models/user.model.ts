import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { AuthProviders, Roles, sharedConfig } from '@syncspace/shared';
// importing config
import {
    ACCESS_TOKEN_EXPIRY,
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRY,
    REFRESH_TOKEN_SECRET
} from '../config/env.config.js';
// importing types
import type { Query } from 'mongoose';
import type { UserDocument, UserModel, UserQueryHelpers } from '@syncspace/shared';
// importing lib
import { compare, hash } from '../lib/bcrypt.lib.js';
// importing schemas
import { fileSchema } from './schemas/file.schema.js';
import { refreshTokenSchema } from './schemas/refreshToken.schema.js';
import { settingSchema } from './schemas/setting.schema.js';
import { socialSchema } from './schemas/social.schema.js';

const { emailRegex, usernameRegex } = sharedConfig;

export const userSchema = new mongoose.Schema<UserDocument, UserModel, {}, UserQueryHelpers>({
    auth: {
        authProvider: {
            type: String,
            enum: AuthProviders,
            required: true,
        },
        credentials: {
            type: String,
            required: true,
            select: false,
        },
        refreshTokens: {
            type: [refreshTokenSchema],
            default: [],
            select: false,
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: usernameRegex,
        lowercase: true,
        maxLength: 50,
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        match: emailRegex,
        lowercase: true
    },
    profilePic: {
        highRes: {
            type: fileSchema,
        },
        lowRes: {
            type: fileSchema,
        },
    },
    banner: {
        highRes: {
            type: fileSchema,
        },
        lowRes: {
            type: fileSchema,
        },
    },
    bio: {
        type: String,
        trim: true,
        maxLength: 100,
    },
    socials: {
        type: [socialSchema],
    },
    roles: {
        type: [String],
        enum: Roles,
        default: ['user'],
    },
    setting: {
        type: settingSchema,
        required: true,
    },
    deleted: {
        isDeleted: {
            type: Boolean,
            default: false,
        },
        email: {
            type: String,
            trim: true,
            match: emailRegex,
            lowercase: true
        },
    },
    followingCount: {
        type: Number,
        default: 0,
    },
    followersCount: {
        type: Number,
        default: 0,
    },
    subspacesJoinedCount: {
        type: Number,
        default: 0,
    },
    subspacesCreatedCount: {
        type: Number,
        default: 0,
    },
    postsCount: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

// NOTE: only use .save() after this
// for any other operation make use of findAndUpdate or findByIdAndUpdate
// otherwise mongoDB verion error changes would increase
userSchema.pre('save', async function (next) {
    if (!this.isModified('auth.credentials')) {
        return next();
    }

    this.auth.credentials = await hash(this.auth.credentials?.toString());
    next();
});

userSchema.pre<Query<any, UserDocument>>(/^find/, function (next) {
    if (this.getOptions()?._withDeleted) {
        next();
        return;
    }

    this.setQuery({ ...this.getQuery(), 'deleted.isDeleted': false });
    next();
});

userSchema.query.withAuthSecrets = function () {
    return this.select('+auth.credentials +auth.refreshTokens');
};

userSchema.methods.generateAccessToken = function (uuid: string) {
    return jwt.sign(
        { _id: this._id, uuid },
        ACCESS_TOKEN_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY as any || '15m' }
    );
};

userSchema.methods.generateRefreshToken = function (uuid: string) {
    return jwt.sign(
        { _id: this._id, uuid },
        REFRESH_TOKEN_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRY as any || '10d' }
    );
};

userSchema.methods.verifyCredentials = async function (credentials: string) {
    return await compare(credentials, this.auth.credentials);
};

export const User: UserModel = mongoose.model<UserDocument, UserModel>('User', userSchema);