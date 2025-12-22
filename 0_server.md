// importing config
import { CORS_ORIGINS } from './env.config.js';

export const corsWhitelist = CORS_ORIGINS?.split(',').map((url) => url.trim()) || [];

export const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin || corsWhitelist.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`Not allowed by CORS - ${origin}`));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    optionsSuccessStatus: 200,
};


import 'dotenv/config';

const requiredEnvs = [
    'MODE',
    'PORT',
    'CORS_ORIGINS',
    'MONGODB_URI',
    'ACCESS_TOKEN_SECRET',
    'ACCESS_TOKEN_EXPIRY',
    'ACCESS_TOKEN_EXPIRY_MINUTES',
    'REFRESH_TOKEN_SECRET',
    'REFRESH_TOKEN_EXPIRY',
    'REFRESH_TOKEN_EXPIRY_DAYS',
    'REFRESH_TOKEN_BUFFER_DAYS',
    'RE_AUTH_BUFFER_MINUTES',
    'EMAIL_SECRET',
    'RESET_PASSWORD_EXPIRY',
    'UPDATE_EMAIL_EXPIRY',
    'VERIFY_EMAIL_EXPIRY',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'NODEMAILER_APP_NAME',
    'NODEMAILER_EMAIL',
    'NODEMAILER_APP_PASSWORD',
] as const;

requiredEnvs.forEach((key) => {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
});

export const MODE = process.env.MODE!;
export const PORT = process.env.PORT!;
export const CORS_ORIGINS = process.env.CORS_ORIGINS!;
export const MONGODB_URI = process.env.MONGODB_URI!;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
export const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY!;
export const ACCESS_TOKEN_EXPIRY_MINUTES = Number(process.env.ACCESS_TOKEN_EXPIRY_MINUTES!);
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
export const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY!;
export const REFRESH_TOKEN_EXPIRY_DAYS = Number(process.env.REFRESH_TOKEN_EXPIRY_DAYS!);
export const REFRESH_TOKEN_BUFFER_DAYS = Number(process.env.REFRESH_TOKEN_BUFFER_DAYS!);
export const RE_AUTH_BUFFER_MINUTES = Number(process.env.RE_AUTH_BUFFER_MINUTES!);
export const EMAIL_SECRET = process.env.EMAIL_SECRET!;
export const RESET_PASSWORD_EXPIRY = process.env.RESET_PASSWORD_EXPIRY!;
export const UPDATE_EMAIL_EXPIRY = process.env.UPDATE_EMAIL_EXPIRY!;
export const VERIFY_EMAIL_EXPIRY = process.env.VERIFY_EMAIL_EXPIRY!;
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY!;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET!;
export const NODEMAILER_APP_NAME = process.env.NODEMAILER_APP_NAME!;
export const NODEMAILER_EMAIL = process.env.NODEMAILER_EMAIL!;
export const NODEMAILER_APP_PASSWORD = process.env.NODEMAILER_APP_PASSWORD!;


import {
    ApiError,
    ApiResponse,
    validateAll,
    validateEmail,
    validateUsername,
} from '@syncspace/shared';
// importing models
import { User } from '../../models/user.model.js';
// importing utils
import { asyncReqHandler } from '../../utils/asyncReqHandler.util.js';
import { validateReqQuery } from '../../utils/validateReq.util.js';
// importing responses 
import {
    AvailabilityAuthControllerResponses as responses,
} from '../../responses/index.js';

export const isEmailAvailable = asyncReqHandler(async (req) => {
    const { email } = validateReqQuery(req);
    const { isEmailAvailable: emailRes } = responses;

    const validation = validateAll(validateEmail(email));
    if (validation !== true) {
        throw new ApiError({ ...emailRes.validationFailure, message: validation.message });
    }

    const emailStr = (email as string).toLowerCase();
    const userExists = await User.exists({ email: emailStr });
    if (userExists) {
        throw new ApiError(emailRes.userExists);
    }

    return new ApiResponse(emailRes.success);
});

export const isUsernameAvailable = asyncReqHandler(async (req) => {
    const { username } = validateReqQuery(req);
    const { isUsernameAvailable: usernameRes } = responses;

    const validation = validateAll(validateUsername(username));
    if (validation !== true) {
        throw new ApiError({ ...usernameRes.validationFailure, message: validation.message });
    }

    const usernameStr = (username as string).toLowerCase();
    const userExists = await User.exists({ username: usernameStr }).setOptions({ _withDeleted: true });;
    if (userExists) {
        throw new ApiError(usernameRes.userExists);
    }

    return new ApiResponse(usernameRes.success);
});


import {
    ApiError,
    ApiResponse,
    validateAll,
    validateEmail,
    validateUsername,
    validatePassword,
    validateProfilePic,
    validateStartupSetting,
    defaultGeneralSetting,
} from '@syncspace/shared';
// importing config
import { REFRESH_TOKEN_SECRET } from '../../config/env.config.js';
// importing data
import { COOKIES_OPTION } from '../../data/constants.js';
// importing types
import type { FileSchema, RefreshTokenSchema, UserDocument } from '@syncspace/shared';
// importing models
import { User } from '../../models/user.model.js';
// importing libs
import { compare } from '../../lib/bcrypt.lib.js';
import { uploadToCloudinary } from '../../lib/cloudinary.lib.js';
import { jwtAuthDecode, jwtAuthVerify } from '../../lib/jwt.lib.js';
import { compressWebp, convertToWebp } from '../../lib/sharp.lib.js';
// importing services
import {
    getRefreshTokenUsingAccessToken,
    initSessionTokens,
    renewSessionTokens,
} from '../../services/auth.service.js';
import { getUserState } from '../../services/user.service.js';
// importing utils
import { asyncReqHandler } from '../../utils/asyncReqHandler.util.js';
import { validateReqBody } from '../../utils/validateReq.util.js';
// importing responses 
import {
    LifecycleAuthControllerResponses as responses,
    getLifecycleAuthControllerResponse as getResponses,
} from '../../responses/index.js';

export const register = asyncReqHandler(async (req, res) => {
    const { email, password, username, startupSettingStr } = validateReqBody(req);
    const startupSettingObj = JSON.parse(startupSettingStr);
    const profilePic = req.file;
    const { register: registerRes } = responses;

    const validations = [
        validateEmail(email),
        validatePassword(password),
        validateUsername(username),
        validateStartupSetting(startupSettingObj),
        ...(profilePic ? [validateProfilePic(profilePic)] : []),
    ];
    const validation = validateAll(...validations);
    if (validation !== true) {
        throw new ApiError({ ...registerRes.validationFailure, message: validation.message });
    }

    const emailStr = (email as string).toLowerCase();
    const credentialsStr = password;
    const usernameStr = (username as string).toLowerCase();

    const [emailExists, usernameExists] = await Promise.all([
        User.exists({ email: emailStr }),
        User.exists({ username: usernameStr }),
    ]);

    if (emailExists) {
        throw new ApiError(registerRes.emailExists);
    }
    if (usernameExists) {
        throw new ApiError(registerRes.usernameExists);
    }

    let profilePicFlag;
    let profilePicObj = {
        highRes: {} as FileSchema,
        lowRes: {} as FileSchema
    };
    if (profilePic) {
        const highResBuffer = await convertToWebp({ fileBuffer: profilePic.buffer });
        const lowResBuffer = await compressWebp({ webpBuffer: highResBuffer });

        const [highResResult, lowResResult] = await Promise.all([
            uploadToCloudinary({ fileBuffer: highResBuffer }),
            uploadToCloudinary({ fileBuffer: lowResBuffer }),
        ]);

        profilePicObj = {
            highRes: {
                url: highResResult.url,
                publicId: highResResult.public_id,
                resourceType: highResResult.resource_type,
                format: highResResult.format,
            },
            lowRes: {
                url: lowResResult.url,
                publicId: lowResResult.public_id,
                resourceType: lowResResult.resource_type,
                format: lowResResult.format,
            },
        };

        profilePicFlag = true;
    }

    const newUser = await User.create({
        auth: {
            authProvider: 'email',
            credentials: credentialsStr,
        },
        username: usernameStr,
        email: emailStr,
        profilePic: profilePicFlag ? profilePicObj : undefined,
        setting: {
            startupSetting: startupSettingObj,
            generalSetting: defaultGeneralSetting,
        },
    });

    const user = newUser as UserDocument;

    const { accessToken, refreshToken } = await initSessionTokens({ req, user });
    res.cookie('refreshToken', refreshToken, COOKIES_OPTION);
    req.user = user;

    const { register: dynamicRegisterRes } = getResponses(user);

    return new ApiResponse({
        ...dynamicRegisterRes.success,
        data: { user: getUserState(user), accessToken },
    });
}, {
    action: 'account-activity',
    target: 'account',
    description: 'Start of your journey!',
});

// }, (req, data) => { return { action: '', target: '', description: '' } });
export const login = asyncReqHandler(async (req, res) => {
    const { email, password } = validateReqBody(req);
    const { login: loginRes } = responses;

    const validation = validateAll(validateEmail(email), validatePassword(password));
    if (validation !== true) {
        throw new ApiError({ ...loginRes.validationFailure, message: validation.message });
    }

    const emailStr = (email as string).toLowerCase();
    const credentialsStr = password as string;

    const userExists = await User.findOne({ email: emailStr }).withAuthSecrets();
    if (!userExists) {
        throw new ApiError(loginRes.noUser);
    }

    const user = userExists as UserDocument;

    const correctCredentials = await user.verifyCredentials(credentialsStr);
    if (!correctCredentials) {
        throw new ApiError(loginRes.incorrectCredentials);
    }

    const { accessToken, refreshToken } = await initSessionTokens({ req, user });
    res.cookie('refreshToken', refreshToken, COOKIES_OPTION);
    req.user = user;

    const { login: dynamicLoginRes } = getResponses(user);

    return new ApiResponse({
        ...dynamicLoginRes.success,
        data: { user: getUserState(user), accessToken },
    });
}, {
    action: 'account-activity',
    target: 'account',
    description: 'Welcome aboard (again)!',
});

export const registerViaGoogle = asyncReqHandler(async () => { });
export const loginViaGoogle = asyncReqHandler(async () => { });
export const registerViaFacebook = asyncReqHandler(async () => { });
export const loginViaFacebook = asyncReqHandler(async () => { });

