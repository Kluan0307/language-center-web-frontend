export function queueHref(path: string, scope: {
    branchId?: number;
    allAssigned?: boolean;
}, filters: Record<string, string | number> = {}) { const p = new URLSearchParams(); if (scope.allAssigned)
    p.set('allAssigned', 'true');
else if (scope.branchId)
    p.set('branchId', String(scope.branchId)); for (const [k, v] of Object.entries(filters))
    p.set(k, String(v)); return path + (p.size ? '?' + p : ''); }
