import { createContext } from 'react';
import type { UserResponse, LoginPayload, LoginResponse } from '../types';

export interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionError: string | null;
  login: (credentials: LoginPayload, remember?: boolean) => Promise<LoginResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
