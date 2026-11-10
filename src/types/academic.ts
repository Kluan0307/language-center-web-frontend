import type { PageQuery } from './api';

export type CourseState = 'OPEN' | 'CLOSED';
export type RoomState = 'AVAILABLE' | 'MAINTENANCE';
export type ClassProgress = 'UPCOMING' | 'ONGOING' | 'FINISHED';
export type Weekday = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
export interface CourseDto {
  id: number; code: string; name: string; type: string | null; level: string | null;
  duration: number|null; expectedMinutes:number|null;durationRevision:number; tuitionFee: number; content: string | null; entryRequirement: string | null;
  maxStudents: number; status: CourseState; branchId: number | null;
}
export interface CourseRequest {
  code: string; name: string; type?: string; level?: string; duration?: number|null; expectedMinutes?:number; tuitionFee: number;
  content?: string; entryRequirement?: string; maxStudents: number; branchId?: number | null;
}
export interface RoomDto {
  id: number; code: string; name: string; location: string | null; capacity: number;
  equipment: string | null; status: RoomState; branchId: number;
}
export interface RoomRequest {
  code: string; name: string; location?: string; capacity: number; equipment?: string; branchId?: number;
}
export interface ClassDto {
  effectiveEndDate?: string;
  closed?: boolean;
  id: number; code: string; name: string; courseId: number; courseName: string;
  teacherId: number; teacherName: string; roomId: number; roomName: string;
  startDate: string; endDate: string; maxSize: number; currentSize: number;
  status: ClassProgress; statusManuallySet: boolean; branchId: number; full: boolean;
}
export interface ScheduleSlot { dayOfWeek: Weekday; startTime: string; endTime: string }
export interface ClassRequest {
  code: string; name: string; courseId: number; teacherId: number; teacherName: string;
  roomId: number; startDate: string; endDate: string; maxSize: number;
  branchId?: number; schedules?: ScheduleSlot[];
}
export interface ScheduleDto extends ScheduleSlot {
  id: number; classId: number; classCode: string; className: string;
  roomId: number; roomName: string; teacherId: number; teacherName: string; branchId: number;
}
export interface ClassDetail { schoolClass: ClassDto; schedules: ScheduleDto[] }
export interface ClassStudent { id: number; studentCode: string | null; fullName: string; currentLevel: string | null }
export interface ScheduleRequest extends ScheduleSlot { classId: number }
export interface ConflictRequest extends ScheduleSlot {
  classId?: number; excludeScheduleId?: number; branchId?: number; teacherId?: number;
  roomId?: number; startDate?: string; endDate?: string;
}
export interface ScheduleConflict extends ScheduleSlot {
  scheduleId: number; classId: number; classCode: string; className: string; reason: string;
}
export interface CourseQuery extends PageQuery { status?: CourseState; branchId?: number; level?: string; type?: string }
export interface RoomQuery extends PageQuery { status?: RoomState; branchId?: number }
export interface ClassQuery extends PageQuery { status?: ClassProgress | 'FULL'; courseId?: number; teacherId?: number; branchId?: number }
export interface ScheduleQuery extends PageQuery { classId?: number; branchId?: number; dayOfWeek?: Weekday; teacherId?: number; roomId?: number }
