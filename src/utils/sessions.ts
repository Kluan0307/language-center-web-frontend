import type {ClassSession,SessionStatus} from '../types/session';
export const SESSION_LABELS:Record<SessionStatus,string>={SCHEDULED:'Chưa điểm danh',COMPLETED:'Đã điểm danh',CANCELLED:'Đã hủy'};
export function attendanceLink(sessionId:number){return '/attendance?sessionId='+sessionId;}
export function isSubstitute(s:Pick<ClassSession,'teacherId'|'plannedTeacherId'>){return s.teacherId!==null&&s.plannedTeacherId!==null&&s.teacherId!==s.plannedTeacherId;}
export function validateSessionTimes(start:string,end:string){
 const seconds=(value:string)=>{if(!/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(value))return NaN;const [h,m,s=0]=value.split(':').map(Number);return h*3600+m*60+s;};
 const a=seconds(start),b=seconds(end);if(!Number.isFinite(a)||!Number.isFinite(b)||b<=a||a%60!==0||b%60!==0)throw new Error('Giờ học cùng ngày, kết thúc sau bắt đầu và chính xác đến phút.');
}
