import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ApiError, ApiResponse } from '@syncspace/shared';
// importing features
import { cleanup } from '../../user';
// importing types
import type { ApiCallStatus, AppDispatch, RootState } from '../../../types';
// importing contexts
import { useSnackBarContext } from '../../../contexts/snackbar.context';
// importing hooks
import { useErrorSnackBar } from '../../../hooks/useErrorSnackBar';
// importing services
import {
    initiateEmailVerification as initiateEmailVerificationService,
} from '../services/api.service';
import { reauthCallbackRegistry } from '../../reauth';

export const useVerifyEmail = () => {
    const { openSnackBar } = useSnackBarContext();

    const dispatch = useDispatch<AppDispatch>();

    const showErrorSnackBar = useErrorSnackBar();

    const [initiateEmailVerificationStatus, setInitiateEmailVerification] = useState<ApiCallStatus>('idle');

    const verifyEmailStatus = useSelector((state: RootState) => state.user.status.verifyEmail);
    const verifyEmailError = useSelector((state: RootState) => state.user.error.verifyEmail);

    const initiateEmailVerification = async () => {
        try {
            if (initiateEmailVerificationStatus === 'loading') {
                return;
            }

            setInitiateEmailVerification('loading');

            const onSuccess = () => {
                setInitiateEmailVerification('succeeded');
                openSnackBar({ status: 'success', message: 'Verification mail sent' });
            };

            const onError = (error: ApiError) => {
                setInitiateEmailVerification('failed');
                openSnackBar({ status: 'error', message: error.message });
            };

            const callbackId = crypto.randomUUID();
            const response = await initiateEmailVerificationService(callbackId);
            if (response instanceof ApiError) {
                reauthCallbackRegistry.set(callbackId, { onSuccess, onError });
                onError(response);
            } else if (response instanceof ApiResponse) {
                onSuccess();
            }
        } catch (error) {
            setInitiateEmailVerification('failed');
        }
    };

    useEffect(() => {
        if (verifyEmailStatus === 'succeeded') {
            dispatch(cleanup('verifyEmail'));
        }

        if (verifyEmailStatus === 'failed' && verifyEmailError) {
            showErrorSnackBar(new ApiError(verifyEmailError));
            dispatch(cleanup('verifyEmail'));
        }
    }, [verifyEmailStatus, verifyEmailError]);

    return {
        initiateEmailVerification,
    };
};