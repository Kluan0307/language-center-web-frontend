export type Role = 'ADMIN' | 'STAFF' | 'TEACHER';

export interface LoginPayload {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    username: string;
    fullName: string;
    role: Role;
}

export interface UserResponse {
    id: number;
    fullName: string;
    username: string;
    email: string | null;
    phone: string | null;
    role: Role;
    status: boolean;
    createdAt: string;
}

export interface CreateUserRequest {
    fullName: string;
    username: string;
    password: string;
    email?: string;
    phone?: string;
    role: 'STAFF' | 'TEACHER';
}
