import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { ApiError, ApiResponse, validateAll, validatePassword } from '@syncspace/shared';
// importing types
import type { FormEvent } from 'react';
import type { IndexedValidationError } from '@syncspace/shared';
import type { ApiCallStatus, FormState } from '../../../types';
import type { ForgotPasswordField } from '../types';
// importing reducers
import { createErrorHandler, createInitialFormState, formReducer, handleFormDataChange } from '../../../reducers/form.reducer';
// importing hooks
import { useErrorSnackBar } from '../../../hooks/useErrorSnackBar';
import { useMobile } from '../../../hooks/useMobile';
// importing services
import {
    forgotPassword as forgotPasswordService,
} from '../services/api.service';

export const useForgotPassword = () => {
    const showErrorSnackBar = useErrorSnackBar();
    const isMobile = useMobile();

    const [forgotPasswordStatus, setForgotPasswordStatus] = useState<ApiCallStatus>('idle');

    const initialFormState: FormState<ForgotPasswordField> = createInitialFormState(['email']);
    const [formData, formDispatch] = useReducer(formReducer<ForgotPasswordField>, initialFormState);
    const { email } = formData;
    const onChange = useMemo(() => handleFormDataChange<ForgotPasswordField>(formDispatch), []);

    const emailRef = useRef<HTMLInputElement | null>(null);

    const forgotPasswordErrorHandler = createErrorHandler<ForgotPasswordField>(formDispatch, [emailRef]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            if (forgotPasswordStatus === 'loading') {
                return;
            }

            setForgotPasswordStatus('loading');

            const emailValidity = validateAll(validatePassword(email.value));
            if (emailValidity !== true) {
                throw emailValidity;
            }

            const response = await forgotPasswordService({ email: email.value });
            showErrorSnackBar(response);
            if (response instanceof ApiError) {
                throw {
                    index: 0,
                    src: 'email',
                    message: response.message,
                } as IndexedValidationError;
            } else if (response instanceof ApiResponse) {
                setForgotPasswordStatus('succeeded');
            }
        } catch (error) {
            setForgotPasswordStatus('failed');
            forgotPasswordErrorHandler(error);
        }
    };

    useEffect(() => {
        if (!isMobile) {
            emailRef.current?.focus();
        }
    }, [isMobile]);

    return {
        formData,
        formDispatch,
        onChange,
        emailRef,
        handleSubmit,
        forgotPasswordStatus,
    };
};