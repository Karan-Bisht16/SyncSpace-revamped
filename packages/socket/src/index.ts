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