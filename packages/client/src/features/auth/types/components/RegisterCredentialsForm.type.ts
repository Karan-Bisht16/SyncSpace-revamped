// importing types
import type { ActionDispatch, ChangeEvent, Dispatch, RefObject, SetStateAction } from 'react';
import type { ValidationError } from '@syncspace/shared';
import type { FormAction, FormFieldState } from '../../../../types';
import type { AvailabilityState, RegisterFormField } from '../hooks/useRegister.type';

export type RegisterCredentialsFormProps = {
    email: FormFieldState,
    password: FormFieldState,
    emailRef: RefObject<HTMLInputElement | null>,
    passwordRef: RefObject<HTMLInputElement | null>,
    formDispatch: ActionDispatch<[action: FormAction<RegisterFormField>]>,
    onChange: (event: ChangeEvent<HTMLInputElement>) => void,
    showPassword: boolean,
    setShowPassword: Dispatch<SetStateAction<boolean>>,
    emailAvailability: AvailabilityState,
    validateEmailAvailability: () => Promise<true | ValidationError>,
    submitting: boolean,
};