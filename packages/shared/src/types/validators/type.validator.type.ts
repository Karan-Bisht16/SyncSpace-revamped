// importing validators
import * as validator from '../../validators/type.validator.js';

export type SpecificType =
    'string' |
    'number' |
    'boolean' |
    'object' |
    'array' |
    'function' |
    'reactElement' |
    'stringOrReactElement';

export type SpecificValidators =
    | typeof validator.isString
    | typeof validator.isNumber
    | typeof validator.isBoolean
    | typeof validator.isObject
    | typeof validator.isArray
    | typeof validator.isFunction
    | typeof validator.isReactElement
    | typeof validator.isStringOrReactElement;