import { createAsyncThunk } from '@reduxjs/toolkit';
import { ApiError } from '@syncspace/shared';
// importing types
import type { UserClientBase } from '@syncspace/shared';
import type { UpdateEmailParams } from '../../types';
// importing services
import {
    updateEmail as updateEmailService,
    verifyEmail as verifyEmailService,
} from '../../services/api.service';
// importing utils
import { handleUserResponse } from '../../utils/userSlice.utils';

export const updateEmail = createAsyncThunk<
    UserClientBase,
    UpdateEmailParams,
    { rejectValue: ApiError }
>('profile/updateEmail', async (body, { rejectWithValue }) => {
    const response = await updateEmailService(body);
    return handleUserResponse(response, rejectWithValue);
});

export const verifyEmail = createAsyncThunk<
    void,
    void,
    { rejectValue: ApiError }
>('profile/verifyEmail', async (_, { rejectWithValue }) => {
    const response = await verifyEmailService();
    return handleUserResponse(response, rejectWithValue);
});