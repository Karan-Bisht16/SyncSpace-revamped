import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { validateAll, validatePassword } from '@syncspace/shared';
// importing features
import { reauth } from '../../user';
// importing types
import type { FormEvent } from 'react';
import type { AppDispatch, FormState, RootState } from '../../../types';
import type { ReauthField } from '../types';
// importing reducers
import { createErrorHandler, createInitialFormState, formReducer, handleFormDataChange } from '../../../reducers/form.reducer';
// importing hooks
import { useMobile } from '../../../hooks/useMobile';

export const useReauth = () => {
    const dispatch = useDispatch<AppDispatch>();
    const reauthStatus = useSelector((state: RootState) => state.user.status.reauth);

    const isMobile = useMobile();

    const initialFormState: FormState<ReauthField> = createInitialFormState(['password']);
    const [formData, formDispatch] = useReducer(formReducer<ReauthField>, initialFormState);
    const { password } = formData;
    const onChange = useMemo(() => handleFormDataChange<ReauthField>(formDispatch), []);

    const passwordRef = useRef<HTMLInputElement | null>(null);

    const reauthErrorHandler = createErrorHandler<ReauthField>(formDispatch, [passwordRef]);

    const [showPassword, setShowPassword] = useState(false);

    const handleReauth = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            if (reauthStatus === 'loading') {
                return;
            }

            const credentialsValidity = validateAll(validatePassword(password.value));
            if (credentialsValidity !== true) {
                throw credentialsValidity;
            }

            dispatch(reauth({ password: password.value }))
        } catch (error) {
            reauthErrorHandler(error);
        }
    };

    useEffect(() => {
        if (!isMobile) {
            passwordRef.current?.focus();
        }
    }, [isMobile]);

    return {
        formData,
        formDispatch,
        onChange,
        passwordRef,
        showPassword,
        setShowPassword,
        handleReauth,
    };
};