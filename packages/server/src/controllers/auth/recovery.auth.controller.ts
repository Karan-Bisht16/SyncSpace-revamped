import { ApiError, ApiResponse, validateAll, validateEmail } from '@syncspace/shared';
// importing config
import { RESET_PASSWORD_EXPIRY } from '../../config/env.config.js';
// importing data
import { COOKIES_OPTION } from '../../data/constants.js';
// importing models
import { User } from '../../models/user.model.js';
// importing libs
import { validateToken } from '../../lib/jwt.lib.js';
import { getEmail, getEmailLink, sendMail } from '../../lib/nodemailer.lib.js';
// importing services
import { initSessionTokens } from '../../services/auth.service.js';
import { getUserState } from '../../services/user.service.js';
// importing utils
import { asyncReqHandler } from '../../utils/asyncReqHandler.util.js';
import { validateReqBody } from '../../utils/validateReq.util.js';
// importing responses
import {
    RecoveryAuthControllerResponses as responses,
} from '../../responses/index.js'

// TODO: forgot password should have a limit like twice in 15 minutes
// store request attempts per user/email and per IP in a short-term cache (Redis)
// maybe this can be changed by user in setting but still within limits
// TODO: maybe let users disable password reset emails entirely; and make that requireReauth
export const forgotPassword = asyncReqHandler(async (req) => {
    const { email } = validateReqBody(req);
    const { forgotPassword: forgotRes } = responses;

    const validation = validateAll(validateEmail(email));
    if (validation !== true) {
        throw new ApiError({ ...forgotRes.validationFailure, message: validation.message });
    }

    const user = await User.findOne({ email });

    const link = await getEmailLink({
        req,
        action: 'resetPassword',
        data: { _id: user?._id || 'NA' },
        expiresIn: RESET_PASSWORD_EXPIRY || '10m',
    });

    if (user) {
        (async () => {
            sendMail({
                req,
                to: getEmail(user),
                subject: 'Reset password',
                html: `<a href='${link}'>Click here</a>`,
                priority: 'high',
            });
        })();
    }

    return new ApiResponse(forgotRes.success);
});

// TODO: add in setting 'auto-login after reset'
// if true (default) then user is logged in immediately after reseting password
// otherwise redirected to auth/login
export const resetPassword = asyncReqHandler(async (req, res) => {
    const { resetPasswordToken, newPassword } = validateReqBody(req);
    const { resetPassword: resetRes } = responses;

    const user = await validateToken({
        action: 'resetPassword',
        token: resetPasswordToken,
        fields: { _id: 'string' },
    });

    user.auth.credentials = newPassword;
    await user.save();

    const { accessToken, refreshToken } = await initSessionTokens({ req, user });
    res.cookie('refreshToken', refreshToken, COOKIES_OPTION);
    req.user = user;

    return new ApiResponse({
        ...resetRes.success,
        data: { user: getUserState(user), accessToken },
    });
});