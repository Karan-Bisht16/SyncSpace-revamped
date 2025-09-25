// importing lib
import { API } from '../../../libs/axios.lib';
// importing types
import type { ForgotPasswordParams, IsEmailAvailableParams, IsUsernameAvailableParams, DecodeResetPasswordTokenParams } from '../types';
// importing services
import { apiHandler } from '../../../services/api.service';

export const isEmailAvailable = (
    params: IsEmailAvailableParams
) => apiHandler(() => API.get('/auth/isEmailAvailable', { params }));

export const isUsernameAvailable = (
    params: IsUsernameAvailableParams
) => apiHandler(() => API.get('/auth/isUsernameAvailable', { params }));

export const forgotPassword = (
    body: ForgotPasswordParams,
) => apiHandler(() => API.post('/auth/forgotPassword', body));

export const decodeResetPasswordToken = (
    body: DecodeResetPasswordTokenParams,
) => apiHandler(() => API.post('/auth/decodeResetPasswordToken', body));