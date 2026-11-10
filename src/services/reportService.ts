import {api} from '../api/axiosInstance';
import type {AcademicReport,RevenueReport,RevenueQuery} from '../types/reports';
export const reportService={
 async academic(params:{branchId?:number;groupByBranch?:boolean;allAssigned?:boolean},signal?:AbortSignal){return(await api.get<AcademicReport>('/academic/stats/overview',{params,signal})).data;},
 async revenue(params:RevenueQuery,signal?:AbortSignal){return(await api.get<RevenueReport>('/finance/stats/overview',{params,signal})).data;},
};
