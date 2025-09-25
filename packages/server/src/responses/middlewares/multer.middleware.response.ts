// importing types
import type { GetMulterMiddlewareResponseParams } from '../../types/index.js';

export const getMulterMiddlewareResponse = (params: GetMulterMiddlewareResponseParams) => {
    const { sizeLimitMB, fieldName } = params;

    return {
        configureMulterErrorHandler: {
            fileSizeExceeded: {
                code: 401,
                message: 'File size ' + (sizeLimitMB ? `exceeds ${sizeLimitMB} MB.` : 'exceeded.') + ' Please upload smaller file.',
                context: 'File size has been exceeded',
                trace: 'MulterMiddlewar/configureMulterErrorHandler/fileSizeExceeded',
            },
            unexpectedFieldName: {
                code: 409,
                message: 'Unexpected server side error.',
                context: 'Unexpected field name.' + (fieldName && `Expected file field to be '${fieldName}'.`),
                trace: 'MulterMiddlewar/configureMulterErrorHandler/unexpectedFieldName',
            },
        },
    };
};