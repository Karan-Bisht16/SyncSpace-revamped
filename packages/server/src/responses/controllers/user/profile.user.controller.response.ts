// importing types
import type { UserDocument } from '@syncspace/shared';

export const ProfileUserControllerResponses = {
    initiateEmailVerification: {
        success: {
            code: 200,
            message: 'Email sent successfully for email verification',
            trace: 'ProfileUserController/initiateEmailVerification/success',
        },
    },
    verifyEmail: {
        success: {
            code: 200,
            message: 'Email verified successfully',
            trace: 'ProfileUserController/verifyEmail/success',
        },
    },
    initiateEmailUpdation: {
        success: {
            code: 200,
            message: 'Email sent successfully for email updation',
            trace: 'ProfileUserController/initiateEmailUpdation/success',
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