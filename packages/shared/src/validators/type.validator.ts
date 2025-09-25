import { isValidElement } from 'react';
// impoting types
import type { SpecificType, SpecificValidators } from '../types/index.js';

export const isUndefined = (value: unknown): value is undefined => {
    return typeof value === 'undefined';
};

export const isString = (value: unknown): value is string => {
    return typeof value === 'string' && value.trim().length > 0;
};

export const isNumber = (value: unknown): value is number => {
    return typeof value === 'number';
};

export const isBoolean = (value: unknown): value is boolean => {
    return typeof value === 'boolean';
};

export const isObject = (value: unknown): value is object => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const isArray = (value: unknown): value is unknown[] => {
    return Array.isArray(value);
};

export const isNonEmptyArray = (value: unknown): value is unknown[] => {
    return Array.isArray(value) && value.length > 0;
};

export const isFunction = (value: unknown): value is Function => {
    return typeof (value) === 'function';
};

export const isReactElement = (value: unknown) => {
    return isValidElement(value);
};

export const isStringOrReactElement = (value: unknown) => {
    return isString(value) || isReactElement(value);
};

export const isOptionalType = (value: unknown, type: SpecificType) => {
    if (isUndefined(value)) {
        return true;
    }

    switch (type) {
        case 'string':
            return isString(value);
        case 'number':
            return isNumber(value);
        case 'boolean':
            return isBoolean(value);
        case 'object':
            return isObject(value);
        case 'array':
            return isArray(value);
        case 'function':
            return isFunction(value);
        case 'reactElement':
            return isReactElement(value);
        case 'stringOrReactElement':
            return isStringOrReactElement(value);
        default:
            return false;
    }
};

export const validate = (value: unknown, validatorFunction: SpecificValidators, context: string) => {
    if (!validatorFunction(value)) {
        console.log(`${context} is invalid; ${value}`);
        return false;
    }

    return true;
};

export const validateOptional = (value: unknown, type: SpecificType, context: string) => {
    if (!isOptionalType(value, type)) {
        console.log(`${context} is invalid; ${value}`);
        return false;
    }

    return true;
};