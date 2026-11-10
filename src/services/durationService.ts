import { api } from "../api/axiosInstance";
export interface CourseDuration {
  courseId: number;
  revision: number;
  expectedMinutes: number | null;
  legacyDuration: number | null;
  verified: boolean;
  canManage: boolean;
}
export interface ClassDuration {
  classId: number;
  revision: number;
  expectedMinutes: number | null;
  verified: boolean;
  canManage: boolean;
  course: CourseDuration;
}
export interface DurationHistory {
  id: number;
  revision: number;
  expectedMinutes: number | null;
  source?: "COURSE" | "CUSTOM" | "UNVERIFIED";
  courseRevision?: number | null;
  actorName: string;
  occurredAt: string;
  reason: string;
}
export interface DurationProgress {
  classId: number;
  classCode: string;
  planRevision: number;
  expectedMinutes: number | null;
  scheduledMinutes: number | null;
  taughtMinutes: number | null;
  knownScheduledMinutes: number;
  knownTaughtMinutes: number;
  scheduledSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  unfinishedSessions: number;
  overdueSessions: number;
  unknownActiveSessions: number;
  unknownCompletedSessions: number;
  invalidMakeupSessions: number;
  dataState: "KNOWN" | "UNKNOWN";
  scheduledDifferenceMinutes: number | null;
  remainingTaughtMinutes: number | null;
  timeReadyForClosure: boolean;
  warnings: { code: string; message: string }[];
}
export const durationService = {
  async course(
    { id }: { id: number },
    signal?: AbortSignal,
  ): Promise<CourseDuration> {
    return (
      await api.get("/academic/courses/" + id + "/duration-plan", { signal })
    ).data;
  },
  async courseHistory(
    { id }: { id: number; revision: number },
    signal?: AbortSignal,
  ): Promise<DurationHistory[]> {
    return (
      await api.get("/academic/courses/" + id + "/duration-history", { signal })
    ).data;
  },
  async saveCourse(
    id: number,
    data: { expectedRevision: number; expectedMinutes: number; reason: string },
  ): Promise<CourseDuration> {
    return (await api.put("/academic/courses/" + id + "/duration-plan", data))
      .data;
  },
  async schoolClass(
    { id }: { id: number },
    signal?: AbortSignal,
  ): Promise<ClassDuration> {
    return (
      await api.get("/academic/classes/" + id + "/duration-plan", { signal })
    ).data;
  },
  async classHistory(
    { id }: { id: number; revision: number },
    signal?: AbortSignal,
  ): Promise<DurationHistory[]> {
    return (
      await api.get("/academic/classes/" + id + "/duration-history", { signal })
    ).data;
  },
  async saveClass(
    id: number,
    data: {
      expectedRevision: number;
      source: "COURSE" | "CUSTOM";
      expectedMinutes?: number;
      expectedCourseRevision?: number;
      reason: string;
    },
  ): Promise<ClassDuration> {
    return (await api.put("/academic/classes/" + id + "/duration-plan", data))
      .data;
  },
  async progress(
    { id }: { id: number; revision: number },
    signal?: AbortSignal,
  ): Promise<DurationProgress> {
    return (
      await api.get("/academic/classes/" + id + "/duration-progress", {
        signal,
      })
    ).data;
  },
};