export const refresh = asyncReqHandler(async (req, res) => {
    const { refresh: refreshRes } = responses;

    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        throw new ApiError(refreshRes.noRefreshToken);
    }

    try {
        console.log(1.1);
        const decodedData = jwtAuthVerify(refreshToken, REFRESH_TOKEN_SECRET);

        console.log(1.2);
        const existingUser = await User.findById(decodedData._id).withAuthSecrets();
        if (!existingUser) {
            throw new ApiError(refreshRes.noUser);
        }

        console.log(1.3);
        const user = existingUser as UserDocument;
        const refreshTokens = user.auth.refreshTokens as RefreshTokenSchema[];

        const refreshTokenObj = refreshTokens.find((token) => token.uuid === decodedData.uuid);
        if (!refreshTokenObj) {
            throw new ApiError(refreshRes.noRefreshTokenInDb);
        }

        console.log(1.4);
        const isMatch = await compare(refreshToken, refreshTokenObj.tokenHash);
        if (!isMatch) {
            throw new ApiError(refreshRes.invalidRefreshToken);
        }

        console.log(1.5);
        const accessToken = await user.generateAccessToken(decodedData.uuid);

        return new ApiResponse({ ...refreshRes.success, data: { accessToken } });
    } catch (error) {
        try {
            console.log(2.1);
            const decodedData = jwtAuthDecode(refreshToken);
            const existingUser = await User.findById(decodedData._id).withAuthSecrets();
            if (!existingUser) {
                throw new ApiError(refreshRes.noUser);
            }

            console.log(2.2);
            const user = existingUser as UserDocument;
            const refreshTokens = user.auth.refreshTokens as RefreshTokenSchema[];

            const refreshTokenObj = refreshTokens.find((token) => token.uuid === decodedData.uuid);
            if (!refreshTokenObj) {
                throw new ApiError(refreshRes.noRefreshTokenInDb);
            }

            console.log(2.3);
            const isMatch = await compare(refreshToken, refreshTokenObj.tokenHash);
            if (!isMatch) {
                throw new ApiError(refreshRes.invalidRefreshToken);
            }

            console.log(2.4);
            const { _id } = user;

            await User.findByIdAndUpdate(_id, {
                $pull: { 'auth.refreshTokens': { uuid: refreshTokenObj.uuid } },
            });

            if (refreshTokenObj.expiresAt.getTime() < Date.now()) {
                throw new ApiError(refreshRes.refreshTokenExpired);
            }

            console.log(2.5);
            const newTokens = await renewSessionTokens({ req, user, oldRefreshToken: refreshTokenObj });
            res.cookie('refreshToken', newTokens.refreshToken, COOKIES_OPTION);

            return new ApiResponse({ ...refreshRes.success, data: { accessToken: newTokens.accessToken } });
            // FIXME: 
            // [User spamming]: req A > 100ms delay > req B [Assumption: Both requests have same cookies]
            // If cookies in above requests have expired then on receiving req A the server renews the cookies
            // If the server is able to send these renewed tokens to user's browser within 100ms delay then req B would have new tokens
            // Otherwise the server will recieve a request with old tokens
            // Then server will look up the request in DB and upon not finding it will give error which will remove the user session  
            // TODO: [SOLUTION]
            // 1. Instead of instantly invalidating an expired refreshToken, allow a short grace window (e.g. 5–10s)
            //    During grace, expired tokens can still be looked up → they’ll just force a renewal instead of nuking the session
            // 2. Add a per-user or per-IP rate limit (e.g. max 3 refresh attempts in 5 seconds).
            //    Any excess gets 429 or temporary block.
        } catch (error) {
            res.clearCookie('refreshToken', COOKIES_OPTION);
            // FIXME: why does this below code matter?
            // if (error instanceof ApiError) {
            //     throw error;
            // }

            throw new ApiError(refreshRes.sessionExpired);
        }
    }
});

export const reauth = asyncReqHandler(async (req, res) => {
    const { password } = validateReqBody(req);
    const { reauth: reauthRes } = responses;

    const validation = validateAll(validatePassword(password));
    if (validation !== true) {
        throw new ApiError({ ...reauthRes.validationFailure, message: validation.message });
    }

    const credentialsStr = password as string;

    const user = req.user as UserDocument;
    const correctCredentials = await user.verifyCredentials(credentialsStr);
    if (!correctCredentials) {
        // TODO: check for suspicious activity and send mail 
        throw new ApiError(reauthRes.incorrectCredentials);
    }

    const accessToken = req.accessToken as string;
    const refreshTokenObj = getRefreshTokenUsingAccessToken(accessToken, req.user);
    const newTokens = await renewSessionTokens({ req, user, oldRefreshToken: refreshTokenObj, updateLastLogin: true });

    res.cookie('refreshToken', newTokens.refreshToken, COOKIES_OPTION);
    req.user = user;

    return new ApiResponse({ ...reauthRes.success, data: { accessToken: newTokens.accessToken } });
});

export const logout = asyncReqHandler(async (req, res) => {
    const { logout: logoutRes } = responses;

    const { _id } = req.user;
    const accessToken = req.accessToken as string;

    const refreshTokenObj = getRefreshTokenUsingAccessToken(accessToken, req.user);
    const updatedUser = await User.findByIdAndUpdate(_id, {
        $pull: { 'auth.refreshTokens': { uuid: refreshTokenObj.uuid } },
    }, { new: true });

    res.clearCookie('refreshToken', COOKIES_OPTION);
    req.user = updatedUser;

    return new ApiResponse(logoutRes.success);
}, {
    action: 'account-activity',
    target: 'account',
    description: 'Goodbye for now.',
});


import { ApiError, ApiResponse, validateAll, validateEmail } from '@syncspace/shared';
// importing config
import { RESET_PASSWORD_EXPIRY } from '../../config/env.config.js';
// importing data
import { COOKIES_OPTION } from '../../data/constants.js';
// importing models
import { User } from '../../models/user.model.js';
// importing libs
import { validateToken } from '../../lib/jwt.lib.js';
import { getEmail, getEmailLink, sendMail } from '../../lib/nodemailer.lib.js';
// importing services
import { initSessionTokens } from '../../services/auth.service.js';
import { getUserState } from '../../services/user.service.js';
// importing utils
import { asyncReqHandler } from '../../utils/asyncReqHandler.util.js';
import { validateReqBody } from '../../utils/validateReq.util.js';
// importing responses
import {
    RecoveryAuthControllerResponses as responses,
} from '../../responses/index.js'

// TODO: forgot password should have a limit like twice in 15 minutes
// store request attempts per user/email and per IP in a short-term cache (Redis)
// maybe this can be changed by user in setting but still within limits
// TODO: maybe let users disable password reset emails entirely; and make that requireReauth
export const forgotPassword = asyncReqHandler(async (req) => {
    const { email } = validateReqBody(req);
    const { forgotPassword: forgotRes } = responses;

    const validation = validateAll(validateEmail(email));
    if (validation !== true) {
        throw new ApiError({ ...forgotRes.validationFailure, message: validation.message });
    }

    const user = await User.findOne({ email });

    const link = await getEmailLink({
        req,
        action: 'resetPassword',
        data: { _id: user?._id || 'NA' },
        expiresIn: RESET_PASSWORD_EXPIRY || '10m',
    });

    if (user) {
        (async () => {
            sendMail({
                req,
                to: getEmail(user),
                subject: 'Reset password',
                html: `<a href='${link}'>Click here</a>`,
                priority: 'high',
            });
        })();
    }

    return new ApiResponse(forgotRes.success);
});

// TODO: add in setting 'auto-login after reset'
// if true (default) then user is logged in immediately after reseting password
// otherwise redirected to auth/login
export const resetPassword = asyncReqHandler(async (req, res) => {
    const { resetPasswordToken, newPassword } = validateReqBody(req);
    const { resetPassword: resetRes } = responses;

    const user = await validateToken({
        action: 'resetPassword',
        token: resetPasswordToken,
        fields: { _id: 'string' },
    });

    user.auth.credentials = newPassword;
    await user.save();

    const { accessToken, refreshToken } = await initSessionTokens({ req, user });
    res.cookie('refreshToken', refreshToken, COOKIES_OPTION);
    req.user = user;

    return new ApiResponse({
        ...resetRes.success,
        data: { user: getUserState(user), accessToken },
    });
});


import { ApiResponse } from '@syncspace/shared';
// importing types
import type { SortOrder } from 'mongoose';
// importing models
import { Interaction } from '../../models/interaction.model.js';
// importing utils
import { asyncReqHandler } from '../../utils/asyncReqHandler.util.js';
import { paginateAndSort } from '../../utils/paginateAndSort.util.js';
import { validateReqQuery } from '../../utils/validateReq.util.js';

export const fetchInteractions = asyncReqHandler(async (req) => {
    const { page, targets, sortOrder = 'asc' } = validateReqQuery(req);

    const { _id } = req.user;

    const result = await paginateAndSort(
        Interaction,
        {
            userId: _id,
            ...(targets ? { target: { $in: Array.isArray(targets) ? targets : [targets] } } : {})
        },
        { page: Number(page), limit: 10, sortOrder: sortOrder as SortOrder }
    );

    return new ApiResponse({
        code: 200,
        data: result,
        message: 'User interactions fetched successfully',
    });
});


import { ApiResponse } from "@syncspace/shared";
// importing types
import type { TokenAction } from "@syncspace/shared";
// importing libs
import { validateToken } from "../../lib/jwt.lib.js";
// importing utils
import { asyncReqHandler } from "../../utils/asyncReqHandler.util.js";
import { tokenRegistry } from "../../utils/tokenRegistry.util.js";
import { validateReqBody } from "../../utils/validateReq.util.js";
// importing responses
import {
    LifecycleTokenControllerResponses as responses,
} from '../../responses/index.js';

export const decodeToken = asyncReqHandler(async (req) => {
    const { action, token } = validateReqBody(req);
    const { decodeToken: decodeRes } = responses;

    await validateToken({
        action: action,
        token: token,
        fields: tokenRegistry[action as TokenAction],
    });

    return new ApiResponse(decodeRes.success);
});


import {
    ApiError,
    ApiResponse,
    defaultSetting,
    validateAll,
    validateSetting,
} from '@syncspace/shared';
// importing config
import { COOKIES_OPTION } from '../../data/constants.js';
// importing models
import { User } from '../../models/user.model.js';
// importing libs
import { deleteFilesFromCloudinary } from '../../lib/cloudinary.lib.js';
// importing utils
import { asyncReqHandler } from '../../utils/asyncReqHandler.util.js';
import { validateReqBody } from '../../utils/validateReq.util.js';
// importing responses 
import {
    AccountUserControllerResponses as responses,
} from '../../responses/index.js';

export const updateSetting = asyncReqHandler(async (req) => {
    const { newSetting } = validateReqBody(req);
    const { updateSetting: settingRes } = responses;

    const validation = validateAll(validateSetting(newSetting));
    if (validation !== true) {
        throw new ApiError({ ...settingRes.validationFailure, message: validation.message });
    }

    const { _id } = req.user;

    await User.findByIdAndUpdate(
        _id,
        { $set: { setting: newSetting } }
    );

    return new ApiResponse({ ...settingRes.success, data: newSetting });
});

export const resetSetting = asyncReqHandler(async (req) => {
    const { resetSetting: settingRes } = responses;

    const { _id } = req.user;

    await User.findByIdAndUpdate(
        _id,
        { $set: { setting: defaultSetting } }
    );

    return new ApiResponse({ ...settingRes.success, data: defaultSetting });
});

export const deleteAccount = asyncReqHandler(async (req, res) => {
    const { deleteAccount: deleteRes } = responses;

    const { _id, email, profilePic, banner } = req.user;

    const keep = [
        'auth.authProvider',
        'auth.isEmailVerified',
        'auth.refreshTokens',
        'deleted.email',
        'deleted.isDeleted',
        'socials',
        'username',
    ];

    const allPaths = Object.keys(User.schema.paths);

    const unsetFields = allPaths
        .filter((path) => !keep.includes(path) && !['_id', 'createdAt', 'updatedAt', '__v'].includes(path))
        .reduce((acc, path) => {
            acc[path] = '';
            return acc;
        }, {} as Record<string, string>);

    if (profilePic) {
        const { highRes, lowRes } = profilePic;
        await deleteFilesFromCloudinary({ publicIds: [highRes?.publicId, lowRes?.publicId].filter(Boolean) });
    }
    if (banner) {
        const { highRes, lowRes } = banner;
        await deleteFilesFromCloudinary({ publicIds: [highRes?.publicId, lowRes?.publicId].filter(Boolean) });
    }

    const user = await User.findByIdAndUpdate(_id, {
        $set: {
            'deleted.isDeleted': true,
            'deleted.email': email,
        },
        $unset: unsetFields,
    }, { new: true });

    res.clearCookie('refreshToken', COOKIES_OPTION);
    req.user = user;

    return new ApiResponse(deleteRes.success);
}, {
    action: 'account-deactivated',
    target: 'account',
    description: 'Account deleted',
});


