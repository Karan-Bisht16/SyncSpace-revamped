import 'dotenv/config';

const requiredEnvs = [
    'MODE',
    'PORT',
    'CORS_ORIGINS',
    'MONGODB_URI',
    'ACCESS_TOKEN_SECRET',
    'ACCESS_TOKEN_EXPIRY',
    'ACCESS_TOKEN_EXPIRY_MINUTES',
    'REFRESH_TOKEN_SECRET',
    'REFRESH_TOKEN_EXPIRY',
    'REFRESH_TOKEN_EXPIRY_DAYS',
    'REFRESH_TOKEN_BUFFER_DAYS',
    'RE_AUTH_BUFFER_MINUTES',
    'EMAIL_SECRET',
    'RESET_PASSWORD_EXPIRY',
    'UPDATE_EMAIL_EXPIRY',
    'VERIFY_EMAIL_EXPIRY',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'NODEMAILER_APP_NAME',
    'NODEMAILER_EMAIL',
    'NODEMAILER_APP_PASSWORD',
] as const;

requiredEnvs.forEach((key) => {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
});

export const MODE = process.env.MODE!;
export const PORT = process.env.PORT!;
export const CORS_ORIGINS = process.env.CORS_ORIGINS!;
export const MONGODB_URI = process.env.MONGODB_URI!;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
export const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY!;
export const ACCESS_TOKEN_EXPIRY_MINUTES = Number(process.env.ACCESS_TOKEN_EXPIRY_MINUTES!);
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
export const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY!;
export const REFRESH_TOKEN_EXPIRY_DAYS = Number(process.env.REFRESH_TOKEN_EXPIRY_DAYS!);
export const REFRESH_TOKEN_BUFFER_DAYS = Number(process.env.REFRESH_TOKEN_BUFFER_DAYS!);
export const RE_AUTH_BUFFER_MINUTES = Number(process.env.RE_AUTH_BUFFER_MINUTES!);
export const EMAIL_SECRET = process.env.EMAIL_SECRET!;
export const RESET_PASSWORD_EXPIRY = process.env.RESET_PASSWORD_EXPIRY!;
export const UPDATE_EMAIL_EXPIRY = process.env.UPDATE_EMAIL_EXPIRY!;
export const VERIFY_EMAIL_EXPIRY = process.env.VERIFY_EMAIL_EXPIRY!;
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY!;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET!;
export const NODEMAILER_APP_NAME = process.env.NODEMAILER_APP_NAME!;
export const NODEMAILER_EMAIL = process.env.NODEMAILER_EMAIL!;
export const NODEMAILER_APP_PASSWORD = process.env.NODEMAILER_APP_PASSWORD!;