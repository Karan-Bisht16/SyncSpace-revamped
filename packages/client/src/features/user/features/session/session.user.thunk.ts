import { createAsyncThunk } from '@reduxjs/toolkit';
import { ApiError, defaultError } from '@syncspace/shared';
// importing app
import { store } from '../../../../app/store';
// importing types
import type { UserClientBase } from '@syncspace/shared';
// importing libs
import { API } from '../../../../libs/axios.lib';
// importing reducers
import { setAccessToken } from '../../reducers/user.reducer';
// importing services
import {
    determineReauth as determineReauthService,
    fetchSession as fetchSessionService,
} from '../../services/api.service';
// importing utils
import { handleUserResponse } from '../../utils/userSlice.utils';

export const fetchSession = createAsyncThunk<
    UserClientBase,
    void,
    { rejectValue: ApiError }
>('session/fetchSession', async (_, { rejectWithValue }) => {
    try {
        const refreshRes = await API.post('/auth/refresh');
        if (refreshRes instanceof ApiError) {
            throw refreshRes;
        }

        const accessToken = refreshRes.data.accessToken;
        store.dispatch(setAccessToken(accessToken));

        const sessionRes = await fetchSessionService();
        if (sessionRes instanceof ApiError) {
            throw sessionRes;
        }

        return sessionRes.data;
    } catch (error) {
        const finalError = error instanceof ApiError ?
            error :
            new ApiError({ ...defaultError, trace: 'fetchSession/noResponseData' });

        return rejectWithValue({ ...finalError });
    }
});

export const determineReauth = createAsyncThunk<
    boolean,
    void,
    { rejectValue: ApiError }
>('session/determineReauth', async (_, { rejectWithValue }) => {
    const response = await determineReauthService();
    return handleUserResponse(response, rejectWithValue);
});