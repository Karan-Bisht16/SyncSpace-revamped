import { defaultSetting } from './schemas/setting.schema.type.js';
// importing types
import type { Document, Model, QueryWithHelpers } from 'mongoose';
import type { FileSchema } from './schemas/file.schema.type.js';
import type { RefreshTokenSchema } from './schemas/refreshToken.schema.type.js';
import type { SettingSchema } from './schemas/setting.schema.type.js';
import type { SocialSchema } from './schemas/social.schema.type.js';

export const AuthProviders = ['email', 'google', 'facebook'] as const;
export type AuthProvider = typeof AuthProviders[number];

export const Roles = ['user', 'moderator'] as const;
export type Role = typeof Roles[number];

export type UserBase = {
    username: string,
    email: string,
    profilePic?: {
        highRes: FileSchema,
        lowRes: FileSchema,
    },
    banner?: {
        highRes: FileSchema,
        lowRes: FileSchema,
    },
    bio?: string,
    socials?: SocialSchema[],
    roles: Role[],
    followingCount: number,
    followersCount: number,
    subspacesJoinedCount: number,
    subspacesCreatedCount: number,
    postsCount: number,
    setting: SettingSchema,
    deleted: {
        isDeleted: false,
    } | {
        isDeleted: true,
        email: String,
    },
    createdAt?: Date,
    updatedAt?: Date,
};

// server-side
export type UserServerBase = UserBase & {
    auth: {
        authProvider: AuthProvider,
        credentials: string,
        refreshTokens: [RefreshTokenSchema],
        isEmailVerified: boolean,
    },
    generateAccessToken: (uuid: string) => Promise<string>,
    generateRefreshToken: (uuid: string) => Promise<string>,
    verifyCredentials: (credentials: string) => Promise<boolean>,
};

export type UserDocument = Document & UserServerBase;

export type UserQueryHelpers = {
    withAuthSecrets(this: QueryWithHelpers<any, UserDocument, UserQueryHelpers>):
        QueryWithHelpers<any, UserDocument, UserQueryHelpers>;
};

export type UserModel = Model<UserDocument, UserQueryHelpers>;

// client-side
export type UserClientBase = UserBase & {
    auth: {
        authProvider?: AuthProvider;
        isEmailVerified: boolean;
    },
};

export const emptyUser: UserClientBase = {
    auth: {
        isEmailVerified: false,
    },
    username: '',
    email: '',
    setting: defaultSetting,
    followingCount: 0,
    followersCount: 0,
    subspacesJoinedCount: 0,
    subspacesCreatedCount: 0,
    postsCount: 0,
    roles: [],
    deleted: {
        isDeleted: false
    },
};