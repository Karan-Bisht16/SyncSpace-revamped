const message = 'Session is invalid. Please log in again.';

export const JwtLibResponses = {
    jwtDecode: {
        noToken: {
            code: 401,
            message,
            context: 'Token was valid JWT but no data could be decoded',
            trace: 'JwtLib/jwtDecode/noToken',
        },
    },
    parseJwtPayload: {
        invalidFormat: {
            code: 401,
            message,
            context: 'JWT payload is of type string',
            trace: 'JwtLib/parseJwtPayload/invalidFormat',
        },
        invalidToken: {
            code: 401,
            message,
            context: 'JWT payload is not structured correctly',
            trace: 'JwtLib/parseJwtPayload/invalidToken',
        },
    },
    validateToken: {
        noToken: {
            code: 409,
            message: 'No token provided',
            context: 'No token was provided',
            trace: 'JwtLib/validateToken/noToken',
        },
        tokenExpired: {
            code: 401,
            message: 'Link has expired',
            context: 'Token provided in email link has expired',
            trace: 'JwtLib/validateToken/tokenExpired',
        },
        invalidAction: {
            code: 401,
            message: 'Link action is invalid',
            context: 'Action within token is different from expected',
            trace: 'JwtLib/validateToken/tokenExpired',
        },
        noUser: {
            code: 409,
            message: 'Invalid link',
            context: 'Reset token decoded, but no corresponding user was found in DB',
            trace: 'JwtLib/validateToken/noUser',
        },
    },
};