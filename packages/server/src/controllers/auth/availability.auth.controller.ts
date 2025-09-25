import {
    ApiError,
    ApiResponse,
    validateAll,
    validateEmail,
    validateUsername,
} from '@syncspace/shared';
// importing models
import { User } from '../../models/user.model.js';
// importing utils
import { asyncReqHandler } from '../../utils/asyncReqHandler.util.js';
import { validateReqQuery } from '../../utils/validateReq.util.js';
// importing responses 
import {
    AvailabilityAuthControllerResponses as responses,
} from '../../responses/index.js';

export const isEmailAvailable = asyncReqHandler(async (req) => {
    const { email } = validateReqQuery(req);
    const { isEmailAvailable: emailRes } = responses;

    const validation = validateAll(validateEmail(email));
    if (validation !== true) {
        throw new ApiError({ ...emailRes.validationFailure, message: validation.message });
    }

    const emailStr = (email as string).toLowerCase();
    const userExists = await User.exists({ email: emailStr });
    if (userExists) {
        throw new ApiError(emailRes.userExists);
    }

    return new ApiResponse(emailRes.success);
});

export const isUsernameAvailable = asyncReqHandler(async (req) => {
    const { username } = validateReqQuery(req);
    const { isUsernameAvailable: usernameRes } = responses;

    const validation = validateAll(validateUsername(username));
    if (validation !== true) {
        throw new ApiError({ ...usernameRes.validationFailure, message: validation.message });
    }

    const usernameStr = (username as string).toLowerCase();
    const userExists = await User.exists({ username: usernameStr }).setOptions({ _withDeleted: true });;
    if (userExists) {
        throw new ApiError(usernameRes.userExists);
    }

    return new ApiResponse(usernameRes.success);
});