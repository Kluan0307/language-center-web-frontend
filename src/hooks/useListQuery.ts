import { useSearchParams } from "react-router-dom";
import type { Dispatch, SetStateAction } from "react";
type Query = {
  page?: number;
  size?: number;
  keyword?: string;
  status?: string;
  studyStatus?: string;
  branchId?: number;
  courseId?: number;
  teacherId?: number;
  level?: string;
};
export function useListQuery<T extends Query>(statuses: readonly string[]) {
  const [params, setParams] = useSearchParams();
  const read = (p: URLSearchParams) => {
    const q: Query = { page: 0, size: 10 };
    const page = Number(p.get("page")),
      size = Number(p.get("size"));
    if (Number.isSafeInteger(page) && page >= 0) q.page = page;
    if ([10, 20, 50].includes(size)) q.size = size;
    for (const key of ["branchId", "courseId", "teacherId"] as const) {
      const value = Number(p.get(key));
      if (Number.isSafeInteger(value) && value > 0) q[key] = value;
    }
    for (const key of ["keyword", "level"] as const) {
      const value = p.get(key)?.trim();
      if (value) q[key] = value;
    }
    const status = p.get("status");
    if (status && statuses.includes(status)) q.status = status;
    const study = p.get("studyStatus");
    if (study && statuses.includes(study)) q.studyStatus = study;
    return q as T;
  };
  const query = read(params);
  const setQuery: Dispatch<SetStateAction<T>> = (action) =>
    setParams((p) => {
      const nextQuery = typeof action === "function" ? action(read(p)) : action;
      const next = new URLSearchParams(p);
      for (const key of [
        "page",
        "size",
        "keyword",
        "status",
        "studyStatus",
        "branchId",
        "courseId",
        "teacherId",
        "level",
      ] as const) {
        const value = nextQuery[key];
        if (value === undefined || value === "") next.delete(key);
        else next.set(key, String(value));
      }
      return next;
    });
  return [query, setQuery] as const;
}