import {
    ApiError,
    ApiResponse,
    validateAll,
    validateCurrentPassword,
    validateNewPassword,
} from '@syncspace/shared';
// importing config
import { UPDATE_EMAIL_EXPIRY, VERIFY_EMAIL_EXPIRY } from '../../config/env.config.js';
// importing types
import type { UserDocument } from '@syncspace/shared';
// importing models
import { User } from '../../models/user.model.js';
// importing libs
import { validateToken } from '../../lib/jwt.lib.js';
import { getEmail, getEmailLink, sendMail } from '../../lib/nodemailer.lib.js';
// importing service
import { validateNewEmail } from '../../services/user.service.js';
// importing utils
import { asyncReqHandler } from '../../utils/asyncReqHandler.util.js';
import { validateReqBody } from '../../utils/validateReq.util.js';
// importing responses 
import {
    ProfileUserControllerResponses as responses,
    getProfileUserControllerResponse as getResponses,
} from '../../responses/index.js';

export const initiateEmailVerification = asyncReqHandler(async (req) => {
    const { initiateEmailVerification: emailRes } = responses;

    const user = req.user as UserDocument;

    // TODO: add received socket id as well
    const link = await getEmailLink({
        req,
        action: 'verifyEmail',
        data: { _id: user._id, email: req.user.email },
        expiresIn: VERIFY_EMAIL_EXPIRY || '24h',
    });

    (async () => {
        sendMail({
            req,
            to: getEmail(user),
            subject: 'Verify email',
            html: `<a href='${link}'>Click here</a>`,
            priority: 'high',
        });
    })();

    return new ApiResponse(emailRes.success);
});

export const verifyEmail = asyncReqHandler(async (req) => {
    const { verifyEmailToken } = validateReqBody(req);
    const { verifyEmail: emailRes } = responses;

    const user = await validateToken({
        action: 'updateEmail',
        token: verifyEmailToken,
        fields: { _id: 'string', newEmail: 'string' },
    });

    await User.findByIdAndUpdate(user._id, {
        $set: { 'auth.isEmailVerified': true },
    });

    // TODO: should i add 'Who this?' link in email?
    (async () => {
        sendMail({
            req,
            to: getEmail(user),
            subject: 'Email updated',
            html: `Your email ${user.email} is verified for account r/${user.username}`,
            priority: 'high',
        });
    })();

    return new ApiResponse(emailRes.success);
});

export const initiateEmailUpdation = asyncReqHandler(async (req) => {
    const { newEmail } = validateReqBody(req);
    const { initiateEmailUpdation: emailRes } = responses;

    const newEmailStr = validateNewEmail(newEmail);

    const user = req.user as UserDocument;

    const link = await getEmailLink({
        req,
        action: 'updateEmail',
        data: { _id: user._id, newEmail: newEmailStr },
        expiresIn: UPDATE_EMAIL_EXPIRY || '24h',
    });

    (async () => {
        sendMail({
            req,
            to: getEmail(user),
            subject: 'Update email',
            html: `<a href='${link}'>Click here</a>`,
            priority: 'high',
        });
    })();

    return new ApiResponse(emailRes.success);
});

// TODO: Should it be get (as in as soon as link is opened then updateEmail is fired) or 
// post (a page is opened and user clicks on a button to fire updateEmail)???
export const updateEmail = asyncReqHandler(async (req) => {
    const { emailToken, newEmail } = validateReqBody(req);
    const { updateEmail: emailRes } = responses;

    const user = await validateToken({
        action: 'updateEmail',
        token: emailToken,
        fields: { _id: 'string', newEmail: 'string' },
    });

    const newEmailStr = validateNewEmail(newEmail);

    await User.findByIdAndUpdate(user._id, {
        $set: { email: newEmailStr },
    });

    // TODO: should i add 'Who this?' link in email?
    (async () => {
        sendMail({
            req,
            to: getEmail(user),
            subject: 'Email updated',
            html: `Your email ${newEmailStr} is now linked to r/${user.username}`,
            priority: 'high',
        });
    })();

    return new ApiResponse(emailRes.success);
});

export const changePassword = asyncReqHandler(async (req) => {
    const { changePassword: passwordRes } = responses;

    const { currentPassword, newPassword } = validateReqBody(req);

    const validation = validateAll(validateCurrentPassword(currentPassword), validateNewPassword(newPassword));
    if (validation !== true) {
        throw new ApiError({ ...passwordRes.validationFailure, message: validation.message });
    }

    const credentialsStr = currentPassword as string;

    const user = req.user as UserDocument;

    const { changePassword: dynamicChangePasswordRes } = getResponses(user);

    if (user.auth.authProvider !== 'email') {
        throw new ApiError(dynamicChangePasswordRes.invalidAuthProvider);
    }

    const correctCredentials = await user.verifyCredentials(credentialsStr);
    if (!correctCredentials) {
        // TODO: should i send this?
        (async () => {
            sendMail({
                req,
                to: getEmail(user),
                subject: 'Security Alert',
                html: 'Someone tried to update your password but was unsuccessful',
                priority: 'high',
            });
        })();
        throw new ApiError(passwordRes.incorrectCredentials);
    }

    user.auth.credentials = newPassword as string;
    await user.save();

    // TODO: add wasn't me?
    (async () => {
        sendMail({
            req,
            to: getEmail(user),
            subject: 'Password Changed',
            html: `Password to the account r/${user.username} has been successfully updated`,
            priority: 'high',
        });
    })();

    return new ApiResponse(passwordRes.success);
});


import { ApiResponse } from '@syncspace/shared';
// importing types
import type { UserDocument } from '@syncspace/shared';
// importing services
import { getUserState } from '../../services/user.service.js';
// importing utils
import { asyncReqHandler } from '../../utils/asyncReqHandler.util.js';
// importing responses 
import {
    SessionUserControllerResponses as responses,
} from '../../responses/index.js';

export const fetchSession = asyncReqHandler(async (req) => {
    const { fetchSession: sessionRes } = responses;
    
    const user = req.user as UserDocument;

    return new ApiResponse({ ...sessionRes.success, data: getUserState(user) });
});

export const determineReauth = asyncReqHandler(async () => {
    const { determineReauth: reauthRes } = responses;

    return new ApiResponse({ ...reauthRes.success, data: true });
});


// importing types
import type { CookieOptions } from 'express';

export const DB_NAME = 'syncspace-ver1';

export const SALT_ROUNDS = 10;

export const COOKIES_OPTION: CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/auth/refresh',
};

export const AUTH_TOKEN_FIELDS = { _id: 'string', uuid: 'string' } as const;

// Maximum allowed file size (in MB) for a single file upload
// Note: Cloudinary limits uploads to 10 MB
export const ROOT_MAX_SINGLE_FILE_SIZE_MB = 10;
// Maximum allowed combined file size (in MB) when uploading multiple files
export const ROOT_MAX_AGGREGATE_FILE_SIZE_MB = 20;


import bcrypt from 'bcrypt';
import crypto from 'crypto';
// importing data
import { SALT_ROUNDS } from '../data/constants.js';

const sha256Hex = (data: crypto.BinaryLike) => {
    return crypto.createHash('sha256').update(data).digest();
};

export const hash = async (data: string | Buffer, urlSafe?: boolean) => {
    if (urlSafe) {
        return crypto
            .createHash('sha256')
            .update(data)
            .digest('base64url');
    }

    return await bcrypt.hash(sha256Hex(data), SALT_ROUNDS);
};

export const compare = async (data: string | Buffer, encrypted: string) => {
    return await bcrypt.compare(sha256Hex(data), encrypted);
};


import { v2 as cloudinary } from 'cloudinary';
import { ApiError } from '@syncspace/shared';
// importing config
import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } from '../config/env.config.js';
// importing types
import type { UploadApiResponse } from 'cloudinary';
import type {
    DeleteFilesFromCloudinaryParams,
    DeleteFromCloudinaryParams,
    UploadFilesToCloudinaryParams,
    UploadToCloudinaryParams
} from '../types/index.js';
// importing responses
import { CloudinaryLibResponses as responses, getCloudinaryLibResponse as getResponses } from '../responses/index.js';

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (
    params: UploadToCloudinaryParams,
): Promise<UploadApiResponse> => {
    const { fileBuffer } = params;
    const { uploadToCloudinary: fileRes } = responses;

    return await new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream((error, result) => {
                if (error) {
                    if (error.http_code === 400 && error.name === 'Error') {
                        return reject(new ApiError(fileRes.fileSizeExceeded));
                    }

                    return reject(error);
                }

                if (!result) {
                    return reject(new Error('Cloudinary upload_stream returned undefined result'));
                }

                return resolve(result);
            })
            .end(fileBuffer);
    });
};

export const deleteFromCloudinary = async (
    params: DeleteFromCloudinaryParams,
): Promise<any | ApiError> => {
    const { publicId } = params;
    const { deleteFromCloudinary: deleteRes } = getResponses({ publicId });

    const response = await cloudinary.uploader.destroy(publicId);
    if (response.result === 'not found') {
        return new ApiError(deleteRes.notFound);
    }

    return response;
};

export const uploadFilesToCloudinary = async (
    params: UploadFilesToCloudinaryParams,
) => {
    const { files, aggregateSizeLimitMB } = params;

    let cumulativeSizeBytes = 0;
    files.forEach((file) => {
        cumulativeSizeBytes += file.size;
    });
    const cumulativeSizeMB = (cumulativeSizeBytes / 1024 / 1024).toFixed(2);
    const { uploadFilesToCloudinary: filesRes } = getResponses({ aggregateSizeLimitMB, cumulativeSizeMB });

    if (cumulativeSizeBytes > aggregateSizeLimitMB * 1024 * 1024) {
        throw new ApiError(filesRes.fileSizeExceeded);
    }

    let successfulUploads = 0;
    return await Promise.all(files.map(async (file) => {
        const fileUploadResult = { fileName: file.filename, uploaded: true };

        try {
            const cloudinaryResult = await uploadToCloudinary({ fileBuffer: file.buffer });
            (fileUploadResult as any).data = normalizeCloudinaryResponse(cloudinaryResult);

            successfulUploads++;
        } catch (error) {
            fileUploadResult.uploaded = false;

            if (error instanceof Error) {
                (fileUploadResult as any).message = error.message;

                if (error instanceof ApiError) {
                    const errors = error.errors;
                    if (errors.length > 0) {
                        (fileUploadResult as any).errors = errors;
                    }
                }
            }
        }

        return fileUploadResult;
    }));
};

