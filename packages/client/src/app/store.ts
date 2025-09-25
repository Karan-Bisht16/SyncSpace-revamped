import { configureStore } from '@reduxjs/toolkit';
// importing features
import { userReducer } from '../features/user';

export const store = configureStore({
    reducer: {
        user: userReducer,
    },
});