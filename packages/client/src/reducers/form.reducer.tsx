// importing types
import type { ChangeEvent, Dispatch, RefObject } from 'react';
import type { IndexedValidationError } from '@syncspace/shared';
import type { FormAction, FormState } from '../types';
// importing utils
import { logError } from '../utils/log.util';

export const formReducer = <F extends string>(
    state: FormState<F>,
    action: FormAction<F>
): FormState<F> => {
    switch (action.type) {
        case 'SET_VALUE':
            return {
                ...state,
                [action.field]: { ...state[action.field], value: action.value },
            };
        case 'SET_ERROR':
            return {
                ...state,
                [action.field]: { ...state[action.field], error: action.error },
            };
        case 'RESET_VALUES':
            const resetValuesState = { ...state };
            Object.keys(resetValuesState).forEach((field) => {
                resetValuesState[field as F] = {
                    ...resetValuesState[field as F],
                    value: '',
                };
            });

            return resetValuesState;
        case 'RESET_ERRORS':
            const resetErrorsState = { ...state };
            Object.keys(resetErrorsState).forEach((field) => {
                resetErrorsState[field as F] = {
                    ...resetErrorsState[field as F],
                    error: '',
                };
            });

            return resetErrorsState;
        case 'RESET_FORM':
            const fields = Object.keys(state) as F[];
            return createInitialFormState(fields);
        default:
            return state;
    }
};

export const handleFormDataChange = <F extends string>(
    formDispatch: Dispatch<FormAction<F>>
) => (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    formDispatch({ type: 'SET_VALUE', field: name as F, value });
};

export const createInitialFormState = <F extends string>(
    fields: F[]
): FormState<F> => {
    const initialState = {} as FormState<F>;
    fields.forEach((field) => {
        initialState[field] = { value: '', error: '' };
    });

    return initialState;
};

export const createErrorHandler = <Field extends string>(
    formDispatch: Dispatch<{ type: 'SET_ERROR'; field: Field; error: string }>,
    fieldMap: RefObject<HTMLInputElement | null>[]
) => {
    return (error: unknown) => {
        if (
            typeof error === 'object' &&
            error !== null &&
            ('message' in error && typeof error.message === 'string') &&
            ('src' in error && typeof error.src === 'string') &&
            ('index' in error && typeof error.index === 'number')
        ) {
            const { message, src, index } = error as IndexedValidationError;
            formDispatch({ type: 'SET_ERROR', field: src as Field, error: message });

            setTimeout(() => {
                const ref = fieldMap[index];
                ref?.current?.focus();
            }, 0);
        } else {
            logError(error);
        }
    };
};