export const RequireReauthMiddlewareResponses = {
    requireReauth: {
        authExpired: {
            code: 403,
            message: 'Please enter your password to continue.',
            context: 'Re-authentication required',
            trace: 'RequireReauthMiddleware/reauth/authExpired',
        },
    },
};