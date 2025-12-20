import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ApiError, validateAll, validateNewPassword } from '@syncspace/shared';
// importing types
import type { FormEvent } from 'react';
import type { ResetPasswordField } from '../types';
import type { AppDispatch, FormState, RootState } from '../../../types';
// importing features
import { cleanup, resetPassword } from '../../user';
// importing hooks
import { useErrorSnackBar } from '../../../hooks/useErrorSnackBar';
import { useMobile } from '../../../hooks/useMobile';
// importing reducers
import {
    createErrorHandler,
    createInitialFormState,
    formReducer,
    handleFormDataChange,
} from '../../../reducers/form.reducer';

export const useResetPassword = (token: string) => {
    const dispatch = useDispatch<AppDispatch>();

    const resetPasswordStatus = useSelector((state: RootState) => state.user.status.resetPassword);
    const resetPasswordError = useSelector((state: RootState) => state.user.error.resetPassword);

    const navigate = useNavigate();

    const isMobile = useMobile();
    const showErrorSnackBar = useErrorSnackBar();

    const initialFormState: FormState<ResetPasswordField> = createInitialFormState(['newPassword']);
    const [formData, formDispatch] = useReducer(formReducer<ResetPasswordField>, initialFormState);
    const { newPassword } = formData;

    const [showPassword, setShowPassword] = useState(false);

    const onChange = useMemo(() => handleFormDataChange<ResetPasswordField>(formDispatch), []);

    const newPasswordRef = useRef<HTMLInputElement | null>(null);

    const resetPasswordErrorHandler = createErrorHandler<ResetPasswordField>(formDispatch, [newPasswordRef]);

    const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            if (resetPasswordStatus === 'loading') {
                return;
            }

            const validity = validateAll(validateNewPassword(newPassword.value));
            if (validity !== true) {
                throw validity;
            }

            dispatch(resetPassword({
                resetPasswordToken: token,
                newPassword: newPassword.value,
            }));
        } catch (error) {
            resetPasswordErrorHandler(error);
        }
    };

    useEffect(() => {
        if (resetPasswordStatus === 'succeeded') {
            dispatch(cleanup('resetPassword'));
            navigate('/', { replace: true });
        }

        if (resetPasswordStatus === 'failed' && resetPasswordError) {
            showErrorSnackBar(new ApiError(resetPasswordError));
            dispatch(cleanup('resetPassword'));
        }
    }, [resetPasswordStatus, resetPasswordError]);

    useEffect(() => {
        if (!isMobile) {
            newPasswordRef.current?.focus();
        }
    }, [isMobile]);

    return {
        formData,
        formDispatch,
        onChange,
        newPasswordRef,
        showPassword,
        setShowPassword,
        handleResetPassword,
    };
};
