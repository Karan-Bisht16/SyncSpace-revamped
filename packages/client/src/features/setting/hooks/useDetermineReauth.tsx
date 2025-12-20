import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ApiError } from '@syncspace/shared';
// importing features
import { cleanup } from '../../user';
// importing types
import type { AppDispatch, RootState } from '../../../types';
// importing hooks
import { useErrorSnackBar } from '../../../hooks/useErrorSnackBar';

export const useDetermineReauth = () => {
    const dispatch = useDispatch<AppDispatch>();

    const showErrorSnackBar = useErrorSnackBar();

    const determineReauthStatus = useSelector((state: RootState) => state.user.status.determineReauth);
    const determineReauthError = useSelector((state: RootState) => state.user.error.determineReauth);

    useEffect(() => {
        if (determineReauthStatus === 'failed' && determineReauthError) {
            showErrorSnackBar(new ApiError(determineReauthError));
            dispatch(cleanup('determineReauth'));
        }
    }, [determineReauthStatus, determineReauthError]);

    return {
        determineReauthStatus,
    };
};