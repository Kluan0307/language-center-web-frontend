import { classService, courseService } from './academicService';
type Scope = {
    branchId?: number;
    allAssigned?: boolean;
    branchIds?: number[];
};
export async function managementClasses(p: Scope, signal?: AbortSignal) { if (!p.allAssigned)
    return classService.all({ branchId: p.branchId }, signal); const result = await Promise.all((p.branchIds ?? []).map(branchId => classService.all({ branchId }, signal))); return [...new Map(result.flat().map(c => [c.id, c])).values()]; }
export async function managementCourses(p: Scope, signal?: AbortSignal) { if (!p.allAssigned)
    return courseService.all({ branchId: p.branchId }, signal); const result = await Promise.all((p.branchIds ?? []).map(branchId => courseService.all({ branchId }, signal))); return [...new Map(result.flat().map(c => [c.id, c])).values()]; }
