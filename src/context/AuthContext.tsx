import { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authService } from '../services/authService';
import type { UserResponse, LoginPayload, LoginResponse } from '../types';

interface AuthContextType {
    user: UserResponse | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginPayload) => Promise<LoginResponse>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserResponse | null>(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        const currentToken = localStorage.getItem('token');
        if (!currentToken) {
            setUser(null);
            setToken(null);
            setIsLoading(false);
            return;
        }

        try {
            const userData = await authService.getMe();
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
        } catch {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setToken(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const login = async (credentials: LoginPayload): Promise<LoginResponse> => {
        const data = await authService.login(credentials);
        localStorage.setItem('token', data.token);
        setToken(data.token);

        try {
            const fullUserData = await authService.getMe();
            setUser(fullUserData);
            localStorage.setItem('user', JSON.stringify(fullUserData));
        } catch {
            const basicUser: UserResponse = {
                id: 0,
                username: data.username,
                fullName: data.fullName,
                email: null,
                phone: null,
                role: data.role,
                status: true,
                createdAt: new Date().toISOString(),
            };
            setUser(basicUser);
            localStorage.setItem('user', JSON.stringify(basicUser));
        }

        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token && !!user,
                isLoading,
                login,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
