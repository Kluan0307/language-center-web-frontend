export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | 'TEACHER';
export interface LoginPayload { username: string; password: string }
export interface LoginResponse {
  mustChangePassword?: boolean;
  branchIds?: number[];
  token: string;
  accountId: number;
  profileId: number;
  branchId: number | null;
  username: string;
  fullName: string;
  role: Role;
}
export interface UserResponse {
  mustChangePassword?: boolean;
  passwordChangedAt?: string | null;
  branchIds?: number[];
  primaryBranchId?: number | null;
  accountId: number;
  profileId: number | null;
  branchId: number | null;
  fullName: string | null;
  username: string;
  email: string | null;
  phone: string | null;
  role: Role;
  status: boolean;
  createdAt: string | null;
  lastLogin: string | null;
  hireDate: string | null;
  workStatus: string | null;
  position: string | null;
  specialization: string | null;
  qualification: string | null;
  experience: string | null;
  certificate: string | null;
}
export interface CreateUserRequest {
  fullName: string;
  username: string;
  password: string;
  email?: string;
  phone?: string;
  role: 'ADMIN' | 'STAFF' | 'TEACHER';
  branchId?: number;
  hireDate?: string;
  position?: string;
  specialization?: string;
  qualification?: string;
  experience?: string;
  certificate?: string;
  workStatus?: 'ACTIVE' | 'INACTIVE';
}
export interface TeacherOption {
  branchIds?: number[];
  profileId: number;
  accountId: number;
  fullName: string;
  branchId: number;
}

export interface ChangePasswordRequest {currentPassword:string;newPassword:string;confirmPassword:string}
export interface ResetPasswordRequest {temporaryPassword:string;confirmPassword:string;reason:string}
export interface ProfileUpdateRequest {email:string|null;phone:string|null}
