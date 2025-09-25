export const RecoveryAuthControllerResponses = {
    forgotPassword: {
        validationFailure: {
            code: 409,
            context: 'Email validation failed.',
            trace: 'RecoveryAuthController/forgotPassword/validationFailure'
        },
        success: {
            code: 200,
            message: 'Email to reset your password has been sent',
            trace: 'RecoveryAuthController/forgotPassword/success',
        },
    },
    decodeResetPasswordToken: {
        success: {
            code: 200,
            message: 'Token is valid',
            trace: 'RecoveryAuthController/decodeResetPasswordToken/success',
        },
    },
    resetPassword: {
        success: {
            code: 200,
            message: 'Your password has been reset',
            trace: 'RecoveryAuthController/resetPassword/success',
        },
    },
};