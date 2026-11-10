import { api } from '../api/axiosInstance';
import { collectPages } from './academicService';
import type { PageResponse } from '../types/api';
import type { LeadDto, LeadRequest, LeadQuery, LeadState, StudentDto, StudentRequest, StudentQuery,
  StudentState, StudentDetail, EnrollmentDto, EnrollmentQuery, StudyState, BillingSnapshot, TuitionDelivery } from '../types/admissions';

export const leadService = {
 async history({id}:{id:number|null},signal?:AbortSignal):Promise<import('../types/care').LeadActivity[]>{return id===null?[]:(await api.get('/academic/leads/'+id+'/history',{signal})).data;},
 async assignees({branchId}:{branchId:number|null},signal?:AbortSignal):Promise<import('../types/care').LeadAssignee[]>{return branchId===null?[]:(await api.get('/academic/leads/assignees',{params:{branchId},signal})).data;},
 async interact(id:number,data:import('../types/care').LeadInteraction){return(await api.post<LeadDto>('/academic/leads/'+id+'/interactions',data)).data;},
 async assign(id:number,data:{accountId:number;reason:string;version:number}){return(await api.put<LeadDto>('/academic/leads/'+id+'/assignment',data)).data;},
  async list(params: LeadQuery, signal?: AbortSignal) {
    return (await api.get<PageResponse<LeadDto>>('/academic/leads', { params, signal })).data;
  },
  async detail({ id }: { id: number | null }, signal?: AbortSignal): Promise<LeadDto | null> {
    return id === null ? null : (await api.get<LeadDto>('/academic/leads/' + id, { signal })).data;
  },
  async save(id: number | null, data: LeadRequest) {
    return id === null ? (await api.post<LeadDto>('/academic/leads', data)).data
      : (await api.put<LeadDto>('/academic/leads/' + id, data)).data;
  },
  async status(id: number, status: Exclude<LeadState, 'CONVERTED'>, note:string,version:number) {
    return (await api.patch<LeadDto>('/academic/leads/' + id + '/status', { status, note,version })).data;
  },
  async convert(id: number,version:number) { return (await api.post<LeadDto>('/academic/leads/' + id + '/convert',{version})).data; },
};
export const studentService = {
 async history({id}:{id:number|null},signal?:AbortSignal):Promise<import('../types/lifecycle').LearningEvent[]>{return id===null?[]:(await api.get('/academic/students/'+id+'/history',{signal})).data;},
  async list(params: StudentQuery, signal?: AbortSignal) {
    return (await api.get<PageResponse<StudentDto>>('/academic/students', { params, signal })).data;
  },
  async all(params: { branchId?: number }, signal?: AbortSignal) {
    return collectPages((page) => studentService.list({ ...params, page, size: 200 }, signal), signal);
  },
  async detail({ id }: { id: number | null }, signal?: AbortSignal): Promise<StudentDetail | null> {
    return id === null ? null : (await api.get<StudentDetail>('/academic/students/' + id, { signal })).data;
  },
  async save(id: number | null, data: StudentRequest) {
    return id === null ? (await api.post<StudentDto>('/academic/students', data)).data
      : (await api.put<StudentDto>('/academic/students/' + id, data)).data;
  },
  async status(id: number, status: StudentState, reason:string,version:number) {
    return (await api.patch<StudentDto>('/academic/students/' + id + '/status', { status,reason,version })).data;
  },
  async remove(id: number) { await api.delete('/academic/students/' + id); },
};
export const enrollmentService = {
 async history({id}:{id:number|null},signal?:AbortSignal):Promise<import('../types/lifecycle').EnrollmentHistory|null>{return id===null?null:(await api.get('/academic/enrollments/'+id+'/history',{signal})).data;},
  async forStudent({ studentId }: { studentId: number | null }, signal?: AbortSignal): Promise<EnrollmentDto[]> {
    return studentId === null ? [] : collectPages((page) => enrollmentService.list({ studentId, page, size: 200 }, signal), signal);
  },
  async list(params: EnrollmentQuery, signal?: AbortSignal) {
    return (await api.get<PageResponse<EnrollmentDto>>('/academic/enrollments', { params, signal })).data;
  },
  async detail({ id }: { id: number | null }, signal?: AbortSignal): Promise<EnrollmentDto | null> {
    return id === null ? null : (await api.get<EnrollmentDto>('/academic/enrollments/' + id, { signal })).data;
  },
  async billing({ id }: { id: number | null }, signal?: AbortSignal): Promise<BillingSnapshot | null> {
    return id === null ? null : (await api.get<BillingSnapshot>('/academic/enrollments/' + id + '/billing', { signal })).data;
  },
  async create(data: { studentId: number; classId: number; approvalId?:number }) {
    return (await api.post<EnrollmentDto>('/academic/enrollments', data)).data;
  },
  async status(id: number, studyStatus: Exclude<StudyState, 'TRANSFERRED'>,reason:string,version:number,expectedReturnDate?:string,approvalId?:number) {
    return (await api.patch<EnrollmentDto>('/academic/enrollments/' + id + '/status', { studyStatus,reason,version,expectedReturnDate,approvalId })).data;
  },
  async transfer(id: number, newClassId: number,reason:string,version:number,approvalId?:number) {
    return (await api.post<EnrollmentDto>('/academic/enrollments/' + id + '/transfer', { newClassId,reason,version,approvalId })).data;
  },
  async retry(id: number) {
    return (await api.post<TuitionDelivery>('/academic/enrollments/' + id + '/tuition/retry')).data;
  },
};
