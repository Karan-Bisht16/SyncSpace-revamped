// importing types
import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import type { UserSlice } from '../../types';
// importing thunks
import { updateEmail } from './profile.user.thunk';
// importing utils
import {
    setUserError,
    setUserLoading,
    setUserSuccess,
} from '../../utils/userSlice.utils';

export const profileExtraReducers = (builder: ActionReducerMapBuilder<UserSlice>) => {
    builder
        // updateEmail
        .addCase(updateEmail.pending, (state) => {
            setUserLoading('updateEmail', state);
        })
        .addCase(updateEmail.fulfilled, (state, action) => {
            state.user = action.payload;
            setUserSuccess('updateEmail', state);
        })
        .addCase(updateEmail.rejected, (state, action) => {
            setUserError('updateEmail', state, action);
        })
        // verifyEmail
        // in case of verifyEmail their will be 2 routes:
        // 1. initiate verification -> send mail to user.email with link to verify mail [Not redux based]
        // 2. actual verify email -> when clicked on link set isVerified true [redux based]
        // doubt? what to do then? after seting isVerified in backend what to send to client?
        // cuz their are 2 cases ->
        // case 1: (ideal case) the window from which the user initiated the verification process; 
        // if the user is opening the verification link (from mail) in the same window then 
        // I can just set state.user and the ui will reflect that email has been verified
        // case 2: (realistic case) if the window from which the user initiated the verification process 
        // is different from the one in which the user is opening the verification link (from mail), like their phone 
        // then i can't just set state.user; cuz that would mean that i am sending user info in a device prematurely 
        // thus i should not send user info after verification; but then 
        // the initial window (from which the user initiated the verification process) wouldn't update the UI
        // What i want is to update the UI after verification link from email has been clicked and 
        // without sending the entire user info trigger a ui update in the initial window
};