import { api } from '../api/axiosInstance';
import type { 
    LoginPayload, 
    LoginResponse, 
    UserResponse, 
    CreateUserRequest 
} from '../types';

export const authService = {
    login: async (credentials: LoginPayload): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/auth/login', credentials);
        return response.data;
    },

    getMe: async (): Promise<UserResponse> => {
        const response = await api.get<UserResponse>('/auth/me');
        return response.data;
    },

    getAccounts: async (): Promise<UserResponse[]> => {
        const response = await api.get<UserResponse[]>('/auth/accounts');
        return response.data;
    },

    createAccount: async (data: CreateUserRequest): Promise<UserResponse> => {
        const response = await api.post<UserResponse>('/auth/accounts', data);
        return response.data;
    },

    toggleAccountStatus: async (id: number): Promise<UserResponse> => {
        const response = await api.patch<UserResponse>(`/auth/accounts/${id}/toggle-status`);
        return response.data;
    },
};