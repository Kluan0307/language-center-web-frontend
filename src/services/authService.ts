import { api } from '../api/axiosInstance';
import type { LoginPayload, LoginResponse, UserResponse, CreateUserRequest, Role, TeacherOption } from '../types/auth';
import type { PageQuery, PageResponse } from '../types/api';

export interface AccountQuery extends PageQuery { branchId?: number; role?: Role }
export interface BranchAssignment {branchId:number;status:boolean;isPrimary:boolean;assignedAt:string;assignedBy:number|null;revokedAt:string|null}
export const authService = {
  async changePassword(data:import('../types/auth').ChangePasswordRequest){await api.post('/auth/me/password',data);},
  async logoutAll(){await api.post('/auth/me/logout-all');},
  async resetPassword(id:number,data:import('../types/auth').ResetPasswordRequest){await api.post('/auth/accounts/'+id+'/reset-password',data);},
  async updateProfile(data:import('../types/auth').ProfileUpdateRequest){return(await api.patch<UserResponse>('/auth/me/profile',data)).data;},
  async branchAssignmentHistory(id:number,signal?:AbortSignal){return(await api.get<{id:number;branchId:number;action:string;occurredAt:string;performedBy:number|null}[]>('/auth/accounts/'+id+'/branches/history',{signal})).data;},
  async branchAssignments(id:number,signal?:AbortSignal){return(await api.get<BranchAssignment[]>('/auth/accounts/'+id+'/branches',{signal})).data;},
  async assignBranches(id:number,data:{branchIds:number[];primaryBranchId:number|null|undefined}){return(await api.put<UserResponse>('/auth/accounts/'+id+'/branches',data)).data;},
  async login(credentials: LoginPayload) {
    return (await api.post<LoginResponse>('/auth/login', credentials)).data;
  },
  async getMe(signal?: AbortSignal, token?: string) {
    return (await api.get<UserResponse>('/auth/me', {
      signal, headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })).data;
  },
  async getAccounts(params: AccountQuery = { page: 0, size: 20 }, signal?: AbortSignal) {
    return (await api.get<PageResponse<UserResponse>>('/auth/accounts', { params, signal })).data;
  },
  async createAccount(data: CreateUserRequest) {
    return (await api.post<UserResponse>('/auth/accounts', data)).data;
  },
  async toggleAccountStatus(id: number) {
    return (await api.patch<UserResponse>(`/auth/accounts/${id}/toggle-status`)).data;
  },
  async teachers(params: { branchId?: number }, signal?: AbortSignal) {
    return (await api.get<TeacherOption[]>('/auth/teachers', { params, signal })).data;
  },
};

