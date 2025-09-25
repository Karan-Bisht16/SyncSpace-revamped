export const AuthServiceResponses = {
    getRefreshTokenUsingAccessToken: {
        noRefreshTokenInDb: {
            code: 401,
            message: 'Session is invalid. Please log in again.',
            context: 'No refresh token corresponding to the uuid in access token was found in database',
            trace: 'AuthService/getRefreshTokenUsingAccessToken/noRefreshTokenInDb',
        },
    },
};