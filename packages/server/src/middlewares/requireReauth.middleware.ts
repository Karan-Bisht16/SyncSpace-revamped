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