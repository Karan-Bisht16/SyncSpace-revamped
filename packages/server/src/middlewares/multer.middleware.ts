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