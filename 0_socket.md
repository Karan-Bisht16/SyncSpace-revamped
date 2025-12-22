import 'dotenv/config';

const whitelist = process.env.ALLOWED_ORIGINS?.split(',').map((url) => url.trim()) || [];

export const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin || whitelist.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST'],
};


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


import * as http from 'http';
import { Server } from 'socket.io';
// importing config
import { corsOptions } from './cors.config.js';

export const configureSocketIO = (server: http.Server) => {
    const { origin, methods, credentials, optionsSuccessStatus } = corsOptions;
    
    return new Server(server, {
        cors: {
            origin,
            methods,
            credentials,
            optionsSuccessStatus,
        },
        connectionStateRecovery: {
            maxDisconnectionDuration: 2 * 60 * 1000,
        },
    });
};


import cors from 'cors';
import helmet from 'helmet';
import express from 'express';
import cookieParser from 'cookie-parser';
import { getLocalDateTime } from '@syncspace/shared';
// importing config
import { corsOptions } from './config/cors.config.js';
// importing utils
// import { errorHandler } from './utils/errorHandler.util.js';

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

app.get("/ping", (req, res) => {
    res.status(200).send("pong 🏓");
});

// app.use(errorHandler);

export default app;


import * as http from 'http';
import { Server, Socket } from 'socket.io';
import * as shared from '@syncspace/shared';
// importing config
import { PORT } from './config/env.config.js';
import { configureSocketIO } from './config/socket.io.config.js';
// importing app
import app from './app.js';
// importing lib
// import { RoomStore } from './lib/roomStore.js';
// importing socket event handlers
// import { handleSessionEvents } from './socket/session.socket.js';

const server = http.createServer(app);
const io: Server = configureSocketIO(server);

// const roomStore = new RoomStore();

try {
    const { sharedStr } = shared;
    console.log(sharedStr);

    io.on('connection', (socket: Socket) => {
        console.log(`New connection: ${socket.id}`);
        
        // handleSessionEvents(io, socket, roomStore);
        socket.on('disconnect', () => {
            console.log(`Connection disconected: ${socket.id}`);
        });
    });

    server.listen(PORT, () => {
        console.log(`Socket is running on port ${PORT}`);
    });
} catch (error) {
    console.error('Failed to initialize app. Check socket.io connection or port availability \n', error);
} 


MODE = "DEVELOPMENT"

PORT = "8000"
ALLOWED_ORIGINS = "http://localhost:3000, http://localhost:8080"