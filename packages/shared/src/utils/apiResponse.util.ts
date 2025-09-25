// importing types
import type { ApiResponseParams } from '../types/index.js';

export class ApiResponse {
    code: number;
    success: boolean;
    partial: boolean;
    message: string;
    data: any;

    constructor(response: ApiResponseParams) {
        const { code, partial, message, data } = response;

        this.code = code;
        this.success = code < 400;
        this.partial = partial || false;
        this.message = message || 'Request completed successfully.';
        this.data = data || false;
    }
};