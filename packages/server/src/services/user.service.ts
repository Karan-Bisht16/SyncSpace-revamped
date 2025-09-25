import { ApiError, validateAll, validateEmail } from '@syncspace/shared';
// importing types
import type { UserDocument } from '@syncspace/shared';
// importing models
import { User } from '../models/user.model.js';
// importing responses
import {
    UserServiceResponses as responses,
} from '../responses/index.js';

export const getUserState = (user: UserDocument) => {
    const {
        auth: { credentials, refreshTokens, ...restAuth },
        ...rest
    } = user.toObject();

    return {
        auth: {
            ...restAuth,
        },
        ...rest,
    } as UserDocument;
};

export const validateNewEmail = async (newEmail?: string) => {
    const { validateNewEmail: emailRes } = responses;

    const validation = validateAll(validateEmail(newEmail));
    if (validation !== true) {
        throw new ApiError({ ...emailRes.validationFailure, message: validation.message });
    }

    const newEmailStr = (newEmail as string).toLowerCase();
    const existingUser = await User.findOne({ email: newEmailStr });
    if (existingUser) {
        throw new ApiError(emailRes.emailNotAvailable);
    }

    return newEmailStr;
};