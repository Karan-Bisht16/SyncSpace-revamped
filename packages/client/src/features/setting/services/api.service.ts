// importing lib
import { API } from '../../../libs/axios.lib';
// importing types
import type { UpdatePasswordParams } from '../types';
// importing services
import { apiHandler } from '../../../services/api.service';

export const initiateEmailVerification = (
    callbackId?: string,
) => apiHandler(() => API.post('/user/initiateEmailVerification'),{
    reauthService: 'changePassword',
    callbackId,
});

export const changePassword = (
    body: UpdatePasswordParams,
    callbackId?: string,
) => apiHandler(() => API.patch('/user/changePassword', body), {
    reauthService: 'changePassword',
    args: body,
    callbackId,
});