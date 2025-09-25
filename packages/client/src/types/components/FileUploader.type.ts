// importing types
import type { Dispatch, InputHTMLAttributes, ReactElement, ReactNode } from 'react';
import type { ValidationError } from '@syncspace/shared';
import type { FileAction, FileFieldState } from '../reducers/file.reducer.type';

export type FileUploaderProps = {
    name: string,
    data: FileFieldState,
    submitting?: boolean,
    onUpload?: (file: File) => void,
    dispatch?: Dispatch<FileAction<any>>;
    validate?: (value?: File) => true | ValidationError | Promise<true | ValidationError>;
    accept: string,
    uploadIcon: ReactNode,
    size?: number,
    sx?: object,
} & InputHTMLAttributes<HTMLInputElement>;

export type FileUploaderButtonParams = {
    tooltip: string,
    icon: ReactElement,
    submitting?: boolean,
    onClick: () => void,
};