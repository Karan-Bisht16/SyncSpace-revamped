import { logMessage } from '../../../utils/log.util';

export const useGoogle = () => {
    const signUpWithGoogle = async () => {
        logMessage('Sign up with Google')
    };

    return {
        signUpWithGoogle,
    };
};