export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

export interface Attendance {
    id: number;
    enrollment: {
        id: number;
        student: { id: number; fullName: string };
        schoolClass: { id: number; name: string };
    };
    sessionDate: string;        // ISO date — ngày của buổi học
    status: AttendanceStatus;
    hasPermission: boolean;      // chỉ có ý nghĩa khi status = ABSENT
    recordedBy: { id: number; username: string; fullName: string };
}