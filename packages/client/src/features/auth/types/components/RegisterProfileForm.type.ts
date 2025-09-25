// importing types
import type { ActionDispatch, ChangeEvent, RefObject } from 'react';
import type { ValidationError } from '@syncspace/shared';
import type { FormAction, FileFieldState, FormFieldState, FileAction } from '../../../../types';
import type { AvailabilityState, RegisterFileField, RegisterFormField } from '../hooks/useRegister.type';

export type RegisterProfileFormProps = {
    username: FormFieldState,
    profilePic: FileFieldState,
    usernameRef: RefObject<HTMLInputElement | null>,
    onChange: (event: ChangeEvent<HTMLInputElement>) => void,
    formDispatch: ActionDispatch<[action: FormAction<RegisterFormField>]>,
    fileDispatch: ActionDispatch<[action: FileAction<RegisterFileField>]>,
    usernameAvailability: AvailabilityState,
    validateUsernameAvailability: () => Promise<true | ValidationError>,
    submitting: boolean,
};