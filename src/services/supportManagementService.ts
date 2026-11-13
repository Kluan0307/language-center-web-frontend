import { api } from '../api/axiosInstance';
import type { PageResponse } from '../types/api';
export const supportStatuses = { OPEN: 'Mới', IN_PROGRESS: 'Đang xử lý', RESOLVED: 'Đã giải quyết', CLOSED: 'Đã đóng' };
export const supportCategories = { PROFILE: 'Hồ sơ', GRADE: 'Điểm số', ATTENDANCE: 'Điểm danh', PAYMENT: 'Học phí', LEAVE: 'Xin nghỉ', MAKEUP: 'Học bù', OTHER: 'Khác' };
export type SupportStatus = keyof typeof supportStatuses;
export type SupportRow = {
    id: number;
    studentId: number;
    studentName: string;
    branchId: number;
    subject: string;
    category: keyof typeof supportCategories;
    status: SupportStatus;
    version: number;
    createdAt: string;
    updatedAt: string;
    resourceType: string | null;
    resourceId: number | null;
    resourceKey: string | null;
};
export type SupportDetail = {
    request: SupportRow;
    messages: {
        id: number;
        sender: string;
        message: string;
        internalNote: boolean;
        actorName: string;
        createdAt: string;
    }[];
    statusHistory: {
        id: number;
        previousStatus: SupportStatus | null;
        status: SupportStatus;
        actorName: string;
        reason: string;
        createdAt: string;
    }[];
};
export type SupportQuery = {allAssigned?:boolean;
    page: number;
    size: number;
    branchId?: number;
    studentId?: number;
    status?: SupportStatus;
    category?: string;
    keyword?: string;
    queue?: 'ACTIVE';
};
export const supportManagementService = { async list(params: SupportQuery, signal?: AbortSignal) { return (await api.get<PageResponse<SupportRow>>('/academic/support-requests', { params, signal })).data; }, async detail({ id }: {
        id: number | null;
    }, signal?: AbortSignal) { return id ? (await api.get<SupportDetail>('/academic/support-requests/' + id, { signal })).data : null; } };
