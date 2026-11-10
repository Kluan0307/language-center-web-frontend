import type {Role,UserResponse} from '../types/auth';
type AccountScope=Pick<UserResponse,'role'|'branchId'|'accountId'|'branchIds'>;
export function canManageAccount(caller:AccountScope,target:AccountScope):boolean {
 if(target.role==='SUPER_ADMIN'||caller.accountId===target.accountId)return false;
 if(caller.role==='SUPER_ADMIN')return true;
 const own=caller.branchIds??(caller.branchId?[caller.branchId]:[]);
 const assigned=target.branchIds??(target.branchId?[target.branchId]:[]);
 return caller.role==='ADMIN'&&assigned.length>0&&assigned.every(id=>own.includes(id))&&(target.role==='STAFF'||target.role==='TEACHER');
}
export function creatableRoles(role:Role):Exclude<Role,'SUPER_ADMIN'>[]{
 if(role==='SUPER_ADMIN')return ['ADMIN','STAFF','TEACHER'];return role==='ADMIN'?['STAFF','TEACHER']:[];
}
