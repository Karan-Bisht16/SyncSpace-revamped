// importing types
import type { UserDocument } from '@syncspace/shared';

const message = 'Session is invalid. Please log in again.';

export const LifecycleAuthControllerResponses = {
    register: {
        validationFailure: {
            code: 409,
            context: 'One or more registration fields failed validation',
            trace: 'LifecycleAuthController/register/validationFailure',
        },
        emailExists: {
            code: 409,
            message: 'Invalid email or password',
            context: 'Attempted registration with an existing email',
            trace: 'LifecycleAuthController/register/emailExists',
        },
        usernameExists: {
            code: 409,
            message: 'Invalid email or password',
            context: 'Attempted registration with an existing username',
            trace: 'LifecycleAuthController/register/usernameExists',
        },
    },
    login: {
        validationFailure: {
            code: 409,
            context: 'One or more registration fields failed validation',
            trace: 'LifecycleAuthController/login/validationFailure',
        },
        noUser: {
            code: 404,
            message: 'Invalid email or password',
            context: 'No user found with the given email during login attempt',
            trace: 'LifecycleAuthController/login/noUser',
        },
        incorrectCredentials: {
            code: 401,
            message: 'Invalid email or password',
            context: 'Password mismatch for existing user during login',
            trace: 'LifecycleAuthController/login/incorrectCredentials',
        },
    },
    registerViaGoogle: {},
    loginViaGoogle: {},
    refresh: {
        noRefreshToken: {
            code: 401,
            message,
            context: 'Refresh token was missing in request.cookies',
            trace: 'LifecycleAuthController/refresh/noRefreshToken',
        },
        noUser: {
            code: 409,
            message,
            context: 'Refresh token decoded, but user not found in DB',
            trace: 'LifecycleAuthController/refresh/noUser',
        },
        noRefreshTokenInDb: {
            code: 401,
            message,
            context: 'Refresh token was valid JWT but no corresponding token was found in database',
            trace: 'LifecycleAuthController/refresh/noRefreshTokenInDb',
        },
        invalidRefreshToken: {
            code: 401,
            message,
            context: 'Refresh token was valid JWT but did not match the stored hash',
            trace: 'LifecycleAuthController/refresh/invalidRefreshToken',
        },
        refreshTokenExpired: {
            code: 401,
            message,
            context: 'Refresh token expiresAt date in Db has surpassed current date. Force login',
            trace: 'LifecycleAuthController/refresh/refreshTokenExpired',
        },
        sessionExpired: {
            code: 403,
            message,
            context: 'Both access and refresh token validation failed via jwt verification',
            trace: 'LifecycleAuthController/refresh/sessionExpired',
        },
        success: {
            code: 200,
            message: 'New access token generated successfully',
            trace: 'LifecycleAuthController/refresh/success',
        },
    },
    reauth: {
        validationFailure: {
            code: 409,
            context: 'One or more registration fields failed validation',
            trace: 'LifecycleAuthController/reauth/validationFailure',
        },
        incorrectCredentials: {
            code: 401,
            message: 'Invalid password',
            context: 'Password mismatch for existing user during reauth',
            trace: 'LifecycleAuthController/reauth/incorrectCredentials',
        },
        success: {
            code: 200,
            message: 'Reauth success',
            trace: 'LifecycleAuthController/reauth/success',
        },
    },
    logout: {
        success: {
            code: 200,
            message: 'Logged out successfully.',
            trace: 'LifecycleAuthController/logout/success',
        },
    },
};

export const getLifecycleAuthControllerResponse = (user: UserDocument) => {
    return {
        register: {
            success: {
                code: 201,
                message: `Great to have you onboard! ${user.username}`,
                trace: 'LifecycleAuthController/register/success',
            },
        },
        login: {
            success: {
                code: 201,
                message: `Welcome back! ${user.username}`,
                trace: 'LifecycleAuthController/login/success',
            },
        },
    };
};