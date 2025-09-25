// importing types
import type { ApiError, SettingSchema, UserClientBase } from '@syncspace/shared';
import type { ApiCallStatus } from '../../../../types';

export type UserSlice = {
    user: UserClientBase,
    isLoggedIn: boolean,
    status: Record<UserService, ApiCallStatus>,
    error: Record<UserService, ApiError | null>,
    prevSetting: SettingSchema | null,
    accessToken?: string,
    reauthMeta?: {
        active: boolean,
        retryMeta: RetryMeta,
    },
    needsReauth?: boolean,
};

export type UserReauthCallbackService = 'changePassword';

export type UserReauthThunkService =
    'determineReauth' |
    'deleteAccount' |
    'updateEmail';

// all services that require reauthentication
export type UserReauthService = UserReauthCallbackService | UserReauthThunkService;

// all services that require a valid access token
export type UserRefreshService =
    'fetchSession' |
    'reauth' |
    'updateSetting' |
    'resetSetting' |
    'logout' |
    'verifyEmail' |
    UserReauthService;

// all services 
export type UserService =
    'register' |
    'login' |
    'resetPassword' |
    'refresh' |
    UserRefreshService;

export type RetryMeta = {
    reauthService: UserReauthService,
    args?: any,
    callbackId?: string,
};