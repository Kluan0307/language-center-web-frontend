import {api} from '../api/axiosInstance';
export interface Unit{id:number;name:string;parentId:number|null;branchId:number|null;active:boolean;version:number}
export interface Title{id:number;name:string;active:boolean;version:number}
export interface Assignment{id:number;accountId:number;unitId:number;titleId:number;managerAccountId:number|null;active:boolean;version:number}
export interface Branch{id:number;code:string;name:string;address:string;phone:string;status:string}
export interface Person{accountId:number;personnelCode:string|null;fullName:string;branchIds:number[];positions:{unit:string;title:string}[]}
export interface Organization{units:Unit[];titles:Title[];assignments:Assignment[];branches:Branch[]}
export interface Page<T>{content:T[];totalElements:number;page:number;size:number;totalPages:number}
export const companyService={
 async organization(_:object,signal?:AbortSignal){return(await api.get<Organization>('/auth/company',{signal})).data;},
 async directory(params:{keyword?:string;branchId?:number;unitId?:number;titleId?:number;page?:number;size?:number},signal?:AbortSignal){return(await api.get<Page<Person>>('/auth/company/directory',{params,signal})).data;},
 async save(kind:'units'|'titles'|'assignments',id:number|undefined,data:object){return(await (id?api.put('/auth/company/'+kind+'/'+id,data):api.post('/auth/company/'+kind,data))).data;},
};
export interface Ticket{id:number;ownerId:number;branchId:number|null;category:string;title:string;description:string;status:string;version:number;createdAt:string;updatedAt:string}
export interface TicketDetail{ticket:Ticket;canManage:boolean;replies:{id:number;actorId:number;message:string;statusAfter:string;createdAt:string}[]}
export const internalSupportService={
 async guides(_:object,signal?:AbortSignal){return(await api.get<{id:string;title:string;body:string}[]>('/auth/internal-support/guides',{signal})).data;},
 async list(params:{queue:boolean;status?:string;page:number;size:number},signal?:AbortSignal){return(await api.get<Page<Ticket>>('/auth/internal-support/tickets',{params,signal})).data;},
 async detail({id}:{id:number},signal?:AbortSignal){return(await api.get<TicketDetail>('/auth/internal-support/tickets/'+id,{signal})).data;},
 async create(data:object){return(await api.post<Ticket>('/auth/internal-support/tickets',data)).data;},
 async reply(id:number,data:object){return(await api.post('/auth/internal-support/tickets/'+id+'/replies',data)).data;},
};
