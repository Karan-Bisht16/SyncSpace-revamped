import { useEffect, useMemo, useReducer, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ApiError, validateAll, validateEmail } from '@syncspace/shared';
// importing features
import { cleanup, updateEmail } from '../../user';
// importing types
import type { FormEvent } from 'react';
import type { AppDispatch, FormState, RootState } from '../../../types';
import type { UpdateEmailField } from '../types';
// importing reducers
import { createErrorHandler, createInitialFormState, formReducer, handleFormDataChange } from '../../../reducers/form.reducer';
// importing hooks
import { useErrorSnackBar } from '../../../hooks/useErrorSnackBar';

export const useUpdateEmail = () => {
    const showErrorSnackBar = useErrorSnackBar();

    const dispatch = useDispatch<AppDispatch>();

    const updateEmailStatus = useSelector((state: RootState) => state.user.status.updateEmail);
    const updateEmailError = useSelector((state: RootState) => state.user.error.updateEmail);

    const initialFormState: FormState<UpdateEmailField> = createInitialFormState(['email']);
    const [formData, formDispatch] = useReducer(formReducer<UpdateEmailField>, initialFormState);
    const { email } = formData;
    const onChange = useMemo(() => handleFormDataChange<UpdateEmailField>(formDispatch), []);

    const emailRef = useRef<HTMLInputElement | null>(null);

    const updateEmailErrorHandler = createErrorHandler<UpdateEmailField>(formDispatch, [emailRef]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            if (updateEmailStatus === 'loading') {
                return;
            }


            const emailValidity = validateAll(validateEmail(email.value));
            if (emailValidity !== true) {
                throw emailValidity;
            }

            dispatch(updateEmail({ newEmail: email.value }));
        } catch (error) {
            updateEmailErrorHandler(error);
        }
    };

    useEffect(() => {
        if (updateEmailStatus === 'succeeded') {
            dispatch(cleanup('updateEmail'));
        }

        if (updateEmailStatus === 'failed' && updateEmailError) {
            showErrorSnackBar(new ApiError(updateEmailError));
            dispatch(cleanup('deleteAccount'));
        }
    }, [updateEmailStatus, updateEmailError]);

    return {
        formData,
        formDispatch,
        onChange,
        emailRef,
        handleSubmit,
    };
};