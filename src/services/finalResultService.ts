import { api } from "../api/axiosInstance";
import type { EvaluationReport } from "./evaluationService";
import type { EnrollmentDto } from "../types/admissions";
export type FinalSummary = {
  id: number;
  classId: number;
  enrollmentId: number;
  studentId: number;
  revision: number;
  state: "CONFIRMED" | "REOPENED";
  outcome: "PASS" | "FAIL";
  confirmedAt: string;
  confirmedByName: string;
  reason: string;
};
export type ClassFinals = {
  classId: number;
  resultRevision: number;
  results: FinalSummary[];
};
export type FinalPreview = {
  enrollmentId: number;
  evaluation: EvaluationReport["students"][number];
  policy: import("./evaluationService").EvaluationPolicy | null;
  duration: EvaluationReport["duration"];
  fingerprint: string;
  blockers: string[];
  current: FinalSummary | null;
  resultRevision: number;
};
export type FinalHistory = FinalSummary & {
  snapshot: string;
  reopenedAt?: string;
  reopenedByName?: string;
  reopenReason?: string;
};
export type Closure = {
  classId: number;
  revision: number;
  closed: boolean;
  verification: string;
  history: {
    revision: number;
    closed: boolean;
    actorName: string;
    changedAt: string;
    reason: string;
  }[];
};
export const finalResultService = {
  async request(classId: number, requestId: string): Promise<FinalSummary> {
    return (
      await api.get(
        "/teaching/classes/" + classId + "/final-results/requests/" + requestId,
      )
    ).data;
  },
  async list(
    { classId }: { classId: number | null },
    signal?: AbortSignal,
  ): Promise<ClassFinals | null> {
    return classId === null
      ? null
      : (
          await api.get("/teaching/classes/" + classId + "/final-results", {
            signal,
          })
        ).data;
  },
  async preview(
    { classId, enrollmentId }: { classId: number; enrollmentId: number },
    signal?: AbortSignal,
  ): Promise<FinalPreview> {
    return (
      await api.post(
        "/teaching/classes/" +
          classId +
          "/final-results/" +
          enrollmentId +
          "/preview",
        undefined,
        { signal },
      )
    ).data;
  },
  async confirm(
    classId: number,
    enrollmentId: number,
    body: { requestId: string; fingerprint: string; reason: string },
  ): Promise<FinalSummary> {
    return (
      await api.post(
        "/teaching/classes/" +
          classId +
          "/final-results/" +
          enrollmentId +
          "/confirm",
        body,
      )
    ).data;
  },
  async history(
    { classId, enrollmentId }: { classId: number; enrollmentId: number | null },
    signal?: AbortSignal,
  ): Promise<FinalHistory[]> {
    return enrollmentId === null
      ? []
      : (
          await api.get(
            "/teaching/classes/" +
              classId +
              "/final-results/" +
              enrollmentId +
              "/history",
            { signal },
          )
        ).data;
  },
  async reopen(
    classId: number,
    body: { requestId: string; expectedRevision: number; reason: string },
  ) {
    return (
      await api.post<ClassFinals>(
        "/teaching/classes/" + classId + "/final-results/reopen",
        body,
      )
    ).data;
  },
  async complete(record: EnrollmentDto, result: FinalSummary, reason: string) {
    return (
      await api.patch<EnrollmentDto>(
        "/academic/enrollments/" + record.id + "/status",
        {
          studyStatus: "COMPLETED",
          version: record.version,
          reason,
          finalResultId: result.id,
          finalResultRevision: result.revision,
        },
      )
    ).data;
  },
  async closure(
    { classId }: { classId: number },
    signal?: AbortSignal,
  ): Promise<Closure> {
    return (
      await api.get("/academic/classes/" + classId + "/closure", { signal })
    ).data;
  },
  async changeClosure(
    classId: number,
    close: boolean,
    body: { requestId: string; expectedRevision: number; reason: string },
  ) {
    return (
      await api.post<Closure>(
        "/academic/classes/" + classId + (close ? "/close" : "/reopen"),
        body,
      )
    ).data;
  },
};
export type LearningProfile = {
  student: {
    id: number;
    fullName: string;
    branchId: number;
    currentLevel: string;
  };
  observedAt: string;
  studies: {
    enrollment: EnrollmentDto;
    periods: { activeFrom: string; activeUntil: string | null }[];
    recordedAttendance: Record<string, number>;
    resultVerification: string;
  }[];
};
export const learningProfileService = {
  async get(
    { studentId }: { studentId: number },
    signal?: AbortSignal,
  ): Promise<LearningProfile> {
    return (
      await api.get("/academic/students/" + studentId + "/learning-profile", {
        signal,
      })
    ).data;
  },
};
