// importing lib
import { API } from '../../../libs/axios.lib';
// importing types
import type {
    LoginParams,
    LoginViaFacebookParams,
    LoginViaGoogleParams,
    ReauthParams,
    RegisterParams,
    RegisterViaFacebookParams,
    RegisterViaGoogleParams,
    ResetPasswordParams,
    UpdateEmailParams,
    UpdateSettingParams,
} from '../types';
// importing services
import { apiHandler } from '../../../services/api.service';

// auth services
export const register = (
    body: RegisterParams,
) => apiHandler(() => API.post('/auth/register', body, {
    headers: { 'Content-Type': 'multipart/form-data' }
}));

export const login = (
    body: LoginParams,
) => apiHandler(() => API.post('/auth/login', body));

export const registerViaGoogle = (
    body: RegisterViaGoogleParams,
) => apiHandler(() => API.post('/auth/registerViaGoogle', body));

export const loginViaGoogle = (
    body: LoginViaGoogleParams,
) => apiHandler(() => API.post('/auth/registerViaGoogle', body));

export const registerViaFacebook = (
    body: RegisterViaFacebookParams,
) => apiHandler(() => API.post('/auth/registerViaGoogle', body));

export const loginViaFacebook = (
    body: LoginViaFacebookParams,
) => apiHandler(() => API.post('/auth/registerViaGoogle', body));

export const resetPassword = (
    body: ResetPasswordParams,
) => apiHandler(() => API.patch('/auth/resetPassword', body));

export const reauth = (
    body: ReauthParams,
) => apiHandler(() => API.post('/auth/reauth', body));

export const logout = (
) => apiHandler(() => API.delete('/auth/logout'));

// profile services

export const updateEmail = (
    body: UpdateEmailParams,
) => apiHandler(() => API.patch('/user/updateEmail', body), {
    reauthService: 'updateEmail',
});

export const verifyEmail = (
) => apiHandler(() => API.patch('/user/verifyEmail'));

// account services
export const updateSetting = (
    body: UpdateSettingParams,
) => apiHandler(() => API.patch('/user/updateSetting', body));

export const resetSetting = (
) => apiHandler(() => API.patch('/user/resetSetting'));

export const deleteAccount = (
) => apiHandler(() => API.delete('/user/deleteAccount'), {
    reauthService: 'deleteAccount',
});

// session services
export const fetchSession = (
) => apiHandler(() => API.get('/user/fetchSession'));

export const determineReauth = (
) => apiHandler(() => API.get('/user/determineReauth'), {
    reauthService: 'determineReauth',
});