export const deleteFilesFromCloudinary = async (
    params: DeleteFilesFromCloudinaryParams,
) => {
    const { publicIds } = params;

    let deletedCount = 0;
    return await Promise.all(publicIds.map(async (publicId) => {
        const fileDeletionResult = { publicId, deleted: true };

        const cloudinaryResult = await deleteFromCloudinary({ publicId });
        if (cloudinaryResult instanceof ApiError) {
            fileDeletionResult.deleted = false;
            (fileDeletionResult as any).message = cloudinaryResult.message;

            const errors = cloudinaryResult.errors;
            if (errors && Array.isArray(errors) && errors.length > 0) {
                (fileDeletionResult as any).errors = errors;
            }
        } else {
            deletedCount++;
        }

        return fileDeletionResult;
    }));
};

export const normalizeCloudinaryResponse = (cloudinaryResponse: UploadApiResponse) => {
    return {
        assetId: cloudinaryResponse.asset_id,
        publicId: cloudinaryResponse.public_id,
        displayName: cloudinaryResponse.display_name,
        url: cloudinaryResponse.url,
        resourceType: cloudinaryResponse.resource_type,
        format: cloudinaryResponse.format,
        createdAt: cloudinaryResponse.created_at,
        bytes: cloudinaryResponse.bytes,
        width: cloudinaryResponse.width,
        height: cloudinaryResponse.height,
    };
};


import jwt from 'jsonwebtoken';
import { ApiError } from '@syncspace/shared';
// importing config
import { EMAIL_SECRET } from '../config/env.config.js';
// importing data
import { AUTH_TOKEN_FIELDS } from '../data/constants.js';
// importing types
import type { JwtPayload } from 'jsonwebtoken';
import type { UserDocument } from '@syncspace/shared';
import type { JwtFieldTypes, ParseJwtPayloadReturnType, ValidateTokenParams } from '../types/index.js';
// importing models
import { User } from '../models/user.model.js';
// importing responses
import {
    JwtLibResponses as responses,
} from '../responses/index.js';

export const jwtVerify = <T extends JwtFieldTypes>(
    token: string,
    secret: string,
    fields?: T,
) => {
    const data = jwt.verify(token, secret);
    return parseJwtPayload(data, fields);
};

export const jwtAuthVerify = (token: string, secret: string) => {
    const data = jwt.verify(token, secret);
    return parseJwtPayload(data, AUTH_TOKEN_FIELDS);
};

export const jwtDecode = <T extends JwtFieldTypes>(
    token: string,
    fields?: T,
) => {
    const { jwtDecode: jwtRes } = responses;

    const data = jwt.decode(token);
    if (!data) {
        throw new ApiError(jwtRes.noToken);
    }

    return parseJwtPayload(data, fields);
};

export const jwtAuthDecode = (token: string) => {
    const { jwtDecode: jwtRes } = responses;

    const data = jwt.decode(token);
    if (!data) {
        throw new ApiError(jwtRes.noToken);
    }

    return parseJwtPayload(data, AUTH_TOKEN_FIELDS);
};

export const parseJwtPayload = <T extends JwtFieldTypes>(
    data: string | JwtPayload,
    fields?: T
): ParseJwtPayloadReturnType<T> => {
    const { parseJwtPayload: jwtRes } = responses;

    if (typeof data === 'string') {
        throw new ApiError(jwtRes.invalidFormat);
    }

    if (fields) {
        for (const field in fields) {
            if (!(field in data && typeof data[field] === fields[field])) {
                throw new ApiError(jwtRes.invalidToken);
            }
        }
    }

    return data as any;
};

// NOTE: this function assumes that all emailTokens will have _id in them to identify users
export const validateToken = async <T extends JwtFieldTypes>(
    params: ValidateTokenParams<T>
) => {
    const { action, token, fields } = params;
    const { validateToken: decodeRes } = responses;

    if (!token) {
        throw new ApiError(decodeRes.noToken);
    }

    let decodedData;
    try {
        decodedData = jwtVerify(
            token,
            EMAIL_SECRET,
            fields ? { action: 'string', ...fields } : { action: 'string' },
        );
    } catch (error) {
        throw new ApiError(decodeRes.tokenExpired);
    }

    if (decodedData.action !== action) {
        throw new ApiError(decodeRes.invalidAction);
    }

    const existingUser = await User.findById(decodedData._id).withAuthSecrets();
    if (!existingUser) {
        throw new ApiError(decodeRes.noUser);
    }

    return existingUser as UserDocument;
};


import mongoose from 'mongoose';
// importing config
import { MONGODB_URI } from '../config/env.config.js';
// importing constants
import { DB_NAME } from '../data/constants.js';

export const connectToDb = async () => {
    try {
        await mongoose.connect(`${MONGODB_URI}/${DB_NAME}`);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Connection to MongoDB failed \n', error);
        process.exit(1);
    }
};


import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
// importing config
import { EMAIL_SECRET, MODE, NODEMAILER_APP_PASSWORD, NODEMAILER_EMAIL } from '../config/env.config.js';
// importing types
import type { GetEmailLinkParams, SendMailParams } from '../types/index.js';
import type { UserDocument } from '@syncspace/shared';
// importing services
import { logToDb } from '../services/log.service.js';
// importing utils
import { validateReqOrigin } from '../utils/validateReq.util.js';

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: NODEMAILER_EMAIL,
        pass: NODEMAILER_APP_PASSWORD,
    },
});

export const getEmail = (user: UserDocument) => {
    if (MODE === 'DEVELOPMENT') {
        return 'karan161003@gmail.com';
    }

    return user.email;
};

export const sendMail = async (params: SendMailParams) => {
    const { req, to, subject, html, ...rest } = params;

    const mailOptions = {
        to,
        subject,
        html,
        ...rest,
    };

    transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
            await logToDb({
                type: 'error',
                payload: {
                    req,
                    description: error?.message,
                    userId: req.user?._id,
                    stack: error?.stack,
                },
            });
        }
    });
};

export const getEmailLink = async (params: GetEmailLinkParams) => {
    const { req, action, data, expiresIn } = params;

    const origin = validateReqOrigin(req);

    const emailToken = jwt.sign(
        { action: action, ...data },
        EMAIL_SECRET,
        { expiresIn: expiresIn as any }
    );

    return `${origin}/email/${action}/${emailToken}`;
};


import sharp from 'sharp';
// importing types
import type { CompressWebpParams, ConvertToWebpParams } from '../types/index.js';

export const convertToWebp = async (params: ConvertToWebpParams) => {
    const { fileBuffer } = params;
    const image = sharp(fileBuffer);
    return await image.webp({ quality: 100 }).toBuffer();
};

export const compressWebp = async (params: CompressWebpParams) => {
    const { webpBuffer } = params;
    const image = sharp(webpBuffer);
    
    const metadata = await image.metadata();
    const width = metadata.width ? Math.floor(metadata.width * 0.5) : undefined;
    const height = metadata.height ? Math.floor(metadata.height * 0.5) : undefined;

    return await image
        .resize(width, height)
        .webp({ quality: 50 })
        .toBuffer();
};


import { UAParser } from 'ua-parser-js';
// importing types
import type { Request } from 'express';
import type { UserAgentSchema } from '@syncspace/shared';

export const getUserAgent = (req: Request) => {
    const parser = new UAParser(req.headers['user-agent']);
    const { ua, browser, device, os } = parser.getResult();

    return {
        raw: ua,
        browser: {
            name: browser.name,
            version: browser.version,
        },
        os: {
            name: os.name,
            version: os.version,
        },
        device: {
            type: device.type,
            model: device.model,
        },
    } as UserAgentSchema;
};

export const getRoute = (req: Request) => {
    return req.route?.path || req.originalUrl;
};

export const getIp = (req: Request) => {
    return req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
};

export const getOrigin = (req: Request) => {
    return req.get('origin') || req.headers.origin;
};

export const getReferer = (req: Request) => {
    return req.get('referer') || req.headers.referer;
};


import { ApiError } from '@syncspace/shared';
// importing config
import { ACCESS_TOKEN_SECRET } from '../config/env.config.js';
// importing types
import type { NextFunction, Request, Response } from 'express';
// importing models
import { User } from '../models/user.model.js';
// importing lib
import { jwtAuthVerify } from '../lib/jwt.lib.js';
// importing responses
import {
    AuthMiddlewareResponses as responses,
} from '../responses/index.js';

// req.user will contain authSecrets
// controller should send 'userState' when request has been processed completly 
export const auth = async (req: Request, res: Response, next: NextFunction) => {
    const { auth: authRes } = responses;

    try {
        const accessToken = req.headers?.authorization?.split(' ')?.[1] || undefined;

        if (!accessToken) {
            throw new ApiError(authRes.noAccessToken);
        }

        const decodedData = jwtAuthVerify(accessToken, ACCESS_TOKEN_SECRET);
        const userExists = await User.findById(decodedData._id).withAuthSecrets();
        if (!userExists) {
            throw new ApiError(authRes.noUser);
        }

        req.user = userExists;
        req.accessToken = accessToken;
        next();
    } catch (error) {
        throw new ApiError(authRes.invalidAccessToken);
    }
};


import multer from 'multer';
import { ApiError } from '@syncspace/shared';
// importing types
import type { NextFunction, Request, Response } from 'express';
import type { ConfigureMulterErrorHandlerParams, ConfigureMulterParams } from '../types/index.js';
// importing responses
import { getMulterMiddlewareResponse as getResponses } from '../responses/index.js';

// creates a Multer middleware instance with a specific file size limit and memory storage
export const configureMulter = (params: ConfigureMulterParams) => {
    const { sizeLimitBytes } = params;

    return multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: sizeLimitBytes },
    });
};

// returns an error-handling middleware tailored to Multer-specific errors
export const configureMulterErrorHandler = (params: ConfigureMulterErrorHandlerParams) => {
    const { sizeLimitMB = 1, fieldName = 'file' } = params;

    return (error: Error, req: Request, res: Response, next: NextFunction) => {
        if (error instanceof multer.MulterError) {
            const { configureMulterErrorHandler: multerRes } = getResponses({ sizeLimitMB, fieldName });

            switch (error.code) {
                case 'LIMIT_FILE_SIZE':
                    throw new ApiError(multerRes.fileSizeExceeded);
                case 'LIMIT_UNEXPECTED_FILE':
                    throw new ApiError(multerRes.unexpectedFieldName);
                default:
                    throw new Error('Unexpected multer side error');
            }
        }

        next(error);
    };
};


import { ApiError, getLocalDateTime, minsToMs } from '@syncspace/shared';
// importing config
import { RE_AUTH_BUFFER_MINUTES } from '../config/env.config.js';
// importing types
import type { NextFunction, Request, Response } from 'express';
// importing services
import { getRefreshTokenUsingAccessToken } from '../services/auth.service.js';
// importing responses
import {
    RequireReauthMiddlewareResponses as responses,
} from '../responses/index.js';

export const requireReauth = async (req: Request, res: Response, next: NextFunction) => {
    const { requireReauth: reauthRes } = responses;

    const accessToken = req.accessToken as string;

    const refreshTokenObj = getRefreshTokenUsingAccessToken(accessToken, req.user);

    const lastLogin = refreshTokenObj.lastLoginAt?.getTime() || 0;
    const elapsed = Date.now() - lastLogin;

    console.log('   Last login at: ' + getLocalDateTime(new Date(lastLogin)));
    console.log('   Time elapsed: ' + ((elapsed / minsToMs(RE_AUTH_BUFFER_MINUTES)) * 100));

    if (elapsed > minsToMs(RE_AUTH_BUFFER_MINUTES)) {
        throw new ApiError(reauthRes.authExpired);
    }

    next();
};


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


