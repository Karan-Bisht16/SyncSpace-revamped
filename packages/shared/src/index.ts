import { v7 as uuidv7 } from 'uuid';
// importing types
import type { IndexedValidationError, ValidationError } from './types/index.js';

export * from './data/constants.data.js';

export * from './types/index.js';

export * from './utils/apiError.util.js';
export * from './utils/apiResponse.util.js';
export * from './utils/error.util.js';
export * from './utils/string.util.js';
export * from './utils/time.util.js';

export * from './validators/user.validator.js';
export * from './validators/type.validator.js';

export const sharedStr = `From @syncspace/shared: ${uuidv7()}`;

export const validateAll = (
    ...results: (true | ValidationError)[]
): true | IndexedValidationError => {
    const index = results.findIndex(result => result !== true);

    if (index === -1) {
        return true;
    }

    const error = results[index] as ValidationError;
    return { index, ...error };
};