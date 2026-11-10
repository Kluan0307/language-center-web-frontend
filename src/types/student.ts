// src/types/student.ts

export type StudentStatus = "STUDYING" | "PAUSED" | "GRADUATED";
export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface Student {
    id: number;
    fullName: string;
    dateOfBirth: string;
    gender: Gender;
    email: string;
    phone: string;
    address: string;
    contactPerson: string;
    currentLevel: string;
    registeredAt: string;
    status: StudentStatus;
}