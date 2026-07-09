import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import type { AuthResponse } from '../types/auth';

const API_BASE_URL = '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// A flag to prevent multiple refresh calls simultaneously
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach access token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!error.response) {
      return Promise.reject(error);
    }

    // Check if error is 401 and request has not been retried yet
    if (error.response.status === 401 && !originalRequest._retry) {
      // If it's a login or refresh request itself failing with 401, do not retry
      if (originalRequest.url?.includes('/api/auth/login') || originalRequest.url?.includes('/api/auth/refresh-token')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        isRefreshing = false;
        // Broadcast custom logout event so components (like AuthProvider) can handle redirect/state reset
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(error);
      }

      try {
        // Use clean axios instance to avoid interceptor loop during refresh
        const response = await axios.post<AuthResponse>(
          `${API_BASE_URL}/api/auth/refresh-token`,
          { refreshToken }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken, user } = response.data;

        localStorage.setItem('access_token', newAccessToken);
        localStorage.setItem('refresh_token', newRefreshToken);
        localStorage.setItem('user', JSON.stringify(user));

        // Dispatch storage event to sync other tabs or context
        window.dispatchEvent(new CustomEvent('auth:refresh', { detail: user }));

        processQueue(null, newAccessToken);
        isRefreshing = false;

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // Refresh failed (token expired or invalid) -> Clear storage and log out
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth:logout'));

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
