import cors from 'cors';
import helmet from 'helmet';
import express from 'express';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';
import { getLocalDateTime } from '@syncspace/shared';
// importing config
import { corsOptions } from './config/cors.config.js';
// importing utils
import { errorHandler } from './utils/errorHandler.util.js';

const app = express();

app.use((req, res, next) => {
    console.error('[REQ]', getLocalDateTime(new Date()), req.method, req.originalUrl);
    next();
});

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cors(corsOptions));
app.use(cookieParser());

app.use(helmet());

app.use((req, res, next) => {
    // block clickjacking [blocks iframes]
    res.setHeader('X-Frame-Options', 'DENY');
    // no referrer info leaks
    res.setHeader('Referrer-Policy', 'no-referrer');
    next();
});

app.use(methodOverride('_method'));

// importing routes
import authRoutes from './routes/auth.routes.js';
app.use('/auth', authRoutes);
import userRoutes from './routes/user.routes.js';
app.use('/user', userRoutes);
import interactionRoutes from './routes/interaction.routes.js';
app.use('/interaction', interactionRoutes);

app.use(errorHandler);

export default app;