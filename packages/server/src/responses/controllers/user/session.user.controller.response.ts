export const SessionUserControllerResponses = {
    fetchSession: {
        success: {
            code: 200,
            message: 'User session restored',
            trace: 'SessionUserController/fetchSession/success',
        }
    },
    determineReauth: {
        success: {
            code: 200,
            message: 'Within reauth buffer period.',
            trace: 'SessionUserController/determineReauth/success',
        },
    },
};