import type { PageQuery } from './api';
export type TuitionStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER';
export interface TuitionDto {
    id: number;
    version: number;
    credit: number;
    enrollmentId: number | null;
    studentId: number;
    studentName: string | null;
    classId: number;
    className: string | null;
    courseId: number | null;
    courseName: string | null;
    originalAmount: number;
    discountAmount: number;
    amount: number;
    paidAmount: number;
    balance: number;
    currency: string;
    dueDate: string;
    status: TuitionStatus;
    overdue: boolean;
    branchId: number;
    adjustedBy: number | null;
    adjustedByName: string | null;
    adjustedAt: string | null;
    adjustmentReason: string | null;
}
export interface PaymentDto {
    source?: "ONLINE" | "DIRECT" | "REVIEW_REQUIRED" | "UNKNOWN";
    onlineOrderId?: string | null;
    studentId?: number | null;
    studentName?: string | null;
    classId?: number | null;
    className?: string | null;
    id: number;
    voidedAmount: number;
    refundedAmount: number;
    availableAmount: number;
    tuitionId: number;
    amount: number;
    paymentMethod: PaymentMethod | 'CARD' | 'WALLET';
    referenceCode: string | null;
    paidAt: string;
    status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIAL';
    branchId: number;
    receiptNo: string | null;
    recordedBy: number | null;
    recordedByName: string | null;
    note: string | null;
}
export interface TuitionQuery extends PageQuery {allAssigned?:boolean;
    status?: TuitionStatus;
    branchId?: number;
    classId?: number;
    studentId?: number;
    overdue?: boolean;
}
export interface PaymentQuery extends PageQuery {
    branchId?: number;
    tuitionId?: number;
    studentId?: number;
    classId?: number;
}
export interface PaymentRequest {
    tuitionId: number;
    amount: number;
    paymentMethod: PaymentMethod;
    referenceCode?: string;
    requestKey: string;
    note?: string;
}
export interface TuitionAdjustment {
    originalAmount: number;
    discountAmount: number;
    dueDate: string;
    reason: string;
    version: number;
    requestKey: string;
}
export interface PendingPayment {
    accountId: number;
    request: PaymentRequest;
    studentName: string;
    className: string;
    branchId: number;
    createdAt: string;
    rejected?: boolean;
    error?: string;
}
