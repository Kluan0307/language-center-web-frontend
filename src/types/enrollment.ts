export type StudyStatus = "STUDYING" | "DROPPED" | "COMPLETED" | "TRANSFERRED" | "RESERVED";

export interface Enrollment {
    id: number;
    student: { id: number; fullName: string; currentLevel: string };
    schoolClass: { id: number; name: string; code: string };
    enrolledAt: string;      // ISO date
    studyStatus: StudyStatus;
}