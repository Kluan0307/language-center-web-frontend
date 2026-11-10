import {api} from '../api/axiosInstance';
import {collectPages} from './academicService';
import type {PageResponse} from '../types/api';
import type {ClassSession,SessionEdit,SessionQuery,SessionEvent,AttendanceChange} from '../types/session';
export const sessionService={
 async list(params:SessionQuery,signal?:AbortSignal){return(await api.get<PageResponse<ClassSession>>('/academic/sessions',{params,signal})).data;},
 async all(params:Omit<SessionQuery,'page'|'size'>,signal?:AbortSignal){return collectPages(page=>sessionService.list({...params,page,size:200},signal),signal);},
 async detail({id}:{id:number|null},signal?:AbortSignal):Promise<ClassSession|null>{return id===null?null:(await api.get<ClassSession>('/academic/sessions/'+id,{signal})).data;},
 async history({id}:{id:number|null},signal?:AbortSignal):Promise<SessionEvent[]>{return id===null?[]:(await api.get<SessionEvent[]>('/academic/sessions/'+id+'/history',{signal})).data;},
 async attendanceChanges({id}:{id:number|null},signal?:AbortSignal):Promise<AttendanceChange[]>{return id===null?[]:(await api.get<AttendanceChange[]>('/academic/sessions/'+id+'/attendance-changes',{signal})).data;},
 async generate(data:{classId:number;from?:string;to?:string}){return(await api.post<{created:number;changed:number}>('/academic/sessions/generate',data)).data;},
 async edit(id:number,data:SessionEdit){return(await api.put<ClassSession>('/academic/sessions/'+id,data)).data;},
 async makeup(id:number,data:SessionEdit){return(await api.post<ClassSession>('/academic/sessions/'+id+'/makeup',data)).data;},
 async action(id:number,action:'cancel'|'restore',data:{version:number;reason:string}){return(await api.post<ClassSession>('/academic/sessions/'+id+'/'+action,data)).data;},
};
