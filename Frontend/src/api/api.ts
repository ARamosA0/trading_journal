import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { AuthResponse } from "./auth";

let accessToken: string | null = null;
let refreshPromise: Promise<AuthResponse> | null = null;

export function setAccessToken(token: string | null) {
    accessToken = token;
}

export function getAccessToken() {
    return accessToken;
}

export const auth = axios.create({
    baseURL: import.meta.env.VITE_AUTH_URL,
    headers: {
        "Accept-Language": navigator.language
    },
    withCredentials: true
});

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json"
    },
    withCredentials: true
});

export function refreshSession(): Promise<AuthResponse> {
    if (!refreshPromise) {
        refreshPromise = auth.post<AuthResponse>("/refresh")
            .then(({ data }) => {
                setAccessToken(data.token);
                return data;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
}

api.interceptors.request.use((config) => {
    const token = getAccessToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as
            | (InternalAxiosRequestConfig & { _retry?: boolean })
            | undefined;

        if (
            error.response?.status !== 401 ||
            !originalRequest ||
            originalRequest._retry
        ) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            const session = await refreshSession();
            originalRequest.headers.Authorization = `Bearer ${session.token}`;
            return api(originalRequest);
        } catch (refreshError) {
            setAccessToken(null);
            window.dispatchEvent(new Event("auth:expired"));
            return Promise.reject(refreshError);
        }
    }
);
