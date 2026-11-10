import { api } from "../api/axiosInstance";
export interface RuleSnapshot {
  examId: number;
  examVersion: number;
  examName: string;
  examDate: string;
  required: boolean;
  weight: number;
  maxScore: number;
}
export interface EvaluationPolicy {
  id: number;
  classId: number;
  branchId: number;
  courseId: number;
  revision: number;
  passPercent: number;
  minAttendancePercent: number | null;
  rules: RuleSnapshot[];
  actorName: string;
  confirmedAt: string;
  reason: string;
}
export interface PolicyView {
  classId: number;
  revision: number;
  status: string;
  canManage: boolean;
  policy: EvaluationPolicy | null;
}
export interface RuleInput {
  examId: number;
  expectedExamVersion: number;
  required: boolean;
  weight: number;
}
export interface EvaluationRow {
  enrollmentId: number;
  studentId: number;
  studentName: string;
  studyStatus: string;
  averagePercent: number | null;
  unroundedAveragePercent: number | null;
  passed: boolean | null;
  status: "PASS" | "FAIL" | "INSUFFICIENT";
  gradedExams: number;
  applicableExams: number;
  missingRequiredExams: number;
  attendance: {
    status: string;
    percent: number | null;
    attended: number;
    expected: number;
    excusedAbsences: number;
    missingRecords: number;
  };
  exams: (Omit<RuleSnapshot, "examVersion"> & {
    applicability: string;
    gradeStatus: string;
    score: number | null;
    percent: number | null;
  })[];
  reasons: { code: string; message: string }[];
}
export interface EvaluationReport {
  classId: number;
  policyRevision: number;
  policyStatus: string;
  students: EvaluationRow[];
  passRate: number | null;
  assessableCount: number;
  insufficientCount: number;
  passedCount: number;
  failedCount: number;
  generatedAt: string;
  warnings: { code: string; message: string }[];
  duration: {
    expectedMinutes: number | null;
    taughtMinutes: number | null;
    scheduledMinutes: number | null;
    timeReadyForClosure: boolean;
  } | null;
}
export const evaluationService = {
  async policy(
    { classId }: { classId: number },
    signal?: AbortSignal,
  ): Promise<PolicyView> {
    return (
      await api.get("/teaching/classes/" + classId + "/evaluation-policy", {
        signal,
      })
    ).data;
  },
  async history(
    { classId }: { classId: number; revision: number },
    signal?: AbortSignal,
  ): Promise<EvaluationPolicy[]> {
    return (
      await api.get(
        "/teaching/classes/" + classId + "/evaluation-policy/history",
        { signal },
      )
    ).data;
  },
  async confirm(
    classId: number,
    data: {
      expectedRevision: number;
      passPercent: number;
      minAttendancePercent: number | null;
      exams: RuleInput[];
      reason: string;
    },
  ): Promise<PolicyView> {
    return (
      await api.put("/teaching/classes/" + classId + "/evaluation-policy", data)
    ).data;
  },
  async preview(
    {
      classId,
      enabled,
    }: { classId: number; revision: number; enabled: boolean },
    signal?: AbortSignal,
  ): Promise<EvaluationReport | null> {
    return enabled
      ? (
          await api.get(
            "/teaching/classes/" + classId + "/evaluation-preview",
            { signal },
          )
        ).data
      : null;
  },
};
