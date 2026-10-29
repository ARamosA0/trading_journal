import { auth } from "./api";
import axios from "axios";

export interface ApiError {
    code: string;
    message: string;
    type?: "ERROR" | "SUCCESS";
}

export interface AuthResponse {
    token: string;
    id: string;
    email: string;
    userName: string;
    rol: string;
    code?: string;
    message?: string;
    type?: "ERROR" | "SUCCESS";
}

export interface LogonRequest {
    email: string;
    password: string;
    rememberMe: boolean;
}

export interface RegisterRequest {
    userName: string;
    email: string;
    password: string;
}

export interface GoogleLoginRequest {
    credential: string;
    rememberMe: boolean;
}

export async function loginAuth(data: LogonRequest): Promise<AuthResponse> {
    const response = await auth.post<AuthResponse>("/login", data);
    return response.data;
}

export async function register(data: RegisterRequest) {
    const response = await auth.post("/register", data);
    return response.data;
}

export async function googleAuth(data: GoogleLoginRequest): Promise<AuthResponse> {
    const response = await auth.post<AuthResponse>("/google", data);
    return response.data;
}

export async function requestPasswordReset(email: string): Promise<ApiError> {
    const response = await auth.post<ApiError>("/password/forgot", { email });
    return response.data;
}

export async function resetPassword(token: string, password: string): Promise<ApiError> {
    const response = await auth.post<ApiError>("/password/reset", { token, password });
    return response.data;
}

export async function logOut() {
    const response = await auth.post("/logout");
    return response.data
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiError>(error) && error.response?.data?.message) {
        return error.response.data.message;
    }

    return fallback;
}
