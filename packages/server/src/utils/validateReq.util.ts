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