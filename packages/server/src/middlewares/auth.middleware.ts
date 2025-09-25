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