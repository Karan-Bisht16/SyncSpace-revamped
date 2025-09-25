// importing lib
import { API } from '../../../libs/axios.lib';
// importing types
import type { FetchInteractionsParams } from '../types';
// importing services
import { apiHandler } from '../../../services/api.service';

export const fetchInteractions = (
    params: FetchInteractionsParams
) => apiHandler(() => API.get('/interaction/fetchInteractions', {
    params,
    paramsSerializer: (p) => {
        const searchParams = new URLSearchParams();

        Object.entries(p).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach((v) => searchParams.append(key, String(v)));
            } else if (value !== undefined && value !== null) {
                searchParams.set(key, String(value));
            }
        });

        return searchParams.toString();
    },
}));