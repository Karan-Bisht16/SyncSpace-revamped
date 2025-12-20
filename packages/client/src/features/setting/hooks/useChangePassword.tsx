import { useMemo, useReducer, useRef, useState } from 'react';
import { ApiError, ApiResponse, validateAll, validateCurrentPassword, validateNewPassword } from '@syncspace/shared';
// importing features
import { reauthCallbackRegistry } from '../../reauth';
// importing types
import type { FormEvent } from 'react';
import type { IndexedValidationError } from '@syncspace/shared';
import type { ApiCallStatus, FormState } from '../../../types';
import type { ChangePasswordField } from '../types';
// importing reducers
import { createErrorHandler, createInitialFormState, formReducer, handleFormDataChange } from '../../../reducers/form.reducer';
// importing contexts
import { useSnackBarContext } from '../../../contexts/snackbar.context';
// importing services
import {
    changePassword as changePasswordService,
} from '../services/api.service';

export const useChangePassword = () => {
    const { openSnackBar } = useSnackBarContext();

    const [changePasswordStatus, setChangePasswordStatus] = useState<ApiCallStatus>('idle');

    const initialFormState: FormState<ChangePasswordField> = createInitialFormState(['currentPassword', 'newPassword']);
    const [formData, formDispatch] = useReducer(formReducer<ChangePasswordField>, initialFormState);
    const { currentPassword, newPassword } = formData;
    const onChange = useMemo(() => handleFormDataChange<ChangePasswordField>(formDispatch), []);

    const currentPasswordRef = useRef<HTMLInputElement | null>(null);
    const newPasswordRef = useRef<HTMLInputElement | null>(null);
    const refs = { currentPasswordRef, newPasswordRef };

    const changePasswordErrorHandler = createErrorHandler<ChangePasswordField>(formDispatch, [currentPasswordRef, newPasswordRef]);

    const [showPassword, setShowPassword] = useState({ currentPassword: false, newPassword: false });

    const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            if (changePasswordStatus === 'loading') {
                return;
            }

            setChangePasswordStatus('loading');

            const credentialsValidity = validateAll(validateCurrentPassword(currentPassword.value), validateNewPassword(newPassword.value));
            if (credentialsValidity !== true) {
                throw credentialsValidity;
            }

            if (currentPassword.value === newPassword.value) {
                throw {
                    index: 1,
                    src: 'newPassword',
                    message: `New password can't be the same as current password`,
                } as IndexedValidationError;
            }

            const body = {
                currentPassword: currentPassword.value,
                newPassword: newPassword.value,
            };

            const onSuccess = () => {
                formDispatch({ type: 'RESET_FORM' });
                setChangePasswordStatus('succeeded');
                openSnackBar({ status: 'success', message: 'Password changed successfully..' });
            };

            const onError = (error: ApiError) => {
                setChangePasswordStatus('failed');
                openSnackBar({ status: 'error', message: error.message });
            };

            const callbackId = crypto.randomUUID();
            const response = await changePasswordService(body, callbackId);
            if (response instanceof ApiError) {
                reauthCallbackRegistry.set(callbackId, { onSuccess, onError });
                onError(response);
            } else if (response instanceof ApiResponse) {
                onSuccess();
            }
        } catch (error) {
            setChangePasswordStatus('failed');
            changePasswordErrorHandler(error);
        }
    };

    return {
        formData,
        formDispatch,
        onChange,
        refs,
        showPassword,
        setShowPassword,
        handleChangePassword,
    };
};