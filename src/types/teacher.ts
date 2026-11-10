import type { AccountSummary } from "./common";

export type WorkStatus = "WORKING" | "RESIGNED";

export interface Teacher {
    id: number;
    account: AccountSummary;
    fullName: string;
    email: string;
    phone: string;
    specialization: string;
    qualification: string;
    experience: string;
    certificate: string;
    hireDate: string;      // ISO date
    workStatus: WorkStatus;
}