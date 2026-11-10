import { api } from '../api/axiosInstance';
import type { Branch, BranchRequest } from '../types/branch';
import type { PageQuery, PageResponse } from '../types/api';

export const branchService = {
  async list(params: PageQuery & { branchId?: number }, signal?: AbortSignal) {
    return (await api.get<PageResponse<Branch>>('/academic/branches', { params, signal })).data;
  },
  async all(_params: Record<string, never>, signal?: AbortSignal): Promise<Branch[]> {
    const branches: Branch[] = [];
    let page = 0;
    while (true) {
      const result = await branchService.list({ page, size: 200 }, signal);
      branches.push(...result.content);
      if (page + 1 >= result.totalPages) return branches;
      page++;
    }
  },
  async get(id: number, signal?: AbortSignal) {
    return (await api.get<Branch>(`/academic/branches/${id}`, { signal })).data;
  },
  async create(data: BranchRequest) {
    return (await api.post<Branch>('/academic/branches', data)).data;
  },
  async update(id: number, data: BranchRequest) {
    return (await api.put<Branch>(`/academic/branches/${id}`, data)).data;
  },
  async toggle(id: number) {
    return (await api.patch<Branch>(`/academic/branches/${id}/toggle-status`)).data;
  },
};
