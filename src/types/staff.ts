import type { AccountSummary } from "./common";

export interface Staff {
    id: number;
    account: AccountSummary;
    fullName: string;
    email: string;
    phone: string;
}