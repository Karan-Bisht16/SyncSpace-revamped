export const AccountUserControllerResponses = {
    updateSetting: {
        validationFailure: {
            code: 409,
            context: 'One or more registration fields failed validation',
            trace: 'AccountUserController/updateSetting/validationFailure',
        },
        success: {
            code: 200,
            message: 'Setting updated successfully.',
            trace: 'AccountUserController/updateSetting/success',
        },
    },
    resetSetting: {
        success: {
            code: 200,
            message: 'Setting updated to default.',
            trace: 'AccountUserController/resetSetting/success',
        },
    },
    deleteAccount: {
        success: {
            code: 200,
            message: 'Profile deleted successfully.',
            trace: 'AccountUserController/deleteAccount/success',
        }
    },
};