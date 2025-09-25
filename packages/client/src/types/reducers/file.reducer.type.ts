export type FileFieldState = {
    file: File | null,
    error: string,
};

export type FileState<F extends string> = Record<F, FileFieldState>;

export type FileAction<F extends string> =
    | { type: 'SET_FILE', field: F, file: File | null }
    | { type: 'SET_ERROR', field: F, error: string }
    | { type: 'RESET_FILES', }
    | { type: 'RESET_ERRORS', }
    | { type: 'RESET_FORM' };