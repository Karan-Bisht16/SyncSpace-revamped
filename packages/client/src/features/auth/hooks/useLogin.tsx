import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ApiError, validateAll, validateEmail, validatePassword } from '@syncspace/shared';
// impoting features
import { cleanup, login } from '../../user';
// importing types
import type { FormEvent } from 'react';
import type { AppDispatch, FormState, RootState } from '../../../types';
import type { LoginField } from '../types';
// impoting reducers
import { createErrorHandler, createInitialFormState, formReducer, handleFormDataChange } from '../../../reducers/form.reducer';
// importing hooks
import { useMobile } from '../../../hooks/useMobile';
import { useErrorSnackBar } from '../../../hooks/useErrorSnackBar';
import { useAuthModal } from './useAuthModal';

export const useLoginForm = () => {
    const dispatch = useDispatch<AppDispatch>();

    const loginStatus = useSelector((state: RootState) => state.user.status.login);
    const loginError = useSelector((state: RootState) => state.user.error.login);

    const { closeAuthModal } = useAuthModal();

    const isMobile = useMobile();
    const showErrorSnackBar = useErrorSnackBar();

    const initialFormState: FormState<LoginField> = createInitialFormState(['email', 'password']);
    const [formData, formDispatch] = useReducer(formReducer<LoginField>, initialFormState);
    const { email, password } = formData;
    const onChange = useMemo(() => handleFormDataChange<LoginField>(formDispatch), []);

    const emailRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);
    const refs = { emailRef, passwordRef };

    const loginErrorHandler = createErrorHandler<LoginField>(formDispatch, [emailRef, passwordRef]);

    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            if (loginStatus === 'loading') {
                return;
            }

            const credentialsValidity = validateAll(validateEmail(email.value), validatePassword(password.value));
            if (credentialsValidity !== true) {
                throw credentialsValidity;
            }

            dispatch(login({
                email: email.value,
                password: password.value,
            }));
        } catch (error) {
            loginErrorHandler(error);
        }
    };

    useEffect(() => {
        if (loginStatus === 'succeeded') {
            closeAuthModal();
            dispatch(cleanup('login'));
        }

        if (loginStatus === 'failed' && loginError) {
            showErrorSnackBar(new ApiError(loginError));
            dispatch(cleanup('login'));
        }
    }, [loginStatus, loginError]);

    useEffect(() => {
        if (!isMobile) {
            emailRef.current?.focus();
        }
    }, [isMobile]);

    return {
        formData,
        formDispatch,
        onChange,
        refs,
        showPassword,
        setShowPassword,
        handleSubmit,
    };
};