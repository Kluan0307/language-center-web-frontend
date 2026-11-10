import {api} from '../api/axiosInstance';
import type {TeacherProfile,TeacherProfileUpdate,TeacherProfileEvent,TeacherResponsibility} from '../types/teacherProfile';
const root='/auth/teacher-profiles';
export const teacherProfileService={
 async detail({id}:{id:number},signal?:AbortSignal){return(await api.get<TeacherProfile>(root+'/'+id,{signal})).data;},
 async update(id:number,data:TeacherProfileUpdate){return(await api.put<TeacherProfile>(root+'/'+id,data)).data;},
 async history({id,enabled}:{id:number;enabled:boolean;version:number},signal?:AbortSignal){return enabled?(await api.get<TeacherProfileEvent[]>(root+'/'+id+'/history',{signal})).data:[];},
 async responsibilities({id,enabled}:{id:number;enabled:boolean;version:number;revision:number},signal?:AbortSignal){return enabled?(await api.get<TeacherResponsibility[]>(root+'/'+id+'/responsibilities',{signal})).data:[];},
 async workStatus(id:number,data:{version:number;workStatus:'ACTIVE'|'INACTIVE';reason:string}){return(await api.patch<TeacherProfile>(root+'/'+id+'/work-status',data)).data;}
};
