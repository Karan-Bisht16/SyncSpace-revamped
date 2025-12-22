export const sharedConfig = {
    usernameRegex: /^[a-zA-Z0-9_]+$/,
    emailRegex: /^([a-zA-Z0-9_\.\-]+)@([a-zA-Z0-9_\.\-]+)\.([a-zA-Z]{2,})/,
    minPasswordLength: 6,
    maxPasswordLength: 100,
    maxUsernameLength: 50,
    maxProfilePicSizeMB: 1,
};


export const TokenActions = ['resetPassword', 'updateEmail', 'verifyEmail'] as const;
export type TokenAction = typeof TokenActions[number];


export const ResourceTypes = ['image', 'video', 'raw', 'auto'] as const;
export type ResourceType = typeof ResourceTypes[number];

export type FileSchema = {
    url: string,
    publicId: string
    resourceType: ResourceType,
    format: string,
};


// importing types
import type { UserAgentSchema } from './userAgent.schema.type.js';

export type RefreshTokenSchema = {
    tokenHash: string,
    uuid: string,
    userAgent: UserAgentSchema,
    ip?: String,
    lastLoginAt: Date,
    expiresAt: Date,
};


export const FeedLayouts = ['card', 'compact'] as const;
export type FeedLayout = typeof FeedLayouts[number];

export const Themes = ['light', 'dark', 'retro'] as const;
export type Theme = typeof Themes[number];

export type StartupSetting = {
    theme: Theme,
    feedLayout: FeedLayout,
    showMature: boolean,
    blurMature: boolean,
    autoplayMedia: boolean,
    openPostNewTab: boolean,
};

export type GeneralSetting = {
    markMature: boolean,
    showFollowers: boolean,
    allowFollow: boolean,
    pauseHistory: boolean,
};

export type SettingSchema = {
    startupSetting: StartupSetting,
    generalSetting?: GeneralSetting,
};

export const defaultStartupSetting: StartupSetting = {
    theme: 'dark',
    feedLayout: 'card',
    showMature: false,
    blurMature: true,
    autoplayMedia: false,
    openPostNewTab: false,
};

export const defaultGeneralSetting: GeneralSetting = {
    markMature: false,
    showFollowers: true,
    allowFollow: true,
    pauseHistory: false,
};

export const defaultSetting: SettingSchema = {
    startupSetting: defaultStartupSetting,
    generalSetting: defaultGeneralSetting,
};


export const SocialTypes = [
    'Custom',
    'SyncSpace',
    'Reddit',
    'Twitter',
    'Instagram',
    'Facebook',
    'LinkedIn',
    'TikTok',
    'Youtube',
] as const;
export type SocialType = typeof SocialTypes[number];

export type SocialSchema = {
    displayText: string
    url: string,
    type: SocialType,
};


export type UserAgentSchema = {
    raw: String,
    browser: {
        name?: String,
        version?: String,
    },
    os: {
        name?: String,
        version?: String,
    },
    device: {
        type?: String,
        model?: String,
    },
};


// importing types
import type { ObjectId } from 'mongoose';
import type { UserAgentSchema } from './schemas/userAgent.schema.type.js';

export type ErrorBase = {
    route: string,
    description: string,
    count: number,
    userId?: ObjectId,
    meta: {
        origin: string,
        userAgent: UserAgentSchema,
        ip: string,
        stack?: any,
    }
};

export type ErrorDocument = Document & ErrorBase;


// importing types
import type { Document, ObjectId } from 'mongoose';

export const ActionTypes = [
    'account-activity',
    'account-deactivated',
    'post-created',
    'post-commented',
    'post-liked',
    'post-saved',
    'post-shared',
    'subspace-joined',
    'subspace-left',
    'subspace-created',
] as const;
export type ActionType = typeof ActionTypes[number];

export const AbstractTargetTypes = ['account'] as const;
export type AbstractTargetType = typeof AbstractTargetTypes[number];

export const EntityTargetTypes = ['post', 'subspace', 'user', 'comment'] as const;
export type EntityTargetType = typeof EntityTargetTypes[number];

export const TargetTypes = [...AbstractTargetTypes, ...EntityTargetTypes] as const;
export type TargetType = typeof TargetTypes[number];

export type InteractionCore = {
    description: string,
    userId: ObjectId,
    action: ActionType,
};