import mongoose from 'mongoose';
// importing types
import type { RefreshTokenSchema } from '@syncspace/shared';
// importing schemas
import { userAgentSchema } from './userAgent.schema.js';

export const refreshTokenSchema = new mongoose.Schema<RefreshTokenSchema>({
    tokenHash: {
        type: String,
        required: true,
    },
    uuid: {
        type: String,
        required: true,
    },
    userAgent: {
        type: userAgentSchema,
        required: true,
    },
    ip: {
        type: String,
    },
    lastLoginAt: {
        type: Date,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
});


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


import mongoose from 'mongoose';
// importing types
import type { UserAgentSchema } from '@syncspace/shared';

export const userAgentSchema = new mongoose.Schema<UserAgentSchema>({
    raw: {
        type: String,
        required: true,
    },
    browser: {
        name: {
            type: String,
        },
        version: {
            type: String,
        },
    },
    os: {
        name: {
            type: String,
        },
        version: {
            type: String,
        },
    },
    device: {
        type: {
            type: String,
        },
        model: {
            type: String,
        },
    },
});


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


export const AvailabilityAuthControllerResponses = {
    isEmailAvailable: {
        validationFailure: {
            code: 409,
            context: 'Email validation failed.',
            trace: 'AvailabilityAuthController/isEmailAvailable/validationFailure'
        },
        userExists: {
            code: 409,
            message: 'Email already in use.',
            context: 'User with given email already exists in DB.',
            trace: 'AvailabilityAuthController/isEmailAvailable/userExists',
        },
        success: {
            code: 200,
            message: 'Email is available',
            trace: 'AvailabilityAuthController/isEmailAvailable/success',
        },
    },
    isUsernameAvailable: {
        validationFailure: {
            code: 409,
            context: 'Username validation failed.',
            trace: 'AvailabilityAuthController/isUsernameAvailable/validationFailure'
        },
        userExists: {
            code: 409,
            message: 'Username already in use.',
            context: 'User with given username already exists in DB.',
            trace: 'AvailabilityAuthController/isUsernameAvailable/userExists',
        },
        success: {
            code: 200,
            message: 'Username is available',
            trace: 'AvailabilityAuthController/isUsernameAvailable/success',
        },
    },
};


// importing types
import type { UserDocument } from '@syncspace/shared';

const message = 'Session is invalid. Please log in again.';

export const LifecycleAuthControllerResponses = {
    register: {
        validationFailure: {
            code: 409,
            context: 'One or more registration fields failed validation',
            trace: 'LifecycleAuthController/register/validationFailure',
        },
        emailExists: {
            code: 409,
            message: 'Invalid email or password',
            context: 'Attempted registration with an existing email',
            trace: 'LifecycleAuthController/register/emailExists',
        },
        usernameExists: {
            code: 409,
            message: 'Invalid email or password',
            context: 'Attempted registration with an existing username',
            trace: 'LifecycleAuthController/register/usernameExists',
        },
    },
    login: {
        validationFailure: {
            code: 409,
            context: 'One or more registration fields failed validation',
            trace: 'LifecycleAuthController/login/validationFailure',
        },
        noUser: {
            code: 404,
            message: 'Invalid email or password',
            context: 'No user found with the given email during login attempt',
            trace: 'LifecycleAuthController/login/noUser',
        },
        incorrectCredentials: {
            code: 401,
            message: 'Invalid email or password',
            context: 'Password mismatch for existing user during login',
            trace: 'LifecycleAuthController/login/incorrectCredentials',
        },
    },
    registerViaGoogle: {},
    loginViaGoogle: {},
    refresh: {
        noRefreshToken: {
            code: 401,
            message,
            context: 'Refresh token was missing in request.cookies',
            trace: 'LifecycleAuthController/refresh/noRefreshToken',
        },
        noUser: {
            code: 409,
            message,
            context: 'Refresh token decoded, but user not found in DB',
            trace: 'LifecycleAuthController/refresh/noUser',
        },
        noRefreshTokenInDb: {
            code: 401,
            message,
            context: 'Refresh token was valid JWT but no corresponding token was found in database',
            trace: 'LifecycleAuthController/refresh/noRefreshTokenInDb',
        },
        invalidRefreshToken: {
            code: 401,
            message,
            context: 'Refresh token was valid JWT but did not match the stored hash',
            trace: 'LifecycleAuthController/refresh/invalidRefreshToken',
        },
        refreshTokenExpired: {
            code: 401,
            message,
            context: 'Refresh token expiresAt date in Db has surpassed current date. Force login',
            trace: 'LifecycleAuthController/refresh/refreshTokenExpired',
        },
        sessionExpired: {
            code: 403,
            message,
            context: 'Both access and refresh token validation failed via jwt verification',
            trace: 'LifecycleAuthController/refresh/sessionExpired',
        },
        success: {
            code: 200,
            message: 'New access token generated successfully',
            trace: 'LifecycleAuthController/refresh/success',
        },
    },
    reauth: {
        validationFailure: {
            code: 409,
            context: 'One or more registration fields failed validation',
            trace: 'LifecycleAuthController/reauth/validationFailure',
        },
        incorrectCredentials: {
            code: 401,
            message: 'Invalid password',
            context: 'Password mismatch for existing user during reauth',
            trace: 'LifecycleAuthController/reauth/incorrectCredentials',
        },
        success: {
            code: 200,
            message: 'Reauth success',
            trace: 'LifecycleAuthController/reauth/success',
        },
    },
    logout: {
        success: {
            code: 200,
            message: 'Logged out successfully.',
            trace: 'LifecycleAuthController/logout/success',
        },
    },
};

export const getLifecycleAuthControllerResponse = (user: UserDocument) => {
    return {
        register: {
            success: {
                code: 201,
                message: `Great to have you onboard! ${user.username}`,
                trace: 'LifecycleAuthController/register/success',
            },
        },
        login: {
            success: {
                code: 201,
                message: `Welcome back! ${user.username}`,
                trace: 'LifecycleAuthController/login/success',
            },
        },
    };
};


export const RecoveryAuthControllerResponses = {
    forgotPassword: {
        validationFailure: {
            code: 409,
            context: 'Email validation failed.',
            trace: 'RecoveryAuthController/forgotPassword/validationFailure'
        },
        success: {
            code: 200,
            message: 'Email to reset your password has been sent',
            trace: 'RecoveryAuthController/forgotPassword/success',
        },
    },
    resetPassword: {
        success: {
            code: 200,
            message: 'Your password has been reset',
            trace: 'RecoveryAuthController/resetPassword/success',
        },
    },
};


export const LifecycleTokenControllerResponses = {
    decodeToken: {
        success: {
            code: 200,
            message: 'Token is valid',
            trace: 'LifecycleTokenController/decodeToken/success',
        },
    },
};


export const AccountUserControllerResponses = {
    updateSetting: {
        validationFailure: {
            code: 409,
            context: 'One or more registration fields failed validation',
            trace: 'AccountUserController/updateSetting/validationFailure',
        },
        success: {
            code: 200,
            message: 'Setting updated successfully.',
            trace: 'AccountUserController/updateSetting/success',
        },
    },
    resetSetting: {
        success: {
            code: 200,
            message: 'Setting updated to default.',
            trace: 'AccountUserController/resetSetting/success',
        },
    },
    deleteAccount: {
        success: {
            code: 200,
            message: 'Profile deleted successfully.',
            trace: 'AccountUserController/deleteAccount/success',
        }
    },
};


// importing types
import type { UserDocument } from '@syncspace/shared';

export const ProfileUserControllerResponses = {
    initiateEmailVerification: {
        success: {
            code: 200,
            message: 'Email sent successfully for email verification',
            trace: 'ProfileUserController/initiateEmailVerification/success',
        },
    },
    verifyEmail: {
        success: {
            code: 200,
            message: 'Email verified successfully',
            trace: 'ProfileUserController/verifyEmail/success',
        },
    },
    initiateEmailUpdation: {
        success: {
            code: 200,
            message: 'Email sent successfully for email updation',
            trace: 'ProfileUserController/initiateEmailUpdation/success',
        },
    },
    updateEmail: {
        success: {
            code: 200,
            message: 'Email updated successfully',
            trace: 'ProfileUserController/updateEmail/success',
        },
    },
    changePassword: {
        validationFailure: {
            code: 409,
            context: 'Password validation failed.',
            trace: 'ProfileUserController/changePassword/validationFailure'
        },
        incorrectCredentials: {
            code: 401,
            message: 'Invalid password',
            context: 'Password mismatch for existing user during updating password',
            trace: 'ProfileUserController/changePassword/incorrectCredentials',
        },
        success: {
            code: 200,
            message: 'Password updated successfully',
            trace: 'ProfileUserController/changePassword/success',
        },
    },
};

export const getProfileUserControllerResponse = (user: UserDocument) => {
    return {
        changePassword: {
            invalidAuthProvider: {
                code: 401,
                message: `Invalid auth provider - ${user.auth.authProvider}`,
                context: `Password can only be changed for auth provider - email; not ${user.auth.authProvider}`,
                trace: 'ProfileUserController/changePassword/invalidAuthProvider',
            },
        },
    };
};


export const SessionUserControllerResponses = {
    fetchSession: {
        success: {
            code: 200,
            message: 'User session restored',
            trace: 'SessionUserController/fetchSession/success',
        }
    },
    determineReauth: {
        success: {
            code: 200,
            message: 'Within reauth buffer period.',
            trace: 'SessionUserController/determineReauth/success',
        },
    },
};


// importing types
import type { GetCloudinaryLibResponseParams } from '../../types/index.js';

export const CloudinaryLibResponses = {
    uploadToCloudinary: {
        fileSizeExceeded: {
            code: 401,
            message: 'File size too large. Maximum allowed is 10 MB.',
            context: 'Cloudinary upload failed due to 10 MB size restriction',
            trace: 'CloudinaryLib/uploadToCloudinary/fileSizeExceeded',
        },
    },
};

export const getCloudinaryLibResponse = (params: GetCloudinaryLibResponseParams) => {
    const { publicId, aggregateSizeLimitMB, cumulativeSizeMB } = params;

    return {
        deleteFromCloudinary: {
            notFound: {
                code: 404,
                message: 'File not found. It may have already been deleted.',
                context: 'Cloudinary destroy returned not found' + (publicId && ` for publicId: ${publicId}`),
                trace: 'CloudinaryLib/deleteFromCloudinary/notFound',
            }
        },
        uploadFilesToCloudinary: {
            fileSizeExceeded: {
                code: 401,
                message: 'Total file size ' + (aggregateSizeLimitMB ? `exceeds ${aggregateSizeLimitMB} MB.` : 'exceeded.') + ' Please upload smaller files.',
                context: 'Aggregate file size ' + (cumulativeSizeMB && `(${cumulativeSizeMB} MB) `) + 'exceeded the allowed limit',
                trace: 'CloudinaryLib/uploadFilesToCloudinary/fileSizeExceeded',
            },
        },
    };
};


const message = 'Session is invalid. Please log in again.';

export const JwtLibResponses = {
    jwtDecode: {
        noToken: {
            code: 401,
            message,
            context: 'Token was valid JWT but no data could be decoded',
            trace: 'JwtLib/jwtDecode/noToken',
        },
    },
    parseJwtPayload: {
        invalidFormat: {
            code: 401,
            message,
            context: 'JWT payload is of type string',
            trace: 'JwtLib/parseJwtPayload/invalidFormat',
        },
        invalidToken: {
            code: 401,
            message,
            context: 'JWT payload is not structured correctly',
            trace: 'JwtLib/parseJwtPayload/invalidToken',
        },
    },
    validateToken: {
        noToken: {
            code: 409,
            message: 'No token provided',
            context: 'No token was provided',
            trace: 'JwtLib/validateToken/noToken',
        },
        tokenExpired: {
            code: 401,
            message: 'Link has expired',
            context: 'Token provided in email link has expired',
            trace: 'JwtLib/validateToken/tokenExpired',
        },
        invalidAction: {
            code: 401,
            message: 'Link action is invalid',
            context: 'Action within token is different from expected',
            trace: 'JwtLib/validateToken/tokenExpired',
        },
        noUser: {
            code: 409,
            message: 'Invalid link',
            context: 'Reset token decoded, but no corresponding user was found in DB',
            trace: 'JwtLib/validateToken/noUser',
        },
    },
};


const message = 'Session is invalid. Please log in again.';

export const AuthMiddlewareResponses = {
    auth: {
        noAccessToken: {
            code: 401,
            message,
            context: 'Access token missing from headers',
            trace: 'AuthMiddleware/auth/noAccessToken',
        },
        noUser: {
            code: 409,
            message,
            context: 'Access token decoded successfully, but no user found in DB',
            trace: 'AuthMiddleware/auth/noUser',
        },
        invalidAccessToken: {
            code: 403,
            message,
            context: 'Invalid access token in headers',
            trace: 'AuthMiddleware/auth/invalidAccessToken',
        },
    },
};


// importing types
import type { GetMulterMiddlewareResponseParams } from '../../types/index.js';

export const getMulterMiddlewareResponse = (params: GetMulterMiddlewareResponseParams) => {
    const { sizeLimitMB, fieldName } = params;

    return {
        configureMulterErrorHandler: {
            fileSizeExceeded: {
                code: 401,
                message: 'File size ' + (sizeLimitMB ? `exceeds ${sizeLimitMB} MB.` : 'exceeded.') + ' Please upload smaller file.',
                context: 'File size has been exceeded',
                trace: 'MulterMiddlewar/configureMulterErrorHandler/fileSizeExceeded',
            },
            unexpectedFieldName: {
                code: 409,
                message: 'Unexpected server side error.',
                context: 'Unexpected field name.' + (fieldName && `Expected file field to be '${fieldName}'.`),
                trace: 'MulterMiddlewar/configureMulterErrorHandler/unexpectedFieldName',
            },
        },
    };
};


export const RequireReauthMiddlewareResponses = {
    requireReauth: {
        authExpired: {
            code: 403,
            message: 'Please enter your password to continue.',
            context: 'Re-authentication required',
            trace: 'RequireReauthMiddleware/reauth/authExpired',
        },
    },
};


export const AuthServiceResponses = {
    getRefreshTokenUsingAccessToken: {
        noRefreshTokenInDb: {
            code: 401,
            message: 'Session is invalid. Please log in again.',
            context: 'No refresh token corresponding to the uuid in access token was found in database',
            trace: 'AuthService/getRefreshTokenUsingAccessToken/noRefreshTokenInDb',
        },
    },
};


export const UserServiceResponses = {
    validateNewEmail: {
        validationFailure: {
            code: 409,
            context: 'Email validation failed.',
            trace: 'ProfileUserController/updateEmail/validationFailure'
        },
        emailNotAvailable: {
            code: 401,
            message: 'Email already in use',
            context: 'Provided email already exists in db',
            trace: 'ProfileUserController/updateEmail/emailNotAvailable',
        },
    },
};


// importing types
import type { GetValidateReqUtilResponseParams } from '../../types/index.js';

export const ValidateReqUtilResponses = {
    validateReqBody: {
        noBody: {
            code: 401,
            message: 'No data received. Please try again.',
            context: 'Request body is missing or invalid. Ensure form submission is correctly structured.',
            trace: 'ValidateReqUtil/validateReqBody/noBody',
        },
    },
    validateReqFile: {
        noFile: {
            code: 401,
            message: 'No file uploaded. Please try again.',
            context: 'Expected `req.file.buffer` to exist, but it was undefined. Multer may not have parsed the file.',
            trace: 'ValidateReqUtil/validateReqFile/noFile',
        },
    },
    validateReqFiles: {
        noFiles: {
            code: 401,
            message: 'No files were uploaded. Please try again.',
            context: 'req.files is undefined or not parsed by multer middleware.',
            trace: 'ValidateReqUtil/validateReqFiles/noFiles',
        },
    },
    validateReqQuery: {
        noQuery: {
            code: 401,
            message: 'No query parameters received. Please check your URL.',
            context: 'req.query is either missing or not an object. Could indicate malformed URL or handler.',
            trace: 'ValidateReqUtil/validateReqQuery/noQuery',
        },
    },
    validateReqOrigin: {
        invalidOrigin: {
            code: 409,
            message: 'Request origin is not valid.',
            context: 'Request origin is not mentioned in CORS_ORIGIN within .env.',
            trace: 'ValidateReqUtil/validateReqOrigin/invalidOrigin'
        },
    },
};

export const getValidateReqUtilResponse = (params: GetValidateReqUtilResponseParams) => {
    const { fieldName, count } = params;

    return {
        validateReqFiles: {
            noField: {
                code: 401,
                message: 'No files found' + (fieldName && `for field '${fieldName}'`) + '.',
                context: 'req.files did not contain the expected field ' + (fieldName && `(${fieldName}) `) + ' or its value is not an array.',
                trace: 'ValidateReqUtil/validateReqFiles/noField',
            },
            noFile: {
                code: 401,
                message: 'No files were uploaded' + (fieldName && `under the field '${fieldName}'`) + '.',
                context: 'The  field ' + (fieldName && `(${fieldName}) `) + 'exists but contains an empty array.',
                trace: 'ValidateReqUtil/validateReqFiles/noFile',
            },
            noFileBuffer: {
                code: 401,
                message: (count ? `${count} uploaded file(s)` : 'Some') + ' could not be processed.',
                context: 'Found ' + (count ? `${count}` : 'some') + ' files without a valid .buffer. Likely an issue during multer file parsing.',
                trace: 'ValidateReqUtil/validateReqFiles/noFileBuffer',
            },
        },
    };
};


export * from './controllers/auth/availability.auth.controller.response.js';
export * from './controllers/auth/lifecycle.auth.controller.response.js';
export * from './controllers/auth/recovery.auth.controller.response.js';
export * from './controllers/token/lifecycle.token.controller.response.js';
export * from './controllers/user/account.user.controller.response.js';
export * from './controllers/user/profile.user.controller.response.js';
export * from './controllers/user/session.user.controller.response.js';

export * from './lib/cloudinary.lib.response.js';
export * from './lib/jwt.lib.response.js';

export * from './middlewares/auth.middleware.response.js';
export * from './middlewares/multer.middleware.response.js';
export * from './middlewares/requireReauth.middleware.response.js';

export * from './services/auth.service.response.js';
export * from './services/user.service.response.js';

export * from './utils/validateReq.util.response.js';


import { Router } from 'express';
import { sharedConfig } from '@syncspace/shared';
// importng middlewares
import { auth } from '../middlewares/auth.middleware.js';
// importng utils
import { fileUploadHandler } from '../utils/fileUploadHandler.util.js';
// importng controllers
import {
    login,
    loginViaFacebook,
    loginViaGoogle,
    logout,
    reauth,
    refresh,
    register,
    registerViaFacebook,
    registerViaGoogle,
} from '../controllers/auth/lifecycle.auth.controller.js';
import {
    isEmailAvailable,
    isUsernameAvailable,
} from '../controllers/auth/availability.auth.controller.js';
import {
    forgotPassword,
    resetPassword,
} from '../controllers/auth/recovery.auth.controller.js';

const { maxProfilePicSizeMB } = sharedConfig;

const router = Router();

// GET
router.get('/isEmailAvailable', isEmailAvailable);
router.get('/isUsernameAvailable', isUsernameAvailable);

// POST
router.post('/register', ...fileUploadHandler({ sizeLimitMB: maxProfilePicSizeMB, fieldName: 'profilePic', single: true }), register);
router.post('/login', login);
router.post('/registerViaGoogle', registerViaGoogle);
router.post('/loginViaGoogle', loginViaGoogle);
router.post('/registerViaFacebook', registerViaFacebook);
router.post('/loginViaFacebook', loginViaFacebook);
router.post('/refresh', refresh);
router.post('/reauth', auth, reauth);
router.post('/forgotPassword', forgotPassword);

// PATCH
router.patch('/resetPassword', resetPassword);

// DELETE
router.delete('/logout', auth, logout);

export default router;


import { Router } from 'express';
// importng middlewares
import { auth } from '../middlewares/auth.middleware.js';
// importng controllers
import { fetchInteractions } from '../controllers/interaction/view.interaction.controller.js';

const router = Router();

// GET
router.get('/fetchInteractions', auth, fetchInteractions);

export default router;


import { Router } from 'express';
// importng controllers
import { decodeToken } from '../controllers/token/lifecycle.token.controller.js';

const router = Router();

// POST
router.post('/decodeToken', decodeToken);

export default router;


import { Router } from 'express';
// importng middlewares
import { auth } from '../middlewares/auth.middleware.js';
import { requireReauth } from '../middlewares/requireReauth.middleware.js';
// importng controllers
import {
    deleteAccount,
    resetSetting,
    updateSetting,
} from '../controllers/user/account.user.controller.js';
import {
    changePassword,
    initiateEmailUpdation,
    initiateEmailVerification,
    updateEmail,
    verifyEmail,
} from '../controllers/user/profile.user.controller.js';
import {
    determineReauth,
    fetchSession,
} from '../controllers/user/session.user.controller.js';

const router = Router();

// GET
router.get('/fetchSession', auth, fetchSession);
router.get('/determineReauth', auth, requireReauth, determineReauth);

// POST
router.post('/initiateEmailVerification', auth, requireReauth, initiateEmailVerification);
router.post('/initiateEmailUpdation', auth, requireReauth, initiateEmailUpdation);

// PATCH
router.patch('/verifyEmail', verifyEmail);
router.patch('/updateEmail', updateEmail);
router.patch('/updateSetting', auth, updateSetting);
router.patch('/resetSetting', auth, resetSetting);
router.patch('/changePassword', auth, requireReauth, changePassword);

// DELETE
router.delete('/deleteAccount', auth, requireReauth, deleteAccount);

export default router;


import { v7 as uuidv7 } from 'uuid';
import { ApiError, daysToMs } from '@syncspace/shared';
// importing config
import { REFRESH_TOKEN_BUFFER_DAYS, REFRESH_TOKEN_EXPIRY_DAYS } from '../config/env.config.js';
// importing types
import type { RefreshTokenSchema, UserDocument } from '@syncspace/shared';
import type { InitSessionTokensParams, RenewSessionTokensParams } from '../types/index.js';
// importing lib
import { hash } from '../lib/bcrypt.lib.js';
import { jwtAuthDecode } from '../lib/jwt.lib.js';
import { getIp, getUserAgent } from '../lib/uaParser.lib.js';
// importing models
import { User } from '../models/user.model.js';
// importing responses
import {
    AuthServiceResponses as responses,
} from '../responses/index.js';

const getSessionTokens = async (user: UserDocument) => {
    const uuid = uuidv7();

    const accessToken = await user.generateAccessToken(uuid);
    const refreshToken = await user.generateRefreshToken(uuid);

    return {
        accessToken,
        refreshToken,
        uuid,
    };
};

// user being passed should have AuthSecrets available
export const initSessionTokens = async (params: InitSessionTokensParams) => {
    const { req, user } = params;
    const { _id } = user;

    const currentTime = new Date();

    const { accessToken, refreshToken, uuid } = await getSessionTokens(user);

    const refreshTokenHash = await hash(refreshToken);
    const refreshTokenObj = {
        tokenHash: refreshTokenHash,
        uuid,
        userAgent: getUserAgent(req),
        ip: getIp(req),
        lastLoginAt: currentTime,
        expiresAt: new Date(
            currentTime.getTime() +
            daysToMs(REFRESH_TOKEN_EXPIRY_DAYS) +
            daysToMs(REFRESH_TOKEN_BUFFER_DAYS)
        ),
    };

    await User.findByIdAndUpdate(_id, {
        $push: { 'auth.refreshTokens': refreshTokenObj },
    });

    return { accessToken, refreshToken };
};

// user being passed should have AuthSecrets available
export const renewSessionTokens = async (params: RenewSessionTokensParams) => {
    const { req, user, oldRefreshToken, updateLastLogin = false } = params;
    const { _id } = user;

    const currentTime = new Date();

    const { accessToken, refreshToken, uuid } = await getSessionTokens(user);

    const refreshTokenHash = await hash(refreshToken);
    const refreshTokenObj = {
        tokenHash: refreshTokenHash,
        uuid,
        userAgent: getUserAgent(req),
        ip: getIp(req),
        lastLoginAt: updateLastLogin ? currentTime : oldRefreshToken.lastLoginAt,
        expiresAt: new Date(
            currentTime.getTime() +
            daysToMs(REFRESH_TOKEN_EXPIRY_DAYS) +
            daysToMs(REFRESH_TOKEN_BUFFER_DAYS)
        ),
    };

    await User.findByIdAndUpdate(_id, {
        $push: { 'auth.refreshTokens': refreshTokenObj },
    });

    req.user = user;

    return { accessToken, refreshToken };
};

export const getRefreshTokenUsingAccessToken = (accessToken: string, user: UserDocument) => {
    const { getRefreshTokenUsingAccessToken: getRefreshRes } = responses;

    // NOTE: We use .decode instead of .verify here.
    // This handles the rare edge case where the accessToken was valid 
    // during the auth middleware check but expired just before reaching getRefreshTokenUsingAccessToken.
    //
    // Important: Apply this pattern whenever the accessToken is reused 
    // inside an already authenticated (protected) route. 
    // Do NOT use .decode in unprotected routes, as verification is required there.
    const decodedData = jwtAuthDecode(accessToken);

    const refreshTokens = user.auth.refreshTokens as RefreshTokenSchema[];

    const tokenInDb = refreshTokens.find((token) => token.uuid === decodedData.uuid);
    if (!tokenInDb) {
        throw new ApiError(getRefreshRes.noRefreshTokenInDb);
    }

    return tokenInDb;
};


// importing types
import type { LogToDbParams } from '../types/index.js';
// importing models
import { Error } from '../models/error.model.js';
import { Interaction } from '../models/interaction.model.js';
// importing libs
import { getIp, getOrigin, getRoute, getUserAgent } from '../lib/uaParser.lib.js';

export const logToDb = async (params: LogToDbParams) => {
    const { type, payload } = params;

    try {
        if (type === 'interaction') {
            return await Interaction.create(payload);
        }
        if (type === 'error') {
            const { req, description, userId, stack } = payload;

            const route = getRoute(req);
            const origin = getOrigin(req);
            const userAgent = getUserAgent(req);
            const ip = getIp(req);

            await Error.updateOne({
                route,
                description,
                'meta.origin': origin,
            }, {
                $set: {
                    userId,
                    'meta.origin': origin,
                    'meta.userAgent': userAgent,
                    'meta.ip': ip,
                    'meta.stack': stack,
                },
                $inc: { count: 1 },
            }, { upsert: true });
        };
    } catch (error) {
        console.error('Logging operation failed: ', error);
    }
};


import { ApiError, validateAll, validateEmail } from '@syncspace/shared';
// importing types
import type { UserDocument } from '@syncspace/shared';
// importing models
import { User } from '../models/user.model.js';
// importing responses
import {
    UserServiceResponses as responses,
} from '../responses/index.js';

export const getUserState = (user: UserDocument) => {
    const {
        auth: { credentials, refreshTokens, ...restAuth },
        ...rest
    } = user.toObject();

    return {
        auth: {
            ...restAuth,
        },
        ...rest,
    } as UserDocument;
};

export const validateNewEmail = async (newEmail?: string) => {
    const { validateNewEmail: emailRes } = responses;

    const validation = validateAll(validateEmail(newEmail));
    if (validation !== true) {
        throw new ApiError({ ...emailRes.validationFailure, message: validation.message });
    }

    const newEmailStr = (newEmail as string).toLowerCase();
    const existingUser = await User.findOne({ email: newEmailStr });
    if (existingUser) {
        throw new ApiError(emailRes.emailNotAvailable);
    }

    return newEmailStr;
};


// importing types
import type { UserDocument } from '../models/user.model';

declare global {
    namespace Express {
        interface Request {
            user?: UserDocument,
            accessToken?: string,
        }
    }
};


export type UploadToCloudinaryParams = {
    fileBuffer: Express.Multer.File['buffer'],
};

export type DeleteFromCloudinaryParams = {
    publicId: string,
};

export type UploadFilesToCloudinaryParams = {
    files: Express.Multer.File[],
    aggregateSizeLimitMB: number,
};

export type DeleteFilesFromCloudinaryParams = {
    publicIds: string[],
};


// importing types
import type { JwtPayload } from "jsonwebtoken";
import type { TokenAction } from "@syncspace/shared";

export type JwtFieldTypes = { [key: string]: "string" | "number" | "boolean" };

export type ParseJwtPayloadReturnType<
    T extends JwtFieldTypes
> = { [K in keyof T]: T[K] extends "string" ? string :
    (T[K] extends "number" ? number :
        (T[K] extends "boolean" ? boolean :
            unknown))
} & JwtPayload;

export type ValidateTokenParams<T extends JwtFieldTypes> = {
    action: TokenAction,
    token?: string,
    fields?: T,
};


// importing types
import type { Readable } from "stream";
import type { Request } from "express";
import type { AttachmentLike } from "nodemailer/lib/mailer/index.js";
import type Mail from "nodemailer/lib/mailer/index.js";
import type { TokenAction } from "@syncspace/shared";

export type SendMailParams = {
    req: Request,
    to: string,
    subject: string,
    html: string | Buffer | Readable | AttachmentLike,
} & Mail.Options;

export type GetEmailLinkParams = {
    req: Request,
    action: TokenAction,
    data: { _id: any } & Record<string, any>,
    expiresIn: string,
};


export type ConvertToWebpParams = {
    fileBuffer: Express.Multer.File['buffer'];
};

export type CompressWebpParams = {
    webpBuffer: Express.Multer.File['buffer'];
};


export type ConfigureMulterParams = {
    sizeLimitBytes: number,
};

export type ConfigureMulterErrorHandlerParams = {
    sizeLimitMB: number,
    fieldName: string,
};


export type GetCloudinaryLibResponseParams = {
    publicId?: string,
    aggregateSizeLimitMB?: number,
    cumulativeSizeMB?: string,
};


export type GetMulterMiddlewareResponseParams = {
    sizeLimitMB?: number,
    fieldName?: string,
};


export type GetValidateReqUtilResponseParams = {
    fieldName?: string,
    count?: number,
};


export * from './lib/cloudinary.lib.response.type.js';

export * from './middlewares/multer.middleware.response.type.js';

export * from './utils/validateReq.util.response.type.js';


// importing types
import type { Request } from 'express';
import type { RefreshTokenSchema, UserDocument } from '@syncspace/shared';

export type InitSessionTokensParams = {
    req: Request,
    user: UserDocument,
};

export type RenewSessionTokensParams = InitSessionTokensParams & {
    oldRefreshToken: RefreshTokenSchema,
    updateLastLogin?: boolean,
};


// importing types
import type { Request } from 'express';
import type { Schema } from 'mongoose';
import type { InteractionBase } from '@syncspace/shared';

export const LogTypes = ['interaction', 'error'] as const;
export type LogType = typeof LogTypes[number];

export type LogToDbParams = {
    type: 'interaction',
    payload: InteractionBase,
} | {
    type: 'error',
    payload: {
        req: Request,
        description: string,
        userId?: Schema.Types.ObjectId,
        stack?: any,
    },
};


// importing types
import type { NextFunction, Request, Response } from 'express';
import type { InteractionBase } from '@syncspace/shared';

export type AsyncReqHandlerParams = (
    req: Request,
    res: Response,
    next: NextFunction,
) => Promise<any>;

export type InteractionInfo =
    | Omit<InteractionBase, 'userId'>
    | null;

export type InteractionOption =
    | InteractionInfo
    | ((req: Request, resData: any) => InteractionInfo | Promise<InteractionInfo>);


export type FileUploadHandlerParams = {
    sizeLimitMB: number,
    fieldName: string,
    single: boolean,
};


export * from './lib/cloudinary.lib.type.js';
export * from './lib/sharp.lib.type.js';
export * from './lib/jwt.lib.type.js';
export * from './lib/nodemailer.lib.type.js';

export * from './middlewares/multer.middleware.type.js';

export * from './response/index.js';

export * from './services/log.service.type.js';
export * from './services/auth.service.type.js';

export * from './utils/asyncReqHandler.util.type.js';
export * from './utils/fileUploadHandler.util.type.js';


import { AbstractTargetTypes, EntityTargetTypes } from '@syncspace/shared';
// importing types
import type { NextFunction, Request, Response } from 'express';
import type { InteractionBase } from '@syncspace/shared';
import type { AsyncReqHandlerParams, InteractionOption } from '../types/index.js';
// importing services
import { logToDb } from '../services/log.service.js';

export const asyncReqHandler = (
    reqHandler: AsyncReqHandlerParams,
    interaction?: InteractionOption,
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const response = await reqHandler(req, res, next);
            const responseCode = response.code || 200;
            const responseMessage = response.message || 'Request completed successfully.';

            res.status(responseCode).json({
                code: responseCode,
                success: response.success,
                partial: response.partial,
                message: responseMessage,
                data: response.data,
            });

            if (interaction && req.user?._id) {
                const resolvedInteraction = typeof interaction === 'function'
                    ? await interaction(req, response.data)
                    : interaction;

                if (!resolvedInteraction) {
                    return;
                }

                if (AbstractTargetTypes.includes(resolvedInteraction.target as any)) {
                    logToDb({
                        type: 'interaction',
                        payload: { ...resolvedInteraction, userId: req.user!._id } as InteractionBase,
                    });
                } else if (EntityTargetTypes.includes(resolvedInteraction.target as any)) {
                    // TODO: when pauseHistory then don't perform this 
                    logToDb({
                        type: 'interaction',
                        payload: { ...resolvedInteraction, userId: req.user!._id } as InteractionBase,
                    });
                }
            }
        } catch (error) {
            next(error);
        }
    };
};


