import type { Role } from "./auth";

export interface AccountSummary {
    id: number;
    username: string;
    role: Role;
    status: boolean;
}
