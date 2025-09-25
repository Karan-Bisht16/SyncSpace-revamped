import { createAsyncThunk } from '@reduxjs/toolkit';
import { ApiError, defaultSetting } from '@syncspace/shared';
// importing types
import type { SettingSchema } from '@syncspace/shared';
import type { UpdateSettingParams } from '../../types';
import type { RootState } from '../../../../types';
// importing services
import {
    deleteAccount as deleteAccountService,
    resetSetting as resetSettingService,
    updateSetting as updateSettingService,
} from '../../services/api.service';
import { handleUserResponse } from '../../utils/userSlice.utils';

export const updateSetting = createAsyncThunk<
    SettingSchema,
    UpdateSettingParams,
    { state: RootState, rejectValue: ApiError }
>('account/updateSetting', async (body, { getState, rejectWithValue }) => {
    const { isLoggedIn } = getState().user;

    if (!isLoggedIn) {
        return body.newSetting;
    }

    const response = await updateSettingService(body);
    return handleUserResponse(response, rejectWithValue);
});

export const resetSetting = createAsyncThunk<
    SettingSchema,
    void,
    { state: RootState, rejectValue: ApiError }
>('account/resetSetting', async (_, { getState, rejectWithValue }) => {
    const { isLoggedIn } = getState().user;

    if (!isLoggedIn) {
        return defaultSetting;
    }

    const response = await resetSettingService();
    return handleUserResponse(response, rejectWithValue);
});

export const deleteAccount = createAsyncThunk<
    void,
    void,
    { rejectValue: ApiError }
>('account/deleteAccount', async (_, { rejectWithValue }) => {
    const response = await deleteAccountService();
    return handleUserResponse(response, rejectWithValue);
});