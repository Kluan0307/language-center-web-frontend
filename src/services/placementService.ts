import { api } from "../api/axiosInstance";
import type { PageResponse } from "../types/api";
import type {
  Program,
  ProgramLevel,
  ProgramRequest,
  LevelRequest,
  CourseAdmission,
  ClassAdmission,
  AdmissionPolicy,
  AdmissionConfirm,
  ClassAdmissionChange,
  Assessment,
  AssessmentDraft,
  AssessmentEvent,
  AssessmentStatus,
} from "../types/placement";
const base = "/academic";
export const programService = {
  async list(_params: object, signal?: AbortSignal) {
    return (await api.get<Program[]>(base + "/programs", { signal })).data;
  },
  async levels({ id }: { id: number | null }, signal?: AbortSignal) {
    return id === null
      ? []
      : (
          await api.get<ProgramLevel[]>(base + "/programs/" + id + "/levels", {
            signal,
          })
        ).data;
  },
  async save(id: number | null, data: ProgramRequest) {
    return (
      await (id === null
        ? api.post<Program>(base + "/programs", data)
        : api.put<Program>(base + "/programs/" + id, data))
    ).data;
  },
  async saveLevel(programId: number, id: number | null, data: LevelRequest) {
    return (
      await (id === null
        ? api.post<ProgramLevel>(
            base + "/programs/" + programId + "/levels",
            data,
          )
        : api.put<ProgramLevel>(base + "/program-levels/" + id, data))
    ).data;
  },
};
export const admissionService = {
  async course({ id }: { id: number }, signal?: AbortSignal) {
    return (
      await api.get<CourseAdmission>(base + "/courses/" + id + "/admission", {
        signal,
      })
    ).data;
  },
  async confirm(id: number, data: AdmissionConfirm) {
    return (
      await api.put<CourseAdmission>(
        base + "/courses/" + id + "/admission",
        data,
      )
    ).data;
  },
  async courseHistory(
    { id }: { id: number; revision?: number },
    signal?: AbortSignal,
  ) {
    return (
      await api.get<AdmissionPolicy[]>(
        base + "/courses/" + id + "/admission/history",
        { signal },
      )
    ).data;
  },
  async schoolClass({ id }: { id: number }, signal?: AbortSignal) {
    return (
      await api.get<ClassAdmission>(base + "/classes/" + id + "/admission", {
        signal,
      })
    ).data;
  },
  async applyClass(
    id: number,
    data: {
      expectedRevision: number;
      expectedCourseRevision: number;
      reason: string;
    },
  ) {
    return (
      await api.put<ClassAdmission>(
        base + "/classes/" + id + "/admission",
        data,
      )
    ).data;
  },
  async classHistory(
    { id }: { id: number; revision: number },
    signal?: AbortSignal,
  ) {
    return (
      await api.get<ClassAdmissionChange[]>(
        base + "/classes/" + id + "/admission/history",
        { signal },
      )
    ).data;
  },
};
const assessmentRoot = (studentId: number) =>
  base + "/students/" + studentId + "/assessments";
export const assessmentService = {
  async list(
    {
      studentId,
      ...params
    }: {
      studentId: number;
      page: number;
      size: number;
      programId?: number;
      status?: AssessmentStatus;
    },
    signal?: AbortSignal,
  ) {
    return (
      await api.get<PageResponse<Assessment>>(assessmentRoot(studentId), {
        params,
        signal,
      })
    ).data;
  },
  async current(
    { studentId }: { studentId: number; revision: number },
    signal?: AbortSignal,
  ) {
    return (
      await api.get<Assessment[]>(assessmentRoot(studentId) + "/current", {
        signal,
      })
    ).data;
  },
  async detail(studentId: number, id: number) {
    return (await api.get<Assessment>(assessmentRoot(studentId) + "/" + id))
      .data;
  },
  async save(studentId: number, id: number | null, data: AssessmentDraft) {
    return (
      await (id === null
        ? api.post<Assessment>(assessmentRoot(studentId), data)
        : api.put<Assessment>(assessmentRoot(studentId) + "/" + id, data))
    ).data;
  },
  async action(
    studentId: number,
    id: number,
    action: "confirm" | "revoke",
    data: { version: number; reason: string; expectedCurrentId: number | null },
  ) {
    return (
      await api.post<Assessment>(
        assessmentRoot(studentId) + "/" + id + "/" + action,
        data,
      )
    ).data;
  },
  async history(
    { studentId, id }: { studentId: number; id: number | null },
    signal?: AbortSignal,
  ) {
    return id === null
      ? []
      : (
          await api.get<AssessmentEvent[]>(
            assessmentRoot(studentId) + "/" + id + "/history",
            { signal },
          )
        ).data;
  },
};
