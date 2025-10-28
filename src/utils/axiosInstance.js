import axios from 'axios';
import { getCookie, setCookie, clearAuthTokens } from './cookieUtil';

const redirectToLogin = () => {
    console.log('[redirectToLogin] Clearing cookies and redirecting to login');
    clearAuthTokens(); // Use the proper cookie clearing function

    // Full page reload — no SPA history
    window.location.href = '/login';
};

const baseURL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8800/api';

const axiosInstance = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = getCookie('_at');
        console.log('[Request interceptor] Access token:', accessToken ? '[present]' : '[not present]');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        console.log(accessToken);

        return config;
    },
    (error) => {
        console.log('[Request interceptor] Error:', error);
        return Promise.reject(error);
    }
);

let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(newToken) {
    console.log('[onRefreshed] Notifying subscribers with new token');
    refreshSubscribers.forEach((callback) => callback(newToken));
    refreshSubscribers = [];
}

function addRefreshSubscriber(callback) {
    console.log('[addRefreshSubscriber] Adding subscriber');
    refreshSubscribers.push(callback);
}

axiosInstance.interceptors.response.use(
    (response) => {
        console.log('[Response interceptor] Success:', response.status, response.config.url);
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        console.log('[Response interceptor] Error:', error.response?.status, originalRequest?.url);

        // Handle authentication errors (401) and forbidden errors (403) that might indicate auth issues
        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
            console.log('[Response interceptor] 401/403 Unauthorized/Forbidden detected - Status:', error.response?.status);

            // Check if user has any authentication tokens at all
            const accessToken = getCookie('_at');
            const refreshToken = getCookie('_rt');

            if (!accessToken && !refreshToken) {
                console.log('[Response interceptor] No authentication tokens found, redirecting to login');
                redirectToLogin();
                return Promise.reject(error);
            }

            // For 403 errors, we might want to be more aggressive about redirecting
            // since 403 often means the user doesn't have permission for the resource
            if (error.response?.status === 403) {
                console.log('[Response interceptor] 403 Forbidden - User may not have permission for this resource');
                // Still try token refresh first, but log the 403 specifically
            }

            if (isRefreshing) {
                console.log('[Response interceptor] Refresh already in progress, queuing request');
                return new Promise((resolve) => {
                    addRefreshSubscriber((newToken) => {
                        console.log('[Response interceptor] Retrying original request with new token');
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        resolve(axiosInstance(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;
            console.log('[Response interceptor] Starting token refresh');

            console.log('[Response interceptor] Refresh token:', refreshToken ? '[present]' : '[not present]');

            if (!refreshToken) {
                console.log('[Response interceptor] No refresh token found, redirecting to login');
                redirectToLogin();
                return Promise.reject(error);
            }

            // Check if this is a refresh token request that failed - avoid infinite loop
            if (originalRequest.url?.includes('/auth/refresh-token')) {
                console.log('[Response interceptor] Refresh token request failed, redirecting to login');
                redirectToLogin();
                return Promise.reject(error);
            }

            try {
                console.log('[Response interceptor] Attempting token refresh...');
                const { data } = await axios.post(
                    '/auth/refresh-token',
                    { refreshToken },
                    {
                        baseURL: axiosInstance.defaults.baseURL,
                        timeout: 10000 // 10 second timeout
                    }
                );

                console.log('[Response interceptor] Refresh response:', data);

                // Check if refresh was successful
                if (!data.success) {
                    console.log('[Response interceptor] Refresh failed - server returned success: false');
                    redirectToLogin();
                    return Promise.reject(error);
                }

                const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data;

                if (!newAccessToken || !newRefreshToken) {
                    console.log('[Response interceptor] Refresh response missing tokens, redirecting to login');
                    redirectToLogin();
                    return Promise.reject(error);
                }

                console.log('[Response interceptor] Refresh successful, setting new tokens');
                setCookie('_at', newAccessToken, { maxAge: 604800 }); // 7 days
                setCookie('_rt', newRefreshToken, { maxAge: 2592000 }); // 30 days

                axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
                onRefreshed(newAccessToken);
                isRefreshing = false;

                console.log('[Response interceptor] Retrying original request with new access token');
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                console.log('[Response interceptor] Token refresh failed:', refreshError.response?.status, refreshError.message);

                // Handle different types of refresh errors
                if (refreshError.response?.status === 401) {
                    console.log('[Response interceptor] Refresh token invalid/expired (401), redirecting to login');
                } else if (refreshError.response?.status === 403) {
                    console.log('[Response interceptor] Refresh token forbidden (403), redirecting to login');
                } else if (refreshError.response?.status >= 400) {
                    console.log('[Response interceptor] Refresh endpoint returned error, redirecting to login');
                } else if (refreshError.code === 'ECONNABORTED' || refreshError.message?.includes('timeout')) {
                    console.log('[Response interceptor] Refresh request timed out, redirecting to login');
                } else if (!refreshError.response) {
                    console.log('[Response interceptor] Network error during refresh, redirecting to login');
                } else {
                    console.log('[Response interceptor] Unknown error during refresh, redirecting to login');
                }

                redirectToLogin();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
