import type { PageQuery } from './api';
export type LeadState = 'NEW' | 'CONTACTED' | 'CONSULTING' | 'CONVERTED' | 'LOST';
export type StudentState = 'STUDYING' | 'PAUSED' | 'GRADUATED';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type StudyState = 'STUDYING' | 'RESERVED' | 'DROPPED' | 'COMPLETED' | 'TRANSFERRED';
export type DeliveryState = 'PENDING' | 'CREATED' | 'FAILED';
export interface StudentDto {
  id: number; version:number; fullName: string; dateOfBirth: string | null; gender: Gender | null;
  email: string | null; phone: string; address: string | null; contactPerson: string | null;
  currentLevel: string | null; registeredAt: string; status: StudentState; branchId: number;
  studentCode: string; guardianName: string | null; guardianPhone: string | null;
}
export interface StudentRequest {
  fullName: string; dateOfBirth?: string; gender?: Gender; email?: string; phone: string;
  address?: string; contactPerson?: string; currentLevel?: string; branchId?: number;
  guardianName?: string; guardianPhone?: string;
}
export interface StudentRegistration {
  id: number; classId: number; classCode: string; className: string; enrolledAt: string; studyStatus: StudyState;
}
export interface StudentDetail { student: StudentDto; enrollments: StudentRegistration[] }
export interface LeadDto {
  version:number;nextContactAt:string|null;overdue:boolean;
  id: number; fullName: string; phone: string; email: string | null; source: string | null;
  interestedCourseId: number | null; interestedCourseName: string | null; desiredLevel: string | null;
  status: LeadState; note: string | null; assignedTo: number; assignedToName: string;
  convertedStudent: StudentDto | null; createdAt: string; lastContactedAt: string | null; branchId: number;
}
export interface LeadRequest {
  version?:number;
  fullName: string; phone: string; email?: string; source?: string; interestedCourseId?: number;
  desiredLevel?: string; note?: string; branchId?: number;
}
export interface EnrollmentDto {
 completionResultId?:number|null;completionResultRevision?:number|null;
  id: number; version:number; reservedSince:string|null; expectedReturnDate:string|null; studentId: number; studentName: string; currentLevel: string | null;
  classId: number; classCode: string; className: string; enrolledAt: string; studyStatus: StudyState;
  branchId: number; billingEnrollmentId: number | null; tuitionDelivery: DeliveryState;
  tuitionDeliveryError: string | null; registeredBy: number | null; registeredByName: string | null;
}
export interface BillingSnapshot {
  enrollmentId: number; branchId: number; studentId: number; studentName: string;
  classId: number; className: string; courseId: number; courseName: string; tuitionFee: number; dueDate: string;
}
export interface TuitionDelivery { enrollmentId: number; status: DeliveryState; error: string | null }
export interface LeadQuery extends PageQuery {allAssigned?:boolean; branchId?: number; status?: LeadState; assignedTo?: number;followUp?:'OVERDUE'|'TODAY'|'UPCOMING'|'UNSCHEDULED' }
export interface StudentQuery extends PageQuery { branchId?: number; status?: StudentState; level?: string }
export interface EnrollmentQuery extends PageQuery { branchId?: number; studyStatus?: StudyState; classId?: number; studentId?: number }
