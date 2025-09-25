export type ApiErrorParams = {
    code: number,
    message: string,
    context: string,
    trace: string,
    errors?: any,
    stack?: string
};