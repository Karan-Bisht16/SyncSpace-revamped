// importing types
import type { SettingSchema, UserClientBase } from '@syncspace/shared';

export type SessionInitReturnType = {
    user: UserClientBase,
    accessToken: string,
};

export type LoginParams = {
    email: string,
    password: string,
};

export type RegisterParams = LoginParams & {
    username: string,
    profilePic?: File | null,
    startupSettingStr: string,
};

export type RegisterViaGoogleParams = {};
export type LoginViaGoogleParams = {};
export type RegisterViaFacebookParams = {};
export type LoginViaFacebookParams = {};

export type ResetPasswordParams = {
    resetPasswordToken: string,
    newPassword: string,
};

export type ReauthParams = {
    password: string,
};

export type UpdateEmailParams = {
    newEmail: string,
};

export type UpdateSettingParams = {
    newSetting: SettingSchema;
};