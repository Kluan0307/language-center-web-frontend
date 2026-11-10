export type LeadStatus = "NEW" | "CONTACTED" | "CONSULTING" | "CONVERTED" | "LOST";

export interface Lead {
    id: number;
    fullName: string;
    phone: string;
    email: string;
    source: string;
    interestedCourse: { id: number; name: string } | null;
    desiredLevel: string;
    status: LeadStatus;
    note: string;
    assignedTo: { id: number; fullName: string };
    convertedStudent: { id: number; fullName: string } | null;
    createdAt: string;         // ISO datetime
    lastContactedAt: string | null;
}