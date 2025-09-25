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