export type CourseStatus = "OPEN" | "CLOSED";

export interface Course {
    id: number;
    code: string;
    name: string;
    type: string;
    level: string;
    duration: number;
    tuitionFee: number;
    content: string;
    entryRequirement: string;
    maxStudents: number;
    status: CourseStatus;
}