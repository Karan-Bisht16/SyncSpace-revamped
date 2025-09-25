// importing types
import type { UserDocument } from '@syncspace/shared';

export const ProfileUserControllerResponses = {
    initiateEmailVerification: {},
    decodeVerifyEmailToken: {},
    verifyEmail: {},
    initiateEmailUpdation: {
        success: {
            code: 200,
            message: 'Email sent successfully',
            trace: 'ProfileUserController/initiateEmailUpdation/success',
        },
    },
    decodeUpdateEmailToken: {
        success: {
            code: 200,
            message: 'Token is valid',
            trace: 'ProfileUserController/decodeUpdateEmailToken/success',
        },
    },
    updateEmail: {
        success: {
            code: 200,
            message: 'Email updated successfully',
            trace: 'ProfileUserController/updateEmail/success',
        },
    },
    changePassword: {
        validationFailure: {
            code: 409,
            context: 'Password validation failed.',
            trace: 'ProfileUserController/changePassword/validationFailure'
        },
        incorrectCredentials: {
            code: 401,
            message: 'Invalid password',
            context: 'Password mismatch for existing user during updating password',
            trace: 'ProfileUserController/changePassword/incorrectCredentials',
        },
        success: {
            code: 200,
            message: 'Password updated successfully',
            trace: 'ProfileUserController/changePassword/success',
        },
    },
};

export const getProfileUserControllerResponse = (user: UserDocument) => {
    return {
        changePassword: {
            invalidAuthProvider: {
                code: 401,
                message: `Invalid auth provider - ${user.auth.authProvider}`,
                context: `Password can only be changed for auth provider - email; not ${user.auth.authProvider}`,
                trace: 'ProfileUserController/changePassword/invalidAuthProvider',
            },
        },
    };
};