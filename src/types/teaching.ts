import type { PageQuery } from './api';
export type AttendanceStatus='PRESENT'|'ABSENT'|'LATE';
export interface AttendanceRow {enrollmentId:number;studentId:number;studentName:string;currentLevel:string|null;status:AttendanceStatus;hasPermission:boolean;saved:boolean;recordedBy:number|null;recordedByName:string|null}
export interface AttendanceSheet {sessionId:number;version:number;sessionStatus:'SCHEDULED'|'COMPLETED'|'CANCELLED';startTime:string|null;endTime:string|null;teacherName:string|null;canEdit:boolean;correctionRequired:boolean;canViewClassHistory:boolean;classId:number;className:string;sessionDate:string;records:AttendanceRow[]}
export interface AttendanceHistory {sessionDate:string;present:number;absent:number;late:number}
export interface AttendanceSummary {enrollmentId:number;studentId:number;studentName:string;present:number;absent:number;late:number;totalSessions:number;participationRate:number}
export interface ExamDto {version:number;id:number;branchId:number;classId:number;name:string;examType:string;examDate:string;weight:number;maxScore:number}
export interface ExamRequest {classId:number;name:string;examType:string;examDate:string;weight:number;maxScore:number}
export interface ExamQuery extends PageQuery {branchId?:number;classId?:number}
export interface GradeDto {id:number;examId:number;studentId:number;studentName:string;score:number;enteredBy:number;enteredByName:string;enteredAt:string;lastModifiedBy:number|null;lastModifiedByName:string|null;lastModifiedAt:string|null;modificationReason:string|null;comment:string|null;studentComment?:string|null}
export interface GradeChange {oldScore:number;newScore:number;modifiedBy:number;modifiedByName:string;modifiedAt:string;reason:string|null}
export interface GradeRequest {examId:number;studentId:number;score:number;comment?:string;reason?:string;studentComment?:string}
export type Evaluation=import('../services/evaluationService').EvaluationRow;
export type EvaluationReport=import('../services/evaluationService').EvaluationReport;
export type DocumentStatus='PENDING'|'APPROVED'|'REJECTED';
export interface DocumentDto {sharedToStudents:boolean;sharedAt:string|null;version:number;revision:number;lastSubmittedAt:string;id:number;branchId:number;title:string;classId:number|null;courseId:number|null;filename:string;fileSize:number;description:string|null;uploadedBy:number;uploadedByName:string;uploadedAt:string;status:DocumentStatus;reviewedBy:number|null;reviewedByName:string|null;reviewedAt:string|null;rejectReason:string|null}
export interface DocumentQuery extends PageQuery {branchId?:number;classId?:number;courseId?:number;status?:DocumentStatus}
