import type { PendingPayment } from '../types/finance';
const key = (accountId: number) => 'lc.pending-payment.' + accountId;
const changed = () => window.dispatchEvent(new Event('lc-payment-change'));
export function pendingSnapshot(accountId: number | null): string | null { return accountId === null ? null : localStorage.getItem(key(accountId)); }
export function parsePending(raw: string | null): PendingPayment | null {
 if (!raw) return null;
 const d = JSON.parse(raw) as PendingPayment;
 if (!d?.request?.requestKey || !Number.isSafeInteger(d.accountId) || !Number.isSafeInteger(d.request.tuitionId)) throw new Error('Không đọc được yêu cầu thu tiền đang chờ. Hãy giữ dữ liệu trình duyệt và liên hệ quản trị viên.');
 return d;
}
export function savePending(draft: PendingPayment) {
 const old = parsePending(pendingSnapshot(draft.accountId));
 if (old && (old.request.requestKey !== draft.request.requestKey || JSON.stringify(old.request) !== JSON.stringify(draft.request))) throw new Error('Còn yêu cầu thu tiền chưa xác nhận. Hãy xử lý yêu cầu đó trước.');
 localStorage.setItem(key(draft.accountId), JSON.stringify(draft)); changed();
}
export function clearPending(accountId: number, requestKey: string) {
 const old = parsePending(pendingSnapshot(accountId));
 if (old?.request.requestKey === requestKey) { localStorage.removeItem(key(accountId)); changed(); }
}
export function subscribePending(callback: () => void) {
 window.addEventListener('storage', callback); window.addEventListener('lc-payment-change', callback);
 return () => { window.removeEventListener('storage', callback); window.removeEventListener('lc-payment-change', callback); };
}
