import 'dotenv/config';

const requiredEnvs = [
    'MODE',
    'PORT',
    'ALLOWED_ORIGINS',
] as const;

requiredEnvs.forEach((key) => {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
});

export const MODE = process.env.MODE!;
export const PORT = process.env.PORT!;
export const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS!;