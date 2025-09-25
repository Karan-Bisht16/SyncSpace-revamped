export type FormFieldState = {
    value: string,
    error: string,
};

export type FormState<F extends string> = Record<F, FormFieldState>;

export type FormAction<F extends string> =
    | { type: 'SET_VALUE', field: F, value: string }
    | { type: 'SET_ERROR', field: F, error: string }
    | { type: 'RESET_VALUES', }
    | { type: 'RESET_ERRORS', }
    | { type: 'RESET_FORM' };