export type InteractionWithTarget = {
    target: EntityTargetType;
    targetId: ObjectId;
} & InteractionCore;

export type InteractionWithAccount = {
    target: AbstractTargetType;
} & InteractionCore;

export type InteractionBase = InteractionWithTarget | InteractionWithAccount;

export type InteractionDocument = Document & InteractionBase;


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


export type ApiErrorParams = {
    code: number,
    message: string,
    context: string,
    trace: string,
    errors?: any,
    stack?: string
};


export type ApiResponseParams = {
    code: number,
    partial?: boolean,
    message: string
    data?: any,
    trace?: string,
};


export type IsFileAcceptedParams = {
    file: File | Express.Multer.File,
    accept: string,
};


// importing validators
import * as validator from '../../validators/type.validator.js';

export type SpecificType =
    'string' |
    'number' |
    'boolean' |
    'object' |
    'array' |
    'function' |
    'reactElement' |
    'stringOrReactElement';

export type SpecificValidators =
    | typeof validator.isString
    | typeof validator.isNumber
    | typeof validator.isBoolean
    | typeof validator.isObject
    | typeof validator.isArray
    | typeof validator.isFunction
    | typeof validator.isReactElement
    | typeof validator.isStringOrReactElement;


export type UserValidationField = 'email' | 'password' | 'username' | 'profilePic' | 'setting';
export type UserProfileValidationField = 'currentPassword' | 'newPassword';


// importing types
import type { UserProfileValidationField, UserValidationField } from './user.validator.type.js';

export type ValidationError = {
    src: UserValidationField | UserProfileValidationField,
    message: string,
};

export type IndexedValidationError = ValidationError & {
    index: number,
};


export * from './common/email.type.js';

export * from './models/error.model.type.js'
export * from './models/interaction.model.type.js';
export * from './models/user.model.type.js';
export * from './models/schemas/file.schema.type.js'
export * from './models/schemas/refreshToken.schema.type.js'
export * from './models/schemas/setting.schema.type.js'
export * from './models/schemas/social.schema.type.js'
export * from './models/schemas/userAgent.schema.type.js'

export * from './validators/user.validator.type.js';
export * from './validators/type.validator.type.js';
export * from './validators/validator.type.js';

export * from './utils/apiError.util.type.js';
export * from './utils/apiResponse.util.type.js';
export * from './utils/file.util.type.js';


// importing types
import type { ApiErrorParams } from '../types/index.js';

export class ApiError extends Error {
    code: number;
    success: boolean;
    message: string;
    context: string;
    trace: string;
    errors: any;
    stack: any;

