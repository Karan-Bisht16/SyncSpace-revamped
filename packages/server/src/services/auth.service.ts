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