// importing types
import type { GetCloudinaryLibResponseParams } from '../../types/index.js';

export const CloudinaryLibResponses = {
    uploadToCloudinary: {
        fileSizeExceeded: {
            code: 401,
            message: 'File size too large. Maximum allowed is 10 MB.',
            context: 'Cloudinary upload failed due to 10 MB size restriction',
            trace: 'CloudinaryLib/uploadToCloudinary/fileSizeExceeded',
        },
    },
};

export const getCloudinaryLibResponse = (params: GetCloudinaryLibResponseParams) => {
    const { publicId, aggregateSizeLimitMB, cumulativeSizeMB } = params;

    return {
        deleteFromCloudinary: {
            notFound: {
                code: 404,
                message: 'File not found. It may have already been deleted.',
                context: 'Cloudinary destroy returned not found' + (publicId && ` for publicId: ${publicId}`),
                trace: 'CloudinaryLib/deleteFromCloudinary/notFound',
            }
        },
        uploadFilesToCloudinary: {
            fileSizeExceeded: {
                code: 401,
                message: 'Total file size ' + (aggregateSizeLimitMB ? `exceeds ${aggregateSizeLimitMB} MB.` : 'exceeded.') + ' Please upload smaller files.',
                context: 'Aggregate file size ' + (cumulativeSizeMB && `(${cumulativeSizeMB} MB) `) + 'exceeded the allowed limit',
                trace: 'CloudinaryLib/uploadFilesToCloudinary/fileSizeExceeded',
            },
        },
    };
};