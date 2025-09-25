import { ApiError, ApiResponse, defaultStartupSetting, emptyUser } from '@syncspace/shared';
// importing data
import { clientConfig } from '../../../data/constants.data';
// importing types
import type { PayloadAction, WritableDraft } from '@reduxjs/toolkit';
import type { SettingSchema } from '@syncspace/shared';
import type { SessionInitReturnType, UserService, UserSlice } from '../types';

const defaultSetting: SettingSchema = {
    startupSetting: defaultStartupSetting,
};

export const loadUserWithSettings = () => {
    const { localStorageKey } = clientConfig;

    const savedStartupSetting = localStorage.getItem(localStorageKey);

    if (savedStartupSetting) {
        try {
            return {
                ...emptyUser,
                setting: { startupSetting: JSON.parse(savedStartupSetting) },
            };
        } catch {
            return { ...emptyUser, setting: defaultSetting };
        }
    }

    return { ...emptyUser, setting: defaultSetting };
};

export const persistSetting = (setting: SettingSchema) => {
    const { localStorageKey } = clientConfig;

    localStorage.setItem(
        localStorageKey,
        JSON.stringify(setting.startupSetting)
    );
};

export const handleLogin = (state: WritableDraft<UserSlice>, action: PayloadAction<SessionInitReturnType>) => {
    state.user = action.payload.user;
    state.accessToken = action.payload.accessToken;
    state.isLoggedIn = true;
    state.prevSetting = state.user.setting;

    persistSetting(state.user.setting);
};

export const handleLogout = (state: WritableDraft<UserSlice>) => {
    const prevUser = state.user;

    state.user = {
        ...emptyUser,
        setting: { startupSetting: prevUser.setting.startupSetting }
    };

    state.isLoggedIn = false;
    state.prevSetting = state.user.setting;
    persistSetting(state.user.setting);
};

export const handleUserResponse = (response: ApiResponse | ApiError, rejectWithValue: (value: ApiError) => unknown) => {
    if (response instanceof ApiError) {
        return rejectWithValue({ ...response });
    }

    return response.data;
};

export const setUserLoading = (service: UserService, state: WritableDraft<UserSlice>) => {
    state.status[service] = 'loading';
    state.error[service] = null;
};

export const setUserSuccess = (service: UserService, state: WritableDraft<UserSlice>) => {
    state.status[service] = 'succeeded';
    state.error[service] = null;
};

export const setUserError = (service: UserService, state: WritableDraft<UserSlice>, action: PayloadAction<ApiError | undefined>) => {
    state.status[service] = 'failed';
    state.error[service] = action.payload ?? null;
};