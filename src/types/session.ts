import type {PageQuery} from './api';
export type SessionStatus='SCHEDULED'|'CANCELLED'|'COMPLETED';
export interface ClassSession {id:number;version:number;classId:number;classCode:string;className:string;branchId:number;sessionDate:string;startTime:string|null;endTime:string|null;roomId:number|null;roomName:string|null;plannedTeacherId:number|null;plannedTeacherName:string|null;teacherId:number|null;teacherName:string|null;status:SessionStatus;kind:'REGULAR'|'MAKEUP'|'LEGACY';sourceDate:string|null;makeupForId:number|null;makeupSessionId:number|null;classClosed:boolean;customized:boolean;reason:string|null;canAttend:boolean}
export interface SessionQuery extends PageQuery {branchId?:number;classId?:number;teacherId?:number;status?:SessionStatus;from?:string;to?:string}
export interface SessionEdit {sessionDate:string;startTime:string;endTime:string;roomId:number;teacherId:number;reason:string;version:number}
export interface SessionEvent {id:number;action:string;reason:string|null;beforeState:string|null;afterState:string|null;actorName:string;occurredAt:string}
export interface AttendanceChange {id:number;studentName:string;oldStatus:string|null;newStatus:string;oldPermission:boolean|null;newPermission:boolean;previousRecordedByName:string|null;changedByName:string;changedAt:string;reason:string}
