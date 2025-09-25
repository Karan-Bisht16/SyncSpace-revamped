// importing types
import type { FileUploadHandlerParams } from '../types/index.js';
// importing middleware
import { configureMulter, configureMulterErrorHandler } from '../middlewares/multer.middleware.js';

// returns an array of middleware for handling a file upload
export const fileUploadHandler = (params: FileUploadHandlerParams) => {
    const { sizeLimitMB, fieldName, single } = params;

    const sizeLimitBytes = sizeLimitMB * 1024 * 1024;

    if (single) {
        return [
            configureMulter({ sizeLimitBytes }).single(fieldName),
            configureMulterErrorHandler({ sizeLimitMB, fieldName })
        ];
    }

    return [
        configureMulter({ sizeLimitBytes }).fields([{ name: fieldName }]),
        configureMulterErrorHandler({ sizeLimitMB, fieldName }),
    ];
};