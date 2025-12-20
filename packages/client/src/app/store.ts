import { configureStore } from '@reduxjs/toolkit';
// importing features
import { socketReducer } from '../features/socket';
import { userReducer } from '../features/user';

export const store = configureStore({
    reducer: {
        user: userReducer,
        socket: socketReducer,
    },
});