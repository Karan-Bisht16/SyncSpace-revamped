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