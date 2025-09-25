export const UserServiceResponses = {
    validateNewEmail: {
        validationFailure: {
            code: 409,
            context: 'Email validation failed.',
            trace: 'ProfileUserController/updateEmail/validationFailure'
        },
        emailNotAvailable: {
            code: 401,
            message: 'Email already in use',
            context: 'Provided email already exists in db',
            trace: 'ProfileUserController/updateEmail/emailNotAvailable',
        },
    },
};