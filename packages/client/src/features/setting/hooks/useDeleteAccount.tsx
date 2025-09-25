import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ApiError } from '@syncspace/shared';
// importing features
import { cleanup } from '../../user';
// importing types
import type { AppDispatch, RootState } from '../../../types';
// importing hooks
import { useErrorSnackBar } from '../../../hooks/useErrorSnackBar';
import { useSettingModal } from './useSettingModal';

export const useDeleteAccount = () => {
    const dispatch = useDispatch<AppDispatch>();

    const showErrorSnackBar = useErrorSnackBar();

    // deleteAccount
    const deleteAccountStatus = useSelector((state: RootState) => state.user.status.deleteAccount);
    const deleteAccountError = useSelector((state: RootState) => state.user.error.deleteAccount);

    const { closeDeleteAccountModal, closeSettingModal } = useSettingModal();

    useEffect(() => {
        if (deleteAccountStatus === 'succeeded') {
            closeDeleteAccountModal();
            closeSettingModal();
            dispatch(cleanup('deleteAccount'));
        }

        if (deleteAccountStatus === 'failed' && deleteAccountError) {
            showErrorSnackBar(new ApiError(deleteAccountError));
            dispatch(cleanup('deleteAccount'));
        }
    }, [deleteAccountStatus, deleteAccountError]);

    // determineReauth
    const determineReauthStatus = useSelector((state: RootState) => state.user.status.determineReauth);
    const determineReauthError = useSelector((state: RootState) => state.user.error.determineReauth);

    useEffect(() => {
        if (determineReauthStatus === 'failed' && determineReauthError) {
            showErrorSnackBar(new ApiError(determineReauthError));
            dispatch(cleanup('determineReauth'));
        }
    }, [determineReauthStatus, determineReauthError]);

    return {
        dispatch,
        determineReauthStatus,
    };
};