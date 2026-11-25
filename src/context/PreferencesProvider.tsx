import {useEffect,useState,type ReactNode} from 'react';import {createGlobalStyle} from 'styled-components';
import {useAuth} from '../hooks/useAuth';import {defaults,settingsService,type Preferences} from '../services/settingsService';import {getErrorMessage} from '../utils/apiErrors';import {PreferencesContext} from './preferences-state';
const TableDensity=createGlobalStyle<{$compact:boolean}>`${p=>p.$compact?'.ant-table-wrapper .ant-table-thead > tr > th, .ant-table-wrapper .ant-table-tbody > tr > td {padding-top:6px !important;padding-bottom:6px !important;}':''}`;
export function PreferencesProvider({children}:{children:ReactNode}){const {user}=useAuth();const id=user?.accountId;const [revision,setRevision]=useState(0);const [result,setResult]=useState<{id:number;value?:Preferences;error?:string}>();
 useEffect(()=>{if(!id)return;const c=new AbortController();settingsService.preferences({},c.signal).then(value=>{if(!c.signal.aborted)setResult({id,value});}).catch(e=>{if(!c.signal.aborted)setResult({id,error:getErrorMessage(e)});});return()=>c.abort();},[id,revision]);
 const current=result?.id===id?result:undefined,preferences=current?.value??defaults;
 return <PreferencesContext.Provider value={{preferences,loading:!!id&&!current,error:current?.error,apply:value=>{if(id)setResult({id,value});},reload:()=>setRevision(v=>v+1)}}><TableDensity $compact={preferences.compactTables}/>{children}</PreferencesContext.Provider>;
}
