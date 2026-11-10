import {api} from '../api/axiosInstance';
import {collectPages} from './academicService';
import type {PageResponse} from '../types/api';
import type {AttendanceSheet,AttendanceHistory,AttendanceSummary,AttendanceRow,ExamDto,ExamRequest,ExamQuery,GradeDto,GradeChange,GradeRequest,EvaluationReport,DocumentDto,DocumentQuery,DocumentStatus} from '../types/teaching';
export const attendanceService={
 async sheet({classId,date,sessionId}:{classId:number|null;date?:string;sessionId?:number},signal?:AbortSignal):Promise<AttendanceSheet|null>{return classId===null&&!sessionId?null:(await api.get<AttendanceSheet>('/academic/attendances/sheet',{params:{classId:classId??undefined,date,sessionId},signal})).data;},
 async save(classId:number,sessionDate:string,records:Pick<AttendanceRow,'enrollmentId'|'status'|'hasPermission'>[],options?:{sessionId:number;version:number;reason?:string}){return(await api.post<AttendanceSheet>('/academic/attendances/bulk',{classId,sessionDate,records,...options})).data;},
 async history({classId,from,to}:{classId:number|null;from?:string;to?:string},signal?:AbortSignal):Promise<AttendanceHistory[]>{return classId===null?[]:(await api.get<AttendanceHistory[]>('/academic/attendances/history',{params:{classId,from,to},signal})).data;},
 async summary({classId}:{classId:number|null},signal?:AbortSignal):Promise<AttendanceSummary[]>{return classId===null?[]:(await api.get<AttendanceSummary[]>('/academic/attendances/summary',{params:{classId},signal})).data;},
};
export const examService={
 async roster({id}:{id:number|null},signal?:AbortSignal):Promise<import('../types/lifecycle').ExamRoster|null>{return id===null?null:(await api.get('/teaching/exams/'+id+'/roster',{signal})).data;},
 async list(params:ExamQuery,signal?:AbortSignal){return(await api.get<PageResponse<ExamDto>>('/teaching/exams',{params,signal})).data;},
 async forClass({classId}:{classId:number|null},signal?:AbortSignal):Promise<ExamDto[]>{return classId===null?[]:collectPages(page=>examService.list({classId,page,size:200},signal),signal);},
 async detail({id}:{id:number|null},signal?:AbortSignal):Promise<ExamDto|null>{return id===null?null:(await api.get<ExamDto>('/teaching/exams/'+id,{signal})).data;},
 async save(id:number|null,data:ExamRequest){return id===null?(await api.post<ExamDto>('/teaching/exams',data)).data:(await api.put<ExamDto>('/teaching/exams/'+id,data)).data;},
 async remove(id:number){await api.delete('/teaching/exams/'+id);},
};
export const gradeService={
 async list({examId}:{examId:number|null},signal?:AbortSignal):Promise<GradeDto[]>{return examId===null?[]:collectPages(async page=>(await api.get<PageResponse<GradeDto>>('/teaching/grades',{params:{examId,page,size:200},signal})).data,signal);},
 async save(data:GradeRequest){return(await api.put<GradeDto>('/teaching/grades',data)).data;},
 async history({id}:{id:number|null},signal?:AbortSignal):Promise<GradeChange[]>{return id===null?[]:(await api.get<GradeChange[]>('/teaching/grades/'+id+'/history',{signal})).data;},
 async evaluations({classId}:{classId:number|null},signal?:AbortSignal):Promise<EvaluationReport|null>{return classId===null?null:(await api.get<EvaluationReport>('/teaching/reports/evaluations',{params:{classId},signal})).data;},
};
export const documentService={
 async history({id}:{id:number|null},signal?:AbortSignal):Promise<import('../types/care').DocumentEvent[]>{return id===null?[]:(await api.get('/teaching/documents/'+id+'/history',{signal})).data;},
 async resubmit(id:number,data:FormData){return(await api.post<DocumentDto>('/teaching/documents/'+id+'/resubmit',data,{headers:{'Content-Type':undefined},timeout:60000})).data;},
 async revision(id:number,revision:number){return(await api.get<Blob>('/teaching/documents/'+id+'/revisions/'+revision+'/download',{responseType:'blob',timeout:60000})).data;},
 async list(params:DocumentQuery,signal?:AbortSignal){return(await api.get<PageResponse<DocumentDto>>('/teaching/documents',{params,signal})).data;},
 async detail({id}:{id:number|null},signal?:AbortSignal):Promise<DocumentDto|null>{return id===null?null:(await api.get<DocumentDto>('/teaching/documents/'+id,{signal})).data;},
 async upload(data:FormData){return(await api.post<DocumentDto>('/teaching/documents',data,{headers:{'Content-Type':undefined},timeout:60000})).data;},
 async review(id:number,status:Exclude<DocumentStatus,'PENDING'>,reason:string|undefined,version:number){return(await api.patch<DocumentDto>('/teaching/documents/'+id+'/review',{status,reason,version})).data;},
 async download(id:number){return(await api.get<Blob>('/teaching/documents/'+id+'/download',{responseType:'blob',timeout:60000})).data;},
};
