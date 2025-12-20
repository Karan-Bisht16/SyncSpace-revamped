// importing lib
import { API } from '../../../libs/axios.lib';
// importing types
import type { DecodeTokenParams } from '../types';
// importing services
import { apiHandler } from '../../../services/api.service';

export const decodeToken = (
    body: DecodeTokenParams,
) => apiHandler(() => API.post('/token/decodeToken', body));