import { ApiError } from '@syncspace/shared';
// importing types
import type { Request, Response, NextFunction } from 'express';
// importing services
import { logToDb } from '../services/log.service.js';

export const errorHandler = async (error: Error, req: Request, res: Response, next: NextFunction) => {
    let errorCode = 500;
    let errorMessage;
    let errorContext;
    let errorTrace;

    if (error instanceof ApiError) {
        errorCode = error.code;
        errorMessage = error.message;
        errorContext = error.context;
        errorTrace = error.trace;

        console.error(errorContext);
    } else {
        console.error(error);
    }

    res.status(errorCode).json({
        code: errorCode,
        success: false,
        message: errorMessage || 'An unexpected error occured',
        context: errorContext || 'No context provided',
        trace: errorTrace || 'No trace provided',
    });

    if (!(error instanceof ApiError)) {
        await logToDb({
            type: 'error',
            payload: {
                req,
                description: error?.message,
                userId: req.user?._id,
                stack: error?.stack,
            },
        });
    }
};


// importing types
import type { FileUploadHandlerParams } from '../types/index.js';
// importing middleware
import { configureMulter, configureMulterErrorHandler } from '../middlewares/multer.middleware.js';

// returns an array of middleware for handling a file upload
export const fileUploadHandler = (params: FileUploadHandlerParams) => {
    const { sizeLimitMB, fieldName, single } = params;

    const sizeLimitBytes = sizeLimitMB * 1024 * 1024;

    if (single) {
        return [
            configureMulter({ sizeLimitBytes }).single(fieldName),
            configureMulterErrorHandler({ sizeLimitMB, fieldName })
        ];
    }

    return [
        configureMulter({ sizeLimitBytes }).fields([{ name: fieldName }]),
        configureMulterErrorHandler({ sizeLimitMB, fieldName }),
    ];
};


