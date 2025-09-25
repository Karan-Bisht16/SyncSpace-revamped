// importing config
import { CORS_ORIGINS } from './env.config.js';

export const corsWhitelist = CORS_ORIGINS?.split(',').map((url) => url.trim()) || [];

export const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin || corsWhitelist.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`Not allowed by CORS - ${origin}`));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    optionsSuccessStatus: 200,
};