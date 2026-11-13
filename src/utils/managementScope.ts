import type { UserResponse } from '../types/auth';
import type { Branch } from '../types/branch';
export function effectiveBranch(user: Pick<UserResponse, 'role' | 'branchId' | 'branchIds'> | null | undefined, requested?: number) { if (user?.role === 'SUPER_ADMIN')
    return requested; if (user?.role === 'ADMIN' && requested && (user.branchIds ?? []).includes(requested))
    return requested; return undefined; }
export function scopeLabel(user: Pick<UserResponse, 'role' | 'branchId'> | null | undefined, branches: Branch[] | undefined, requested?: number, allAssigned = false) { if (allAssigned && user?.role === 'ADMIN')
    return 'Tất cả chi nhánh được phân công'; const id = requested ?? (user?.role === 'SUPER_ADMIN' ? undefined : user?.branchId); if (!id)
    return user?.role === 'SUPER_ADMIN' ? 'Toàn hệ thống' : 'Chưa chọn chi nhánh'; const b = branches?.find(b => b.id === id); return b ? b.code + ' · ' + b.name : 'Chi nhánh #' + id; }
