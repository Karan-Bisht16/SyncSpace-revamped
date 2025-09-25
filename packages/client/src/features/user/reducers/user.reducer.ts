import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
// importing features
import { accountExtraReducers } from '../features/account/account.user.reducer';
import { authExtraReducers } from '../features/auth/auth.user.reducer';
import { profileExtraReducers } from '../features/profile/profile.user.reducer';
import { sessionExtraReducers } from '../features/session/session.user.reducer';
// importing types
import type { SettingSchema } from '@syncspace/shared';
import type { ApiCallStatus } from '../../../types';
import type { RetryMeta, UserService, UserSlice } from '../types';
// importing utils
import { handleLogout, loadUserWithSettings } from '../utils/userSlice.utils';

const initialUserState: UserSlice = {
    user: loadUserWithSettings(),
    isLoggedIn: false,
    status: {} as Record<UserService, ApiCallStatus>,
    error: {} as Record<UserService, null>,
    prevSetting: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState: initialUserState,
    reducers: {
        cleanup: (state, action: PayloadAction<UserService>) => {
            state.status[action.payload] = 'idle';
            state.error[action.payload] = null;
        },
        setAccessToken: (state, action: PayloadAction<string>) => {
            state.accessToken = action.payload;
        },
        promptReauth: (state, action: PayloadAction<RetryMeta>) => {
            state.reauthMeta = {
                active: true,
                retryMeta: action.payload,
            };
        },
        closeReauth: (state) => {
            state.reauthMeta = undefined;
        },
        optimisticUpdateSetting: (state, action: PayloadAction<SettingSchema>) => {
            state.prevSetting = state.user.setting;
            state.user.setting = action.payload;
        },
        logUserOut: (state) => {
            handleLogout(state);
        },
    },
    extraReducers: (builder) => {
        builder:
        accountExtraReducers(builder);
        authExtraReducers(builder);
        profileExtraReducers(builder);
        sessionExtraReducers(builder);
    },
});

export const {
    cleanup,
    setAccessToken,
    promptReauth,
    closeReauth,
    optimisticUpdateSetting,
    logUserOut,
} = userSlice.actions;
export const userReducer = userSlice.reducer;