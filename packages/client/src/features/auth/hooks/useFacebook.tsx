import { logMessage } from '../../../utils/log.util';

export const useFacebook = () => {
    const signUpWithFacebook = async () => {
        logMessage('Sign up with Facebook')
    };

    return {
        signUpWithFacebook,
    };
};