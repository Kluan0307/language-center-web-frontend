export type SchoolClassStatus = 'UPCOMING' | 'ONGOING' | 'FULL' | 'FINISHED' | 'CANCELLED';

export interface CourseSummary {
    id: number;
    name: string;
    code?: string;
    duration?: number;
    tuitionFee?: number;
}

export interface TeacherSummary {
    id: number;
    fullName: string;
    email?: string;
    phone?: string;
    specialization?: string;
}

export interface RoomSummary {
    id: number;
    name: string;
    location?: string;
    capacity?: number;
}

export interface SchoolClass {
    id: number;
    code: string;
    name: string;
    course: CourseSummary;
    teacher: TeacherSummary;
    room: RoomSummary;
    startDate: string; // YYYY-MM-DD
    endDate: string;   // YYYY-MM-DD
    scheduleDays?: string; // e.g. "T2-4-6", "T3-5-7", "T7-CN"
    scheduleTime?: string; // e.g. "18:00 - 19:30", "19:45 - 21:15"
    schedule?: string;     // Formatted combined string: e.g. "T2-4-6 (18:00 - 19:30)"
    maxSize: number;
    currentSize: number;
    status: SchoolClassStatus;
}
