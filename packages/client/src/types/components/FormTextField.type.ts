// importing types
import type { Dispatch } from 'react';
import type { TextFieldProps } from '@mui/material';
import type { ValidationError } from '@syncspace/shared';
import type { FormAction, FormFieldState } from '../reducers/form.reducer.type';

export type FormTextFieldProps = {
    name: string,
    label: string,
    data: FormFieldState,
    submitting?: boolean,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    dispatch?: Dispatch<FormAction<any>>;
    validate?: (value?: string) => true | ValidationError | Promise<true | ValidationError>;
} & TextFieldProps;