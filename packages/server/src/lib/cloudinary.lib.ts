import { v2 as cloudinary } from 'cloudinary';
import { ApiError } from '@syncspace/shared';
// importing config
import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } from '../config/env.config.js';
// importing types
import type { UploadApiResponse } from 'cloudinary';
import type {
    DeleteFilesFromCloudinaryParams,
    DeleteFromCloudinaryParams,
    UploadFilesToCloudinaryParams,
    UploadToCloudinaryParams
} from '../types/index.js';
// importing responses
import { CloudinaryLibResponses as responses, getCloudinaryLibResponse as getResponses } from '../responses/index.js';

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (
    params: UploadToCloudinaryParams,
): Promise<UploadApiResponse> => {
    const { fileBuffer } = params;
    const { uploadToCloudinary: fileRes } = responses;

    return await new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream((error, result) => {
                if (error) {
                    if (error.http_code === 400 && error.name === 'Error') {
                        return reject(new ApiError(fileRes.fileSizeExceeded));
                    }

                    return reject(error);
                }

                if (!result) {
                    return reject(new Error('Cloudinary upload_stream returned undefined result'));
                }

                return resolve(result);
            })
            .end(fileBuffer);
    });
};

export const deleteFromCloudinary = async (
    params: DeleteFromCloudinaryParams,
): Promise<any | ApiError> => {
    const { publicId } = params;
    const { deleteFromCloudinary: deleteRes } = getResponses({ publicId });

    const response = await cloudinary.uploader.destroy(publicId);
    if (response.result === 'not found') {
        return new ApiError(deleteRes.notFound);
    }

    return response;
};

export const uploadFilesToCloudinary = async (
    params: UploadFilesToCloudinaryParams,
) => {
    const { files, aggregateSizeLimitMB } = params;

    let cumulativeSizeBytes = 0;
    files.forEach((file) => {
        cumulativeSizeBytes += file.size;
    });
    const cumulativeSizeMB = (cumulativeSizeBytes / 1024 / 1024).toFixed(2);
    const { uploadFilesToCloudinary: filesRes } = getResponses({ aggregateSizeLimitMB, cumulativeSizeMB });

    if (cumulativeSizeBytes > aggregateSizeLimitMB * 1024 * 1024) {
        throw new ApiError(filesRes.fileSizeExceeded);
    }

    let successfulUploads = 0;
    return await Promise.all(files.map(async (file) => {
        const fileUploadResult = { fileName: file.filename, uploaded: true };

        try {
            const cloudinaryResult = await uploadToCloudinary({ fileBuffer: file.buffer });
            (fileUploadResult as any).data = normalizeCloudinaryResponse(cloudinaryResult);

            successfulUploads++;
        } catch (error) {
            fileUploadResult.uploaded = false;

            if (error instanceof Error) {
                (fileUploadResult as any).message = error.message;

                if (error instanceof ApiError) {
                    const errors = error.errors;
                    if (errors.length > 0) {
                        (fileUploadResult as any).errors = errors;
                    }
                }
            }
        }

        return fileUploadResult;
    }));
};

export const deleteFilesFromCloudinary = async (
    params: DeleteFilesFromCloudinaryParams,
) => {
    const { publicIds } = params;

    let deletedCount = 0;
    return await Promise.all(publicIds.map(async (publicId) => {
        const fileDeletionResult = { publicId, deleted: true };

        const cloudinaryResult = await deleteFromCloudinary({ publicId });
        if (cloudinaryResult instanceof ApiError) {
            fileDeletionResult.deleted = false;
            (fileDeletionResult as any).message = cloudinaryResult.message;

            const errors = cloudinaryResult.errors;
            if (errors && Array.isArray(errors) && errors.length > 0) {
                (fileDeletionResult as any).errors = errors;
            }
        } else {
            deletedCount++;
        }

        return fileDeletionResult;
    }));
};

export const normalizeCloudinaryResponse = (cloudinaryResponse: UploadApiResponse) => {
    return {
        assetId: cloudinaryResponse.asset_id,
        publicId: cloudinaryResponse.public_id,
        displayName: cloudinaryResponse.display_name,
        url: cloudinaryResponse.url,
        resourceType: cloudinaryResponse.resource_type,
        format: cloudinaryResponse.format,
        createdAt: cloudinaryResponse.created_at,
        bytes: cloudinaryResponse.bytes,
        width: cloudinaryResponse.width,
        height: cloudinaryResponse.height,
    };
};