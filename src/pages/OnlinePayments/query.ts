export const orderStates = ['CREATED', 'PENDING', 'SUCCEEDED', 'FAILED', 'EXPIRED', 'REVIEW_REQUIRED'] as const;
export function readOnlineQuery(params: URLSearchParams) {
    const positive = (key: string) => { const n = Number(params.get(key)); return Number.isSafeInteger(n) && n > 0 ? n : undefined; };
    const page = Number(params.get('page')), size = Number(params.get('size')), eventPage = Number(params.get('eventPage'));
    const state = params.get('state');
    return { page: Number.isSafeInteger(page) && page >= 0 && page < 100000 ? page : 0, size: [10, 20, 50].includes(size) ? size : 10, state: state && orderStates.includes(state as typeof orderStates[number]) ? state : undefined, branchId: positive('branchId'), studentId: positive('studentId'), classId: positive('classId'), tuitionId: positive('tuitionId'), receiptId: positive('receiptId'), keyword: params.get('keyword')?.trim().slice(0, 120) || undefined, eventPage: Number.isSafeInteger(eventPage) && eventPage >= 0 && eventPage < 100000 ? eventPage : 0, tab: params.get('tab') === 'events' ? 'events' : 'orders' };
}
export function patchOnlineQuery(params: URLSearchParams, patch: Record<string, string | number | undefined>) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
        if (value === undefined || value === '')
            next.delete(key);
        else
            next.set(key, String(value));
    }
    return next;
}
