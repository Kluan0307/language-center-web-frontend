import { api } from '../api/axiosInstance';
import type { PageResponse } from '../types/api';
import type { TuitionDto, TuitionQuery, TuitionAdjustment, PaymentDto, PaymentQuery, PaymentRequest } from '../types/finance';
export const tuitionService = {
 async history({id}:{id:number|null},signal?:AbortSignal):Promise<import('../types/financeLedger').FinanceHistory|null>{return id===null?null:(await api.get('/finance/tuitions/'+id+'/history',{signal})).data;},
 async reconciliation(params:{page:number;size:number;branchId?:number;allAssigned?:boolean},signal?:AbortSignal){return(await api.get<PageResponse<import('../types/financeLedger').Reconciliation>>('/finance/stats/reconciliation',{params,signal})).data;},
 async list(params: TuitionQuery, signal?: AbortSignal) { return (await api.get<PageResponse<TuitionDto>>('/finance/tuitions', { params, signal })).data; },
 async detail({ id }: { id: number | null }, signal?: AbortSignal): Promise<TuitionDto | null> {
  return id === null ? null : (await api.get<TuitionDto>('/finance/tuitions/'+id, { signal })).data;
 },
 async adjust(id: number, data: TuitionAdjustment) { return (await api.put<TuitionDto>('/finance/tuitions/'+id, data)).data; },
};
export const paymentService = {
 async corrections({id}:{id:number|null},signal?:AbortSignal):Promise<import('../types/financeLedger').Correction[]>{return id===null?[]:(await api.get('/finance/payments/'+id+'/corrections',{signal})).data;},
 async correct(id:number,data:import('../types/financeLedger').CorrectionRequest){return(await api.post<import('../types/financeLedger').Correction>('/finance/payments/'+id+'/corrections',data)).data;},
 async list(params: PaymentQuery, signal?: AbortSignal) { return (await api.get<PageResponse<PaymentDto>>('/finance/payments', { params, signal })).data; },
 async detail({ id }: { id: number | null }, signal?: AbortSignal): Promise<PaymentDto | null> {
  return id === null ? null : (await api.get<PaymentDto>('/finance/payments/'+id, { signal })).data;
 },
 async create(data: PaymentRequest) { return (await api.post<PaymentDto>('/finance/payments', data)).data; },
};
