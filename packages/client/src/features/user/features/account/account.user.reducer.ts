// importing types
import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import type { UserSlice } from '../../types';
// importing thunks
import { deleteAccount, resetSetting, updateSetting } from './account.user.thunk';
// importing utils
import {
    loadUserWithSettings,
    persistSetting,
    setUserError,
    setUserLoading,
    setUserSuccess,
} from '../../utils/userSlice.utils';

export const accountExtraReducers = (builder: ActionReducerMapBuilder<UserSlice>) => {
    builder
        // TODO: implement queue system for update requests
        // updateSetting
        .addCase(updateSetting.pending, (state) => {
            setUserLoading('updateSetting', state);
        })
        .addCase(updateSetting.fulfilled, (state, action) => {
            state.user.setting = action.payload;
            state.prevSetting = state.user.setting;
            persistSetting(state.user.setting);

            setUserSuccess('updateSetting', state);
        })
        .addCase(updateSetting.rejected, (state, action) => {
            if (state.prevSetting) {
                state.user.setting = state.prevSetting;
                persistSetting(state.user.setting);
            }

            setUserError('updateSetting', state, action);
        })
        // resetSetting
        .addCase(resetSetting.pending, (state) => {
            setUserLoading('resetSetting', state);
        })
        .addCase(resetSetting.fulfilled, (state, action) => {
            state.user.setting = action.payload;
            state.prevSetting = state.user.setting;
            persistSetting(state.user.setting);

            setUserSuccess('resetSetting', state);
        })
        .addCase(resetSetting.rejected, (state, action) => {
            if (state.prevSetting) {
                state.user.setting = state.prevSetting;
                persistSetting(state.user.setting);
            }

            setUserError('resetSetting', state, action);
        })
        // deleteAccount
        .addCase(deleteAccount.pending, (state) => {
            setUserLoading('deleteAccount', state);
        })
        .addCase(deleteAccount.fulfilled, (state) => {
            state.user = loadUserWithSettings();
            state.isLoggedIn = false;
            state.prevSetting = state.user.setting;

            persistSetting(state.user.setting);
            setUserSuccess('deleteAccount', state);
        })
        .addCase(deleteAccount.rejected, (state, action) => {
            setUserError('deleteAccount', state, action);
        })
};