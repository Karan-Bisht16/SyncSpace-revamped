// importing types
import type { GetValidateReqUtilResponseParams } from '../../types/index.js';

export const ValidateReqUtilResponses = {
    validateReqBody: {
        noBody: {
            code: 401,
            message: 'No data received. Please try again.',
            context: 'Request body is missing or invalid. Ensure form submission is correctly structured.',
            trace: 'ValidateReqUtil/validateReqBody/noBody',
        },
    },
    validateReqFile: {
        noFile: {
            code: 401,
            message: 'No file uploaded. Please try again.',
            context: 'Expected `req.file.buffer` to exist, but it was undefined. Multer may not have parsed the file.',
            trace: 'ValidateReqUtil/validateReqFile/noFile',
        },
    },
    validateReqFiles: {
        noFiles: {
            code: 401,
            message: 'No files were uploaded. Please try again.',
            context: 'req.files is undefined or not parsed by multer middleware.',
            trace: 'ValidateReqUtil/validateReqFiles/noFiles',
        },
    },
    validateReqQuery: {
        noQuery: {
            code: 401,
            message: 'No query parameters received. Please check your URL.',
            context: 'req.query is either missing or not an object. Could indicate malformed URL or handler.',
            trace: 'ValidateReqUtil/validateReqQuery/noQuery',
        },
    },
    validateReqOrigin: {
        invalidOrigin: {
            code: 409,
            message: 'Request origin is not valid.',
            context: 'Request origin is not mentioned in CORS_ORIGIN within .env.',
            trace: 'ValidateReqUtil/validateReqOrigin/invalidOrigin'
        },
    },
};

export const getValidateReqUtilResponse = (params: GetValidateReqUtilResponseParams) => {
    const { fieldName, count } = params;

    return {
        validateReqFiles: {
            noField: {
                code: 401,
                message: 'No files found' + (fieldName && `for field '${fieldName}'`) + '.',
                context: 'req.files did not contain the expected field ' + (fieldName && `(${fieldName}) `) + ' or its value is not an array.',
                trace: 'ValidateReqUtil/validateReqFiles/noField',
            },
            noFile: {
                code: 401,
                message: 'No files were uploaded' + (fieldName && `under the field '${fieldName}'`) + '.',
                context: 'The  field ' + (fieldName && `(${fieldName}) `) + 'exists but contains an empty array.',
                trace: 'ValidateReqUtil/validateReqFiles/noFile',
            },
            noFileBuffer: {
                code: 401,
                message: (count ? `${count} uploaded file(s)` : 'Some') + ' could not be processed.',
                context: 'Found ' + (count ? `${count}` : 'some') + ' files without a valid .buffer. Likely an issue during multer file parsing.',
                trace: 'ValidateReqUtil/validateReqFiles/noFileBuffer',
            },
        },
    };
};