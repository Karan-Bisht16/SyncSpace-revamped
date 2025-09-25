// importing types
import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import type { UserSlice } from '../../types';
// importing thunks
import { login, logout, reauth, register, resetPassword } from './auth.user.thunk';
// importing utils
import {
    handleLogin,
    handleLogout,
    loadUserWithSettings,
    setUserError,
    setUserLoading,
    setUserSuccess,
} from '../../utils/userSlice.utils';

export const authExtraReducers = (builder: ActionReducerMapBuilder<UserSlice>) => {
    builder
        // register
        .addCase(register.pending, (state) => {
            setUserLoading('register', state);
        })
        .addCase(register.fulfilled, (state, action) => {
            handleLogin(state, action);
            setUserSuccess('register', state);
        })
        .addCase(register.rejected, (state, action) => {
            state.user = loadUserWithSettings();
            state.isLoggedIn = false;
            setUserError('register', state, action);
        })
        // login
        .addCase(login.pending, (state) => {
            setUserLoading('login', state);
        })
        .addCase(login.fulfilled, (state, action) => {
            handleLogin(state, action);
            setUserSuccess('login', state);
        })
        .addCase(login.rejected, (state, action) => {
            state.user = loadUserWithSettings();
            state.isLoggedIn = false;
            setUserError('login', state, action);
        })
        // resetPassword
        .addCase(resetPassword.pending, (state) => {
            setUserLoading('resetPassword', state);
        })
        .addCase(resetPassword.fulfilled, (state, action) => {
            handleLogin(state, action);
            setUserSuccess('resetPassword', state);
        })
        .addCase(resetPassword.rejected, (state, action) => {
            state.user = loadUserWithSettings();
            state.isLoggedIn = false;
            setUserError('resetPassword', state, action);
        })
        // reauth
        .addCase(reauth.pending, (state) => {
            setUserLoading('reauth', state);
        })
        .addCase(reauth.fulfilled, (state, action) => {
            state.accessToken = action.payload.accessToken;
            setUserSuccess('reauth', state);
        })
        .addCase(reauth.rejected, (state, action) => {
            setUserError('reauth', state, action);
        })
        // logout
        .addCase(logout.pending, (state) => {
            setUserLoading('logout', state);
        })
        .addCase(logout.fulfilled, (state) => {
            handleLogout(state);
            setUserSuccess('logout', state);
        })
        .addCase(logout.rejected, (state, action) => {
            setUserError('logout', state, action);
        })
};