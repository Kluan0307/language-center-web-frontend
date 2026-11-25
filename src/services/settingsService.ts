import {api} from '../api/axiosInstance';
export interface Preferences{accountId:number;version:number;compactTables:boolean;pageSize:number;calendarView:'week'|'day';defaultBranchId:number|null}
export interface CompanyProfile{id:number;version:number;name:string;logoUrl:string|null;address:string|null;email:string|null;phone:string|null}
export const defaults:Preferences={accountId:0,version:0,compactTables:false,pageSize:10,calendarView:'week',defaultBranchId:null};
export const settingsService={
 async preferences(_:object={},signal?:AbortSignal,token?:string){void _;return(await api.get<Preferences>('/auth/settings/preferences',{signal,headers:token?{Authorization:'Bearer '+token}:undefined})).data;},
 async savePreferences(data:Preferences){return(await api.put<Preferences>('/auth/settings/preferences',data)).data;},
 async company(_:object={},signal?:AbortSignal){void _;return(await api.get<CompanyProfile>('/auth/settings/company',{signal})).data;},
 async saveCompany(data:CompanyProfile){return(await api.put<CompanyProfile>('/auth/settings/company',data)).data;},
};
