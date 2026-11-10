import type { Role } from '../types/auth';
import type { TuitionDto, TuitionStatus, PaymentDto } from '../types/finance';
export const TUITION_LABELS: Record<TuitionStatus, string> = { UNPAID: 'Chưa đóng', PARTIAL: 'Đóng một phần', PAID: 'Đã đóng đủ', PENDING: 'Chờ xử lý (cũ)', OVERDUE: 'Quá hạn', CANCELLED: 'Đã hủy' };
export const PAYMENT_LABELS: Record<PaymentDto['status'], string> = { PAID: 'Đã thu', PENDING: 'Chờ xử lý', FAILED: 'Thất bại', REFUNDED: 'Đã hoàn (cũ)', PARTIAL: 'Một phần (cũ)' };
export const METHOD_LABELS: Record<PaymentDto['paymentMethod'], string> = { CASH: 'Tiền mặt', BANK_TRANSFER: 'Chuyển khoản', CARD: 'Thẻ (cũ)', WALLET: 'Ví (cũ)' };
export const canAdjustTuition = (role?: Role) => role === 'SUPER_ADMIN' || role === 'ADMIN';
export const canCollect = (t: Pick<TuitionDto, 'status' | 'balance' | 'currency'>) => t.status !== 'CANCELLED' && t.balance > 0 && t.currency === 'VND';
export const cents = (amount: number) => Math.round(amount * 100);
export const validMoney = (amount: unknown): amount is number => typeof amount === 'number' && Number.isFinite(amount) && amount >= 0 && amount <= 9999999999999.99 && /^\d+(?:\.\d{1,2})?$/.test(String(amount));
export function validateCollection(amount: unknown, balance: number) {
 if (!validMoney(amount) || amount <= 0) throw new Error('Nhập số tiền lớn hơn 0, tối đa hai chữ số thập phân.');
 if (cents(amount) > cents(balance)) throw new Error('Số tiền thu vượt số còn nợ. Hãy tải lại học phí.');
}
export function adjustedNet(original: number, discount: number, _paid: number) {
 if (!validMoney(original) || !validMoney(discount) || !validMoney(_paid)) throw new Error('Số tiền phải hợp lệ và không âm.');
 const net = cents(original) - cents(discount);
 if (net < 0) throw new Error('Giảm trừ không được vượt học phí ban đầu.');
 return net / 100;
}
