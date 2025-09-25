// importing types
import type { ChangeEvent, Dispatch } from 'react';
import type { FileAction, FileState } from '../types';

export const fileReducer = <F extends string>(
    state: FileState<F>,
    action: FileAction<F>
): FileState<F> => {
    switch (action.type) {
        case 'SET_FILE':
            return {
                ...state,
                [action.field]: { ...state[action.field], file: action.file },
            };
        case 'SET_ERROR':
            return {
                ...state,
                [action.field]: { ...state[action.field], error: action.error },
            };
        case 'RESET_FILES':
            const resetValuesState = { ...state };
            Object.keys(resetValuesState).forEach((field) => {
                resetValuesState[field as F] = {
                    ...resetValuesState[field as F],
                    file: null,
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
            return createInitialFileState(fields);
        default:
            return state;
    }
};

export const handleFileDataChange = <F extends string>(
    fileDispatch: Dispatch<FileAction<F>>
) => (event: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = event.target;
    const selectedFile = files?.[0];
    if (!selectedFile) {
        fileDispatch({ type: 'SET_ERROR', field: name as F, error: 'No file selected' });
        return;
    }

    fileDispatch({ type: 'SET_FILE', field: name as F, file: selectedFile });
};

export const createInitialFileState = <F extends string>(
    fields: F[]
): FileState<F> => {
    const initialState = {} as FileState<F>;
    fields.forEach((field) => {
        initialState[field] = { file: null, error: '' };
    });

    return initialState;
};