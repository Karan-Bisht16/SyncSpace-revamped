// importing types
import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import type { UserSlice } from '../../types';
// importing thunks
import {
    determineReauth,
    fetchSession,
} from './session.user.thunk';
// importing utils
import {
    loadUserWithSettings,
    persistSetting,
    setUserError,
    setUserLoading,
    setUserSuccess,
} from '../../utils/userSlice.utils';

export const sessionExtraReducers = (builder: ActionReducerMapBuilder<UserSlice>) => {
    builder
        // fetchSession
        .addCase(fetchSession.pending, (state) => {
            setUserLoading('fetchSession', state);
        })
        .addCase(fetchSession.fulfilled, (state, action) => {
            state.user = action.payload;
            state.isLoggedIn = true;
            state.prevSetting = state.user.setting;

            persistSetting(state.user.setting);
            setUserSuccess('fetchSession', state);
        })
        .addCase(fetchSession.rejected, (state, action) => {
            state.user = loadUserWithSettings();
            state.isLoggedIn = false;
            state.prevSetting = null;
            setUserError('fetchSession', state, action);
        })
        // determineReauth
        .addCase(determineReauth.pending, (state) => {
            setUserLoading('determineReauth', state);
        })
        .addCase(determineReauth.fulfilled, (state, action) => {
            state.needsReauth = action.payload;
            setUserSuccess('determineReauth', state);
        })
        .addCase(determineReauth.rejected, (state, action) => {
            setUserError('determineReauth', state, action);
        })
};