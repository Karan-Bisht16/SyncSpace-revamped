export const AvailabilityAuthControllerResponses = {
    isEmailAvailable: {
        validationFailure: {
            code: 409,
            context: 'Email validation failed.',
            trace: 'AvailabilityAuthController/isEmailAvailable/validationFailure'
        },
        userExists: {
            code: 409,
            message: 'Email already in use.',
            context: 'User with given email already exists in DB.',
            trace: 'AvailabilityAuthController/isEmailAvailable/userExists',
        },
        success: {
            code: 200,
            message: 'Email is available',
            trace: 'AvailabilityAuthController/isEmailAvailable/success',
        },
    },
    isUsernameAvailable: {
        validationFailure: {
            code: 409,
            context: 'Username validation failed.',
            trace: 'AvailabilityAuthController/isUsernameAvailable/validationFailure'
        },
        userExists: {
            code: 409,
            message: 'Username already in use.',
            context: 'User with given username already exists in DB.',
            trace: 'AvailabilityAuthController/isUsernameAvailable/userExists',
        },
        success: {
            code: 200,
            message: 'Username is available',
            trace: 'AvailabilityAuthController/isUsernameAvailable/success',
        },
    },
};