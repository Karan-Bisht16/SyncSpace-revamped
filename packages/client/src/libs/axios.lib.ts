import axios from 'axios';
import { checkError } from '@syncspace/shared';
// importing app
import { store } from '../app/store';
// importing features
import { setAccessToken, logUserOut } from '../features/user';

axios.defaults.withCredentials = true;

export const API = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
});

// attach token to outgoing requests
API.interceptors.request.use(
    (config) => {
        const token = store.getState().user.accessToken;
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// response interceptor: handle expired access token, queue concurrent requests
let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];

const subscribeRefresh = (callback: (token: string | null) => void) => {
    refreshSubscribers.push(callback);
};

const onRefreshed = (token: string | null) => {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];
};

API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error?.config;
        if (!originalRequest) return Promise.reject(error);

        if (originalRequest.url?.includes('/auth/refresh')) {
            store.dispatch(logUserOut());
            return Promise.reject(error);
        }

        if (!checkError(error, 403, 'AuthMiddleware/auth/invalidAccessToken')) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                subscribeRefresh((token) => {
                    if (token) {
                        originalRequest.headers = originalRequest.headers || {};
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(API(originalRequest));
                    } else {
                        reject(error);
                    }
                });
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const refreshResponse = await API.post('/auth/refresh');
            const newToken = refreshResponse?.data?.data?.accessToken;
            if (!newToken) {
                throw new Error('Refresh did not return accessToken');
            }

            store.dispatch(setAccessToken(newToken));

            onRefreshed(newToken);
            isRefreshing = false;

            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return API(originalRequest);
        } catch (refreshError) {
            isRefreshing = false;
            onRefreshed(null);
            store.dispatch(logUserOut());
            return Promise.reject(refreshError);
        }
    }
);