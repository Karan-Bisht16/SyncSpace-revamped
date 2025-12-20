import { createSlice } from '@reduxjs/toolkit';
// importing types
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SocketSlice } from '../types';

const initialSocketState: SocketSlice = {
    connected: false,
};

const socketSlice = createSlice({
    name: 'socket',
    initialState: initialSocketState,
    reducers: {
        setSocketId(state, action: PayloadAction<string>) {
            state.socketId = action.payload;
            state.connected = true;
        },
        clearSocket(state) {
            state.socketId = undefined;
            state.connected = false;
        },
    },
});

export const {
    setSocketId,
    clearSocket,
} = socketSlice.actions;
export const socketReducer = socketSlice.reducer;