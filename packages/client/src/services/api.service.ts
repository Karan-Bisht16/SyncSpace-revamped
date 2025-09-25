import { ApiError, ApiResponse, checkError, handleAxiosError } from '@syncspace/shared';
// importing app
import { store } from '../app/store';
// importing features
import { logUserOut, promptReauth } from '../features/user';
// importing types
import type { AxiosResponse } from 'axios';
import type { RetryMeta } from '../features/user';
import type { ApiCall } from '../types';
// importing utils
import { logError } from '../utils/log.util';

export const apiHandler = async (
    apiCall: ApiCall,
    retryMeta?: RetryMeta,
): Promise<ApiResponse | ApiError> => {
    try {
        const res: AxiosResponse<ApiResponse> = await apiCall();
        return new ApiResponse(res.data);
    } catch (error: any) {
        if (checkError(error, 403, 'RequireReauthMiddleware/reauth/authExpired') && retryMeta) {
            store.dispatch(promptReauth(retryMeta));
        }
        if (checkError(error, 403, 'AuthMiddleware/auth/sessionExpired')) {
            if (store.getState().user.isLoggedIn) {
                store.dispatch(logUserOut());
            }
        }

        const normalizedError = handleAxiosError(error);
        logError(normalizedError);

        return normalizedError;
    }
};