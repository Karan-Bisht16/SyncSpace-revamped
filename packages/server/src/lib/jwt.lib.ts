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