    constructor(error: ApiErrorParams) {
        const { code, message, context, trace, errors, stack } = error;

        super(message);

        this.code = code;
        this.success = false;
        this.message = message || 'Something went wrong. Please try again later.';
        this.context = context || 'ERROR: No context provided';
        this.trace = trace;
        this.errors = errors || [];

        if (stack) {
            this.stack = stack || '';
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
};


// importing types
import type { ApiResponseParams } from '../types/index.js';

export class ApiResponse {
    code: number;
    success: boolean;
    partial: boolean;
    message: string;
    data: any;

    constructor(response: ApiResponseParams) {
        const { code, partial, message, data } = response;

        this.code = code;
        this.success = code < 400;
        this.partial = partial || false;
        this.message = message || 'Request completed successfully.';
        this.data = data || false;
    }
};


// importing utils
import { ApiError } from './apiError.util.js';
// importing validators
import { isObject } from '../validators/type.validator.js';

export const defaultError = new ApiError({
    code: 503,
    message: 'Network error. Please check your connection and try again.',
    context: 'Axios request failed due to no response (likely a network issue)',
    trace: '',
});

export const checkError = (error: any, code: number, trace: string) => {
    return error?.response?.data?.code === code && error?.response?.data?.trace === trace;
};

export const handleAxiosError = (error: unknown): ApiError => {
    if (
        isObject(error) && 'response' in error && error.response &&
        isObject(error.response) && 'data' in error.response && error.response.data
    ) {
        const { data } = error.response as Record<string, any>;

        return new ApiError({
            code: data?.code || 500,
            message: data?.message || 'Something went wrong. Please try again later.',
            context: data?.context || 'Received an error response from upstream Axios request',
            trace: data?.trace || 'handleAxiosError/response.data',
            errors: data?.errors || undefined,
            stack: data?.stack || undefined,
        });
    }

    let normalized: any = {};
    if (isObject(error) && 'message' in error) {
        normalized = {
            message: (error as any)?.message,
            code: (error as any)?.code,
            name: (error as any)?.name,
        };
    }

    return new ApiError({
        ...defaultError,
        trace: 'handleAxiosError/noResponseData',
        errors: normalized,
    });
};


// importing types
import type { IsFileAcceptedParams } from '../types/index.js';

export const isFileAccepted = (params: IsFileAcceptedParams): boolean => {
    const { file, accept } = params;

    const acceptedTypes = accept.split(',').map(type => type.trim());

    const fileType = 'type' in file ? file.type : file.mimetype;
    const fileName = 'name' in file ? file.name : file.originalname;

    return acceptedTypes.some(type => {
        if (type === '') {
            return false;
        }

        if (type === fileType) {
            return true;
        }

        if (type.endsWith('/*')) {
            const baseType = type.split('/')[0];
            return fileType?.startsWith(baseType + '/');
        }

        if (type.startsWith('.')) {
            return fileName?.toLowerCase().endsWith(type.toLowerCase());
        }

        return false;
    });
};

export const isMulterFile = (file: unknown): file is Express.Multer.File => {
    if (!file || typeof file !== 'object') {
        return false;
    }

    const requiredKeys = ['fieldname', 'originalname', 'encoding', 'mimetype', 'buffer', 'size'];
    for (const key of requiredKeys) {
        if (!(key in file)) {
            return false;
        }
    }

    return true;
};


export const formattedString = (string: string, length = 8) => {
    if (string.length > length) {
        return string.substring(0, 8) + '...';
    }
    return string;
};

export const toSentenceCase = (string: string) => {
    return string.charAt(0).toUpperCase() + string.substring(1, string.length);
};


const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const getLocalDateTime = (date: Date) => {
    return date.toLocaleString(undefined);
};

export const getCondenseDate = (date: Date) => {
    const month = months[date.getMonth()];
    return `${month.substring(0, 3)} ${date.getDate()}`;
};

export const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    const diffInMin = Math.floor(diffInSec / 60);
    const diffInHrs = Math.floor(diffInMin / 60);

    if (diffInSec < 60) {
        return `${diffInSec}s`;
    } else if (diffInMin < 60) {
        return `${diffInMin}m`;
    } else if (diffInHrs < 24) {
        return `${diffInHrs}h`;
    } else {
        return getCondenseDate(date);
    }
};

export const daysToMs = (days: number) => days * 24 * 60 * 60 * 1000;

export const hrsToMs = (hrs: number) => hrs * 60 * 60 * 1000;

export const minsToMs = (mins: number) => mins * 60 * 1000;

export const getUserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;


import { isValidElement } from 'react';
// impoting types
import type { SpecificType, SpecificValidators } from '../types/index.js';

export const isUndefined = (value: unknown): value is undefined => {
    return typeof value === 'undefined';
};

export const isString = (value: unknown): value is string => {
    return typeof value === 'string' && value.trim().length > 0;
};

export const isNumber = (value: unknown): value is number => {
    return typeof value === 'number';
};

export const isBoolean = (value: unknown): value is boolean => {
    return typeof value === 'boolean';
};

export const isObject = (value: unknown): value is object => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const isArray = (value: unknown): value is unknown[] => {
    return Array.isArray(value);
};

export const isNonEmptyArray = (value: unknown): value is unknown[] => {
    return Array.isArray(value) && value.length > 0;
};

export const isFunction = (value: unknown): value is Function => {
    return typeof (value) === 'function';
};

export const isReactElement = (value: unknown) => {
    return isValidElement(value);
};

export const isStringOrReactElement = (value: unknown) => {
    return isString(value) || isReactElement(value);
};

export const isOptionalType = (value: unknown, type: SpecificType) => {
    if (isUndefined(value)) {
        return true;
    }

    switch (type) {
        case 'string':
            return isString(value);
        case 'number':
            return isNumber(value);
        case 'boolean':
            return isBoolean(value);
        case 'object':
            return isObject(value);
        case 'array':
            return isArray(value);
        case 'function':
            return isFunction(value);
        case 'reactElement':
            return isReactElement(value);
        case 'stringOrReactElement':
            return isStringOrReactElement(value);
        default:
            return false;
    }
};

export const validate = (value: unknown, validatorFunction: SpecificValidators, context: string) => {
    if (!validatorFunction(value)) {
        console.log(`${context} is invalid; ${value}`);
        return false;
    }

    return true;
};

export const validateOptional = (value: unknown, type: SpecificType, context: string) => {
    if (!isOptionalType(value, type)) {
        console.log(`${context} is invalid; ${value}`);
        return false;
    }

    return true;
};


import { FeedLayouts, Themes } from '../types/index.js';
// importing data
import { sharedConfig } from '../data/constants.data.js';
// importing types
import type { FeedLayout, Theme, ValidationError } from '../types/index.js';
// importing utils
import { isFileAccepted, isMulterFile } from '../utils/file.util.js';
// importing validators
import { isBoolean, isObject, isString } from './type.validator.js';

const {
    emailRegex,
    usernameRegex,
    maxPasswordLength,
    maxProfilePicSizeMB,
    maxUsernameLength,
    minPasswordLength,
} = sharedConfig;

export const validateEmail = (email: unknown): true | ValidationError => {
    let validationMessage;
    if (!isString(email)) {
        validationMessage = 'No email provided';
    } else if (!emailRegex.test(email)) {
        validationMessage = 'Email is invalid';
    } else {
        return true;
    }

    return { message: validationMessage, src: 'email' };
};

export const validatePassword = (password: unknown): true | ValidationError => {
    let validationMessage;
    if (!isString(password)) {
        validationMessage = 'No password provided';
    } else if (password.length < minPasswordLength) {
        validationMessage = `Password must be atleast ${minPasswordLength} characters long`;
    } else if (password.length > maxPasswordLength) {
        validationMessage = `Password can be atmost ${maxPasswordLength} characters long`;
    } else {
        return true;
    }

    return { message: validationMessage, src: 'password' };
};

export const validateCurrentPassword = (password: unknown): true | ValidationError => {
    const validation = validatePassword(password);
    if (validation !== true) {
        return { ...validation, src: 'currentPassword' };
    }

    return validation;
};

export const validateNewPassword = (password: unknown): true | ValidationError => {
    const validation = validatePassword(password);
    if (validation !== true) {
        return { ...validation, src: 'newPassword' };
    }

    return validation;
};

export const validateUsername = (username: unknown): true | ValidationError => {
    let validationMessage;
    if (!isString(username)) {
        validationMessage = 'No user name provided';
    } else if (!usernameRegex.test(username)) {
        validationMessage = 'User name is invalid';
    } else if (username.length > maxUsernameLength) {
        validationMessage = `User name can be atmost ${maxUsernameLength} characters long`;
    } else {
        return true;
    }

    return { message: validationMessage, src: 'username' };
};

export const validateProfilePic = (profilePic: unknown): true | ValidationError => {
    let validationMessage;
    if (!(profilePic instanceof File || isMulterFile(profilePic))) {
        validationMessage = 'No file provided';
    } else if (profilePic.size > maxProfilePicSizeMB * 1024 * 1024) {
        validationMessage = `User profile photo can be atmost ${maxProfilePicSizeMB}MB`;
    } else if (!isFileAccepted({ file: profilePic, accept: 'image/*' })) {
        const profilePicType = 'type' in profilePic ? profilePic.type : profilePic.mimetype;
        validationMessage = `File type ${profilePicType} not allowed. Only image types are allowed`;
    } else {
        return true;
    }

    return { message: validationMessage, src: 'profilePic' };
};

export const validateStartupSetting = (startupSetting: unknown): true | ValidationError => {
    let validationMessage;
    if (!isObject(startupSetting)) {
        validationMessage = 'No setting provided';
    } else if (!('theme' in startupSetting && Themes.includes(startupSetting.theme as Theme))) {
        validationMessage = `Invalid 'Theme' provided`;
    } else if (!('feedLayout' in startupSetting && FeedLayouts.includes(startupSetting.feedLayout as FeedLayout))) {
        validationMessage = `Invalid 'Feed Layout' provided`;
    } else if (!('showMature' in startupSetting && isBoolean(startupSetting.showMature))) {
        validationMessage = `Invalid 'Show Mature' provided`;
    } else if (!('blurMature' in startupSetting && isBoolean(startupSetting.blurMature))) {
        validationMessage = `Invalid 'Blur Mature' provided`;
    } else if (!('autoplayMedia' in startupSetting && isBoolean(startupSetting.autoplayMedia))) {
        validationMessage = `Invalid 'Autoplay Media' provided`;
    } else if (!('openPostNewTab' in startupSetting && isBoolean(startupSetting.openPostNewTab))) {
        validationMessage = `Invalid 'Open Post in new Tab' provided`;
    } else {
        return true;
    }

    return { message: validationMessage, src: 'setting' };
};

export const validateGeneralSetting = (generalSetting: unknown): true | ValidationError => {
    let validationMessage;
    if (!isObject(generalSetting)) {
        validationMessage = 'No setting provided';
    } else if (!('markMature' in generalSetting && isBoolean(generalSetting.markMature))) {
        validationMessage = `Invalid 'Mark Mature' provided`;
    } else if (!('showFollowers' in generalSetting && isBoolean(generalSetting.showFollowers))) {
        validationMessage = `Invalid 'Show Followers' provided`;
    } else if (!('allowFollow' in generalSetting && isBoolean(generalSetting.allowFollow))) {
        validationMessage = `Invalid 'Allow Follow' provided`;
    } else if (!('pauseHistory' in generalSetting && isBoolean(generalSetting.pauseHistory))) {
        validationMessage = `Invalid 'Pause History' provided`;
    } else {
        return true;
    }

    return { message: validationMessage, src: 'setting' };
};

export const validateSetting = (setting: unknown): true | ValidationError => {
    let validationMessage;
    if (!isObject(setting)) {
        validationMessage = 'No setting provided';
    } else if (!('startupSetting' in setting && validateStartupSetting(setting.startupSetting) === true)) {
        validationMessage = `Invalid 'Startup Setting' provided`;
    } else if (!('generalSetting' in setting && validateGeneralSetting(setting.generalSetting) === true)) {
        validationMessage = `Invalid 'General Setting' provided`;
    } else {
        return true;
    }

    return { message: validationMessage, src: 'setting' };
};

// TODO: add a validateReauthPassword for different error messsage
// or just pass src/type in arg so that we can send different error messages based on that
// like validate password can have src: login, register, reauth


import { v7 as uuidv7 } from 'uuid';
// importing types
import type { IndexedValidationError, ValidationError } from './types/index.js';

export * from './data/constants.data.js';

export * from './types/index.js';

export * from './utils/apiError.util.js';
export * from './utils/apiResponse.util.js';
export * from './utils/error.util.js';
export * from './utils/string.util.js';
export * from './utils/time.util.js';

export * from './validators/user.validator.js';
export * from './validators/type.validator.js';

export const sharedStr = `From @syncspace/shared: ${uuidv7()}`;

export const validateAll = (
    ...results: (true | ValidationError)[]
): true | IndexedValidationError => {
    const index = results.findIndex(result => result !== true);

    if (index === -1) {
        return true;
    }

    const error = results[index] as ValidationError;
    return { index, ...error };
};


{
    "watch": [
        "src"
    ],
    "ext": "ts",
    "exec": "npm run build && npm run start"
}


{
    "name": "@syncspace/shared",
    "version": "0.0.0",
    "description": "Shared files for SyncSpace",
    "type": "module",
    "main": "./dist/index.js",
    "types": "./dist/index.d.ts",
    "scripts": {
        "build": "tsc --project tsconfig.json",
        "dev": "nodemon",
        "start": "node dist/index.js",
        "test": "echo \"Error: no test specified\" && exit 1"
    },
    "dependencies": {
        "uuid": "^11.1.0"
    },
    "devDependencies": {
        "nodemon": "^3.1.10"
    },
    "repository": {
        "type": "git",
        "url": "[ADD]"
    },
    "author": "Karan_Bisht16",
    "license": "ISC"
}


{
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
        "rootDir": "src",
        "outDir": "dist",
        "declaration": true,
        "declarationMap": true,
        "sourceMap": true
    },
    "include": [
        "src/**/*"
    ],
    "exclude": [
        "dist"
    ]
}