// utils/paginateAndSort.ts
import type { FilterQuery, Model, SortOrder } from 'mongoose';

export type PaginateOptions = {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: SortOrder;
};

export async function paginateAndSort<T>(
    model: Model<T>,
    query: FilterQuery<T> = {},
    options: PaginateOptions = {}
) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        model.find(query)
            .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        model.countDocuments(query),
    ]);

    return {
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
}


// importing types
import type { TokenAction } from "@syncspace/shared";
import type { JwtFieldTypes } from "../types/index.js";

export const tokenRegistry: Record<TokenAction, JwtFieldTypes> = {
    resetPassword: { _id: 'string' },
    updateEmail: { _id: 'string', newEmail: 'string' },
    verifyEmail: { _id: 'string', email: 'string' },
};


import { ApiError, validate, isObject, isString } from '@syncspace/shared';
// importing config
import { corsWhitelist } from '../config/cors.config.js';
// importing types
import type { Request } from 'express';
// importing lib
import { getOrigin } from '../lib/uaParser.lib.js';
// importing responses
import {
    ValidateReqUtilResponses as responses,
    getValidateReqUtilResponse as getResponses,
} from '../responses/index.js';

export const validateReqBody = (req: Request) => {
    const { validateReqBody: bodyRes } = responses;

    if (!req || !req.body || !validate(req.body, isObject, 'req.body')) {
        throw new ApiError(bodyRes.noBody);
    }

    return req.body;
};

