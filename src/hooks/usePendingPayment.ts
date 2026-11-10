import { useSyncExternalStore } from 'react';
import { useAuth } from './useAuth';
import { pendingSnapshot, parsePending, subscribePending } from '../utils/pendingPayment';
export function usePendingPayment() {
 const { user } = useAuth();
 const raw = useSyncExternalStore(subscribePending, () => { try { return pendingSnapshot(user?.accountId ?? null); } catch { return '{"storageError":true}'; } }, () => null);
 try { return { draft: parsePending(raw), error: undefined }; }
 catch (e) { return { draft: null, error: e instanceof Error ? e.message : 'Không đọc được yêu cầu đang chờ.' }; }
}
