// importing utils
import { ApiError } from './apiError.util.js';
// importing validators
import { isObject } from '../validators/type.validator.js';

export const defaultError = new ApiError({
    code: 503,
    message: 'Network error. Please check your connection and try again.',
    context: 'Axios request failed due to no response (likely a network issue)',
    trace: '',
});

export const checkError = (error: any, code: number, trace: string) => {
    return error?.response?.data?.code === code && error?.response?.data?.trace === trace;
};

export const handleAxiosError = (error: unknown): ApiError => {
    if (
        isObject(error) && 'response' in error && error.response &&
        isObject(error.response) && 'data' in error.response && error.response.data
    ) {
        const { data } = error.response as Record<string, any>;

        return new ApiError({
            code: data?.code || 500,
            message: data?.message || 'Something went wrong. Please try again later.',
            context: data?.context || 'Received an error response from upstream Axios request',
            trace: data?.trace || 'handleAxiosError/response.data',
            errors: data?.errors || undefined,
            stack: data?.stack || undefined,
        });
    }

    let normalized: any = {};
    if (isObject(error) && 'message' in error) {
        normalized = {
            message: (error as any)?.message,
            code: (error as any)?.code,
            name: (error as any)?.name,
        };
    }

    return new ApiError({
        ...defaultError,
        trace: 'handleAxiosError/noResponseData',
        errors: normalized,
    });
};