export const validateReqFile = (req: Request) => {
    const { validateReqFile: fileRes } = responses;

    if (!req.file || !req.file.buffer) {
        throw new ApiError(fileRes.noFile);
    }

    return req.file.buffer;
};

export const validateReqFiles = (req: Request, fieldName: string) => {
    const files = req.files;
    const { validateReqFiles: filesRes } = responses;
    const { validateReqFiles: dynamicFilesRes } = getResponses({ fieldName });

    if (!files) {
        throw new ApiError(filesRes.noFiles);
    }

    let uploadedFiles;
    if (Array.isArray(files)) {
        uploadedFiles = files;
    } else if (files[fieldName] && Array.isArray(files[fieldName])) {
        uploadedFiles = files[fieldName];
    } else {
        throw new ApiError(dynamicFilesRes.noField);
    }

    if (uploadedFiles.length === 0) {
        throw new ApiError(dynamicFilesRes.noFile);
    }

    let count = 0;
    uploadedFiles.forEach((file) => {
        if (!file.buffer) {
            count++;
        }
    });

    if (count > 0) {
        const { validateReqFiles: dynamicFilesRes } = getResponses({ count });

        throw new ApiError(dynamicFilesRes.noFileBuffer);
    }

    return uploadedFiles;
};

export const validateReqQuery = (req: Request) => {
    const { validateReqQuery: queryRes } = responses;

    if (!req || !req.query || !validate(req.query, isObject, 'req.query')) {
        throw new ApiError(queryRes.noQuery);
    }

    return req.query;
};

export const validateReqOrigin = (req: Request) => {
    const { validateReqOrigin: originRes } = responses;

    const origin = getOrigin(req);
    if (!(isString(origin) && corsWhitelist.includes(origin))) {
        throw new ApiError(originRes.invalidOrigin);
    }

    return origin;
};


import cors from 'cors';
import helmet from 'helmet';
import express from 'express';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';
import { getLocalDateTime } from '@syncspace/shared';
// importing config
import { corsOptions } from './config/cors.config.js';
// importing utils
import { errorHandler } from './utils/errorHandler.util.js';

const app = express();

app.use((req, res, next) => {
    console.error('[REQ]', getLocalDateTime(new Date()), req.method, req.originalUrl);
    next();
});

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cors(corsOptions));
app.use(cookieParser());

app.use(helmet());

app.use((req, res, next) => {
    // block clickjacking [blocks iframes]
    res.setHeader('X-Frame-Options', 'DENY');
    // no referrer info leaks
    res.setHeader('Referrer-Policy', 'no-referrer');
    next();
});

app.use(methodOverride('_method'));

// importing routes
import authRoutes from './routes/auth.routes.js';
app.use('/auth', authRoutes);
import userRoutes from './routes/user.routes.js';
app.use('/user', userRoutes);
import tokenRoutes from './routes/token.routes.js';
app.use('/token', tokenRoutes);
import interactionRoutes from './routes/interaction.routes.js';
app.use('/interaction', interactionRoutes);

app.use(errorHandler);

export default app;


import * as shared from '@syncspace/shared';
// importing config
import { PORT } from './config/env.config.js';
// importing app
import app from './app.js';
// importing lib
import { connectToDb } from './lib/mongoose.lib.js';

try {
    const { sharedStr } = shared;
    console.log(sharedStr);

    await connectToDb();

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
} catch (error) {
    console.error('Failed to initialize app. Check database connection or port availability \n', error);
}


MODE = "DEVELOPMENT"

PORT = "8080"
CORS_ORIGINS = "http://localhost:3000"

MONGODB_URI = ""

ACCESS_TOKEN_SECRET = "BNhokmyJqGHgVOo20TOdAbzoOsqZ4pFvPrmM6mIS67nN4sTdls6GxI0U8qHgQw4mVtsIG2JRjD44zrgD6vs2PVrOCsE7DmIYuZMApiixYzc4234ZhnUQdoKfnVNB8EEtCLURVkClSOgyJPtCBwn1OvtXClWbWC5u"
# PROD: "15m" DEV: "1m" TEST: "30s"
ACCESS_TOKEN_EXPIRY = "30s"
# PROD: "15" DEV: "1" TEST: "0.5"
ACCESS_TOKEN_EXPIRY_MINUTES = "0.5"
REFRESH_TOKEN_SECRET = "wOpXQD8XsY1SJjBze6vJbQqs9F5LhFlS7foSlylLDoR0qPJ6veVpMDwDZAI99hdokjTx7qjfktX6hbXTMcQwQqqh7TF4fYCnLgY4iSCkL8bPQswbx3xQKqOcFnl7hNqFKZ9H8z1NwOnDgdfj9W0FGOWhqmjumsth"
# PROD: "10d" DEV: "12m" TEST: "1m"
REFRESH_TOKEN_EXPIRY = "1m"
# PROD: "10" DEV: "0.2" TEST: "0.000694444"
REFRESH_TOKEN_EXPIRY_DAYS = "0.000694444"
# PROD: "20" DEV: "0.2" TEST: "0.000694444"
REFRESH_TOKEN_BUFFER_DAYS = "0.000694444"

# PROD: "5" DEV: "5" TEST: "0.75"
RE_AUTH_BUFFER_MINUTES = "0.75"

EMAIL_SECRET = "iGOjMY0ZIXV1GchC7bwOBHgzaaV3UmBOzsElfQYQ3MLZaxbSj15QDyig2tRkCMIKPzf3TMSB4jQVFHOB9dpbHgHyddN3ETLHZgMdK7YY2U0n7xIRV3nOLSjXeoba1W5pg4qYTCrmDasj0ZRf6fRcXyWqOXjpchFj"
# PROD: "10m" DEV: "5m" TEST: "2m"
RESET_PASSWORD_EXPIRY = "2m"
# PROD: "24h" DEV: "1h" TEST: "2m"
UPDATE_EMAIL_EXPIRY = "2m"
# PROD: "24h" DEV: "1h" TEST: "2m"
VERIFY_EMAIL_EXPIRY = "2m"

NODEMAILER_APP_NAME = ""
NODEMAILER_EMAIL = ""
NODEMAILER_APP_PASSWORD = ""


{
    "watch": [
        "src",
        "../shared/dist"
    ],
    "ext": "ts,js",
    "exec": "npm run build && npm run start"
}


{
    "name": "@syncspace/server",
    "version": "0.0.0",
    "description": "Server for SyncSpace",
    "type": "module",
    "main": "index.js",
    "scripts": {
        "build": "tsc --project tsconfig.json",
        "dev": "nodemon",
        "start": "node dist/server/src/index.js",
        "test": "echo \"Error: no test specified\" && exit 1"
    },
    "dependencies": {
        "@syncspace/shared": "^0.0.0",
        "bcrypt": "^6.0.0",
        "cloudinary": "^2.7.0",
        "cookie-parser": "^1.4.7",
        "cors": "^2.8.5",
        "dotenv": "^17.2.0",
        "express": "^5.1.0",
        "helmet": "^8.1.0",
        "jsonwebtoken": "^9.0.2",
        "method-override": "^3.0.0",
        "mongoose": "^8.16.4",
        "multer": "^2.0.2",
        "nodemailer": "^7.0.6",
        "sharp": "^0.34.3",
        "ua-parser-js": "^2.0.4"
    },
    "devDependencies": {
        "@types/bcrypt": "^6.0.0",
        "@types/cookie-parser": "^1.4.9",
        "@types/cors": "^2.8.19",
        "@types/express": "^5.0.3",
        "@types/jsonwebtoken": "^9.0.10",
        "@types/method-override": "^3.0.0",
        "@types/multer": "^2.0.0",
        "@types/node": "^24.1.0",
        "@types/nodemailer": "^7.0.1",
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
        "outDir": "dist",
        "sourceMap": true,
    },
    "include": [
        "src/**/*"
    ],
    "exclude": [
        "dist"
    ],
    "ts-node": {
        "esm": true
    }
}