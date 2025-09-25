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