// importing types
import type { UserProfileValidationField, UserValidationField } from './user.validator.type.js';

export type ValidationError = {
    src: UserValidationField | UserProfileValidationField,
    message: string,
};

export type IndexedValidationError = ValidationError & {
    index: number,
};