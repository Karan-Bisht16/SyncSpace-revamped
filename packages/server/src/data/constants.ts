// importing types
import type { CookieOptions } from 'express';

export const DB_NAME = 'syncspace-ver1';

export const SALT_ROUNDS = 10;

export const COOKIES_OPTION: CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/auth/refresh',
};

export const AUTH_TOKEN_FIELDS = { _id: 'string', uuid: 'string' } as const;

// Maximum allowed file size (in MB) for a single file upload
// Note: Cloudinary limits uploads to 10 MB
export const ROOT_MAX_SINGLE_FILE_SIZE_MB = 10;
// Maximum allowed combined file size (in MB) when uploading multiple files
export const ROOT_MAX_AGGREGATE_FILE_SIZE_MB = 20;