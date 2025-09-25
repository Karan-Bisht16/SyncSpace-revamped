import { createAsyncThunk } from '@reduxjs/toolkit';
import { ApiError } from '@syncspace/shared';
// importing types
import type { UserClientBase } from '@syncspace/shared';
import type {
    LoginParams,
    ReauthParams,
    RegisterParams,
    ResetPasswordParams,
    SessionInitReturnType,
} from '../../types';
// importing services
import {
    login as loginService,
    logout as logoutService,
    reauth as reauthService,
    register as registerService,
    resetPassword as resetPasswordService,
} from '../../services/api.service';
// importing utils
import { handleUserResponse } from '../../utils/userSlice.utils';

export const register = createAsyncThunk<
    SessionInitReturnType,
    RegisterParams,
    { rejectValue: ApiError }
>('auth/register', async (body, { rejectWithValue }) => {
    const response = await registerService(body);
    return handleUserResponse(response, rejectWithValue);
});

export const login = createAsyncThunk<
    SessionInitReturnType,
    LoginParams,
    { rejectValue: ApiError }
>('auth/login', async (body, { rejectWithValue }) => {
    const response = await loginService(body);
    return handleUserResponse(response, rejectWithValue);
});

export const resetPassword = createAsyncThunk<
    SessionInitReturnType,
    ResetPasswordParams,
    { rejectValue: ApiError }
>('auth/resetPassword', async (body, { rejectWithValue }) => {
    const response = await resetPasswordService(body);
    return handleUserResponse(response, rejectWithValue);
});

export const reauth = createAsyncThunk<
    { accessToken: string },
    ReauthParams,
    { rejectValue: ApiError }
>('auth/reauth', async (body, { rejectWithValue }) => {
    const response = await reauthService(body);
    return handleUserResponse(response, rejectWithValue);
});

export const logout = createAsyncThunk<
    UserClientBase,
    void,
    { rejectValue: ApiError }
>('auth/logout', async (_, { rejectWithValue }) => {
    const response = await logoutService();
    return handleUserResponse(response, rejectWithValue);
});