import { api } from "../api/axiosInstance";
import type { PageResponse } from "../types/api";
import type { AdmissionPolicy, Assessment } from "../types/placement";
export type PlacementIntent = "ENROLL" | "TRANSFER" | "RESUME";
export interface PlacementContext {
  studentId: number;
  classId: number;
  intent: PlacementIntent;
  sourceEnrollmentId: number | null;
}
export interface PlacementPreview {
  context: PlacementContext;
  classCode: string;
  className: string;
  branchId: number;
  studentName: string;
  legacyLevel: string | null;
  classRevision: number;
  policy: AdmissionPolicy;
  assessment: Assessment | null;
  academicStatus: string;
  blockers: { code: string; message: string }[];
  eligible: boolean;
  canRequestException: boolean;
  fingerprint: string;
  sourceVersion: number | null;
  reusedDecisionId: number | null;
  currentSize: number;
  maxSize: number;
}
export interface PlacementException {
  id: number;
  version: number;
  context: PlacementContext;
  branchId: number;
  studentName: string;
  classCode: string;
  status: string;
  storedStatus: string;
  fingerprint: string;
  academicStatus: string;
  requestedReason: string;
  requestedByName: string;
  requestedAt: string;
  decisionReason: string | null;
  decidedByName: string | null;
  decidedAt: string | null;
  consumedEnrollmentId: number | null;
  consumedAt: string | null;
  requestedPolicy: AdmissionPolicy;
  requestedAssessment: Assessment | null;
  policyId: number | null;
  classRevision: number;
  assessmentId: number | null;
  assessmentVersion: number | null;
  sourceVersion: number | null;
}
export interface AdmissionEvidence {
  id: number;
  academicStatus: string;
  intent: PlacementIntent;
  policyId: number | null;
  classRevision: number;
  assessmentId: number | null;
  assessmentVersion: number | null;
  approvalId: number | null;
  reusedDecisionId: number | null;
  policySnapshot: string;
  assessmentSnapshot: string;
  actorName: string;
  acceptedAt: string;
}
export const placementGate = {
  async preview(
    { context }: { context: PlacementContext | null },
    signal?: AbortSignal,
  ): Promise<PlacementPreview | null> {
    return context
      ? (await api.post("/academic/enrollments/preview", context, { signal }))
          .data
      : null;
  },
  async suggestions(
    { studentId, page }: { studentId: number | null; page: number },
    signal?: AbortSignal,
  ): Promise<PageResponse<PlacementPreview> | null> {
    return studentId
      ? (
          await api.get("/academic/enrollments/suggestions", {
            params: { studentId, page, size: 5 },
            signal,
          })
        ).data
      : null;
  },
  async list(
    params: {
      studentId?: number;
      classId?: number;
      branchId?: number;
      page: number;
      size: number;
    },
    signal?: AbortSignal,
  ): Promise<PageResponse<PlacementException>> {
    return (await api.get("/academic/placement-exceptions", { params, signal }))
      .data;
  },
  async get(id: number): Promise<PlacementException> {
    return (await api.get("/academic/placement-exceptions/" + id)).data;
  },
  async request(
    context: PlacementContext,
    fingerprint: string,
    reason: string,
  ): Promise<PlacementException> {
    return (
      await api.post("/academic/placement-exceptions", {
        context,
        fingerprint,
        reason,
      })
    ).data;
  },
  async decide(
    id: number,
    version: number,
    approve: boolean,
    reason: string,
  ): Promise<PlacementException> {
    return (
      await api.post("/academic/placement-exceptions/" + id + "/decision", {
        version,
        approve,
        reason,
      })
    ).data;
  },
  async history(
    { id }: { id: number },
    signal?: AbortSignal,
  ): Promise<AdmissionEvidence[]> {
    return (
      await api.get("/academic/enrollments/" + id + "/admission-history", {
        signal,
      })
    ).data;
  },
};
