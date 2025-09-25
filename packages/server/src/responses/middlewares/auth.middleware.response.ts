const message = 'Session is invalid. Please log in again.';

export const AuthMiddlewareResponses = {
    auth: {
        noAccessToken: {
            code: 401,
            message,
            context: 'Access token missing from headers',
            trace: 'AuthMiddleware/auth/noAccessToken',
        },
        noUser: {
            code: 409,
            message,
            context: 'Access token decoded successfully, but no user found in DB',
            trace: 'AuthMiddleware/auth/noUser',
        },
        invalidAccessToken: {
            code: 403,
            message,
            context: 'Invalid access token in headers',
            trace: 'AuthMiddleware/auth/invalidAccessToken',
        },
    },
};