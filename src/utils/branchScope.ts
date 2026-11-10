import { getSessionToken } from './authStorage';
import type { UserResponse } from '../types/auth';
const listeners = new Set<() => void>();
function accountKey() {
 try { const payload=JSON.parse(atob(getSessionToken()!.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))) as {accountId:number}; return 'lc.branch.'+payload.accountId; }
 catch { return null; }
}
export function getActiveBranch(): number | null {
 const key=accountKey(); if(!key) return null;
 try { const value=Number(sessionStorage.getItem(key)); return Number.isSafeInteger(value)&&value>0?value:null; } catch { return null; }
}
export function selectBranch(id:number|null) {
 const key=accountKey();if(!key)return;
 try { if(id===null)sessionStorage.removeItem(key);else sessionStorage.setItem(key,String(id)); } catch { /* Session can still use the server default. */ }
 listeners.forEach(fn=>fn());
}
export function subscribeBranch(fn:()=>void) { listeners.add(fn);return ()=>{listeners.delete(fn);}; }
export function ensureBranch(user:UserResponse) {
 const ids=user.branchIds??(user.branchId?[user.branchId]:[]);
 if(user.role==='SUPER_ADMIN') { if(getActiveBranch()!==null)selectBranch(null);return; }
 if(!ids.includes(getActiveBranch()??-1))selectBranch(user.branchId);
}
