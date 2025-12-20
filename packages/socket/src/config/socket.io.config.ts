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