import { api } from '../api/axiosInstance';
export type DashboardScope = {
    branchId?: number;
    allAssigned?: boolean;
};
export type AcademicQueue = {
    supportActive: number;
    leadsNew: number;
    businessDate: string;
    observedAt: string;
};
export type FinanceQueue = {
    tuitionOverdue: number;
    ordersReview: number;
    businessDate: string;
    observedAt: string;
};
export const dashboardService = { async academic(params: DashboardScope, signal?: AbortSignal) { return (await api.get<AcademicQueue>('/academic/stats/work-queue', { params, signal })).data; }, async finance(params: DashboardScope, signal?: AbortSignal) { return (await api.get<FinanceQueue>('/finance/stats/work-queue', { params, signal })).data; } };
