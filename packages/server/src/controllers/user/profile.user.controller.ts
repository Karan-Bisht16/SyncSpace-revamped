import {
    ApiError,
    ApiResponse,
    validateAll,
    validateCurrentPassword,
    validateNewPassword,
} from '@syncspace/shared';
// importing config
import { UPDATE_EMAIL_EXPIRY, VERIFY_EMAIL_EXPIRY } from '../../config/env.config.js';
// importing types
import type { UserDocument } from '@syncspace/shared';
// importing models
import { User } from '../../models/user.model.js';
// importing libs
import { validateToken } from '../../lib/jwt.lib.js';
import { getEmail, getEmailLink, sendMail } from '../../lib/nodemailer.lib.js';
// importing service
import { validateNewEmail } from '../../services/user.service.js';
// importing utils
import { asyncReqHandler } from '../../utils/asyncReqHandler.util.js';
import { validateReqBody } from '../../utils/validateReq.util.js';
// importing responses 
import {
    ProfileUserControllerResponses as responses,
    getProfileUserControllerResponse as getResponses,
} from '../../responses/index.js';

export const initiateEmailVerification = asyncReqHandler(async (req) => {
    const { initiateEmailVerification: emailRes } = responses;

    const user = req.user as UserDocument;

    // TODO: add received socket id as well
    const link = await getEmailLink({
        req,
        action: 'verifyEmail',
        data: { _id: user._id, email: req.user.email },
        expiresIn: VERIFY_EMAIL_EXPIRY || '24h',
    });

    (async () => {
        sendMail({
            req,
            to: getEmail(user),
            subject: 'Verify email',
            html: `<a href='${link}'>Click here</a>`,
            priority: 'high',
        });
    })();

    return new ApiResponse(emailRes.success);
});

export const verifyEmail = asyncReqHandler(async (req) => {
    const { verifyEmailToken } = validateReqBody(req);
    const { verifyEmail: emailRes } = responses;

    const user = await validateToken({
        action: 'updateEmail',
        token: verifyEmailToken,
        fields: { _id: 'string', newEmail: 'string' },
    });

    await User.findByIdAndUpdate(user._id, {
        $set: { 'auth.isEmailVerified': true },
    });

    // TODO: should i add 'Who this?' link in email?
    (async () => {
        sendMail({
            req,
            to: getEmail(user),
            subject: 'Email updated',
            html: `Your email ${user.email} is verified for account r/${user.username}`,
            priority: 'high',
        });
    })();

    return new ApiResponse(emailRes.success);
});

export const initiateEmailUpdation = asyncReqHandler(async (req) => {
    const { newEmail } = validateReqBody(req);
    const { initiateEmailUpdation: emailRes } = responses;

    const newEmailStr = validateNewEmail(newEmail);

    const user = req.user as UserDocument;

    const link = await getEmailLink({
        req,
        action: 'updateEmail',
        data: { _id: user._id, newEmail: newEmailStr },
        expiresIn: UPDATE_EMAIL_EXPIRY || '24h',
    });

    (async () => {
        sendMail({
            req,
            to: getEmail(user),
            subject: 'Update email',
            html: `<a href='${link}'>Click here</a>`,
            priority: 'high',
        });
    })();

    return new ApiResponse(emailRes.success);
});

// TODO: Should it be get (as in as soon as link is opened then updateEmail is fired) or 
// post (a page is opened and user clicks on a button to fire updateEmail)???
export const updateEmail = asyncReqHandler(async (req) => {
    const { emailToken, newEmail } = validateReqBody(req);
    const { updateEmail: emailRes } = responses;

    const user = await validateToken({
        action: 'updateEmail',
        token: emailToken,
        fields: { _id: 'string', newEmail: 'string' },
    });

    const newEmailStr = validateNewEmail(newEmail);

    await User.findByIdAndUpdate(user._id, {
        $set: { email: newEmailStr },
    });

    // TODO: should i add 'Who this?' link in email?
    (async () => {
        sendMail({
            req,
            to: getEmail(user),
            subject: 'Email updated',
            html: `Your email ${newEmailStr} is now linked to r/${user.username}`,
            priority: 'high',
        });
    })();

    return new ApiResponse(emailRes.success);
});

export const changePassword = asyncReqHandler(async (req) => {
    const { changePassword: passwordRes } = responses;

    const { currentPassword, newPassword } = validateReqBody(req);

    const validation = validateAll(validateCurrentPassword(currentPassword), validateNewPassword(newPassword));
    if (validation !== true) {
        throw new ApiError({ ...passwordRes.validationFailure, message: validation.message });
    }

    const credentialsStr = currentPassword as string;

    const user = req.user as UserDocument;

    const { changePassword: dynamicChangePasswordRes } = getResponses(user);

    if (user.auth.authProvider !== 'email') {
        throw new ApiError(dynamicChangePasswordRes.invalidAuthProvider);
    }

    const correctCredentials = await user.verifyCredentials(credentialsStr);
    if (!correctCredentials) {
        // TODO: should i send this?
        (async () => {
            sendMail({
                req,
                to: getEmail(user),
                subject: 'Security Alert',
                html: 'Someone tried to update your password but was unsuccessful',
                priority: 'high',
            });
        })();
        throw new ApiError(passwordRes.incorrectCredentials);
    }

    user.auth.credentials = newPassword as string;
    await user.save();

    // TODO: add wasn't me?
    (async () => {
        sendMail({
            req,
            to: getEmail(user),
            subject: 'Password Changed',
            html: `Password to the account r/${user.username} has been successfully updated`,
            priority: 'high',
        });
    })();

    return new ApiResponse(passwordRes.success);
});