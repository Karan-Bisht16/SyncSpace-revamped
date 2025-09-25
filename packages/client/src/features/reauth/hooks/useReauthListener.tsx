import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ApiError, ApiResponse } from '@syncspace/shared';
// importing features
import { cleanup, closeReauth, retryRegistry } from '../../user';
// importing type
import type { AppDispatch, RootState } from '../../../types';
// importing hooks
import { useErrorSnackBar } from '../../../hooks/useErrorSnackBar';
import { useReauthModal } from './useReauthModal';
// importing utils
import { reauthCallbackRegistry } from '../utils/reauthCallbackRegistry.util';

export const useReauthListener = () => {
    const dispatch = useDispatch<AppDispatch>();

    const reauthMeta = useSelector((state: RootState) => state.user.reauthMeta);
    const reauthStatus = useSelector((state: RootState) => state.user.status.reauth);
    const reauthError = useSelector((state: RootState) => state.user.error.reauth);

    const showErrorSnackBar = useErrorSnackBar();
    const { openReauthModal, closeReauthModal } = useReauthModal();

    useEffect(() => {
        if (!reauthMeta) {
            return;
        }

        if (reauthMeta.active) {
            openReauthModal();
        }
    }, [reauthMeta]);

    const handleRedoRequest = async () => {
        if (reauthMeta?.retryMeta) {
            const { reauthService, args, callbackId } = reauthMeta.retryMeta;

            const retryFn = retryRegistry[reauthService];
            const response = await retryFn(args, dispatch);

            if (callbackId) {
                const callbacks = reauthCallbackRegistry.get(callbackId);
                reauthCallbackRegistry.delete(callbackId);

                if (response instanceof ApiError) {
                    await callbacks?.onError?.(response);
                } else if (response instanceof ApiResponse) {
                    await callbacks?.onSuccess?.(response);
                }
            }

            closeReauthModal();
            dispatch(closeReauth());
            dispatch(cleanup('reauth'));
        }
    };

    useEffect(() => {
        if (reauthStatus === 'succeeded') {
            handleRedoRequest();
        }

        if (reauthStatus === 'failed' && reauthError) {
            showErrorSnackBar(new ApiError(reauthError));
            dispatch(cleanup('reauth'));
        }
    }, [reauthStatus, reauthError]);
};