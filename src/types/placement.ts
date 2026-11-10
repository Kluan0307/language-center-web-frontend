export interface Program {
  id: number;
  version: number;
  code: string;
  name: string;
  active: boolean;
}
export interface ProgramLevel extends Program {
  programId: number;
  rank: number;
}
export interface ProgramRequest {
  code: string;
  name: string;
  active: boolean;
  version?: number;
}
export interface LevelRequest extends ProgramRequest {
  rank: number;
}
export type AdmissionMode = "UNVERIFIED" | "OPEN_ENTRY" | "REQUIRES_ASSESSMENT";
export interface LevelSnapshot {
  levelId: number;
  code: string;
  name: string;
}
export interface AdmissionPolicy {
  id: number | null;
  courseId: number;
  revision: number;
  mode: AdmissionMode;
  programId: number | null;
  programCode: string | null;
  programName: string | null;
  outputLevel: LevelSnapshot | null;
  acceptedLevels: LevelSnapshot[];
  confirmedBy: number | null;
  confirmedByName: string | null;
  confirmedAt: string | null;
  reason: string | null;
}
export interface CourseAdmission {
  policy: AdmissionPolicy;
  canManage: boolean;
  legacyType: string | null;
  legacyLevel: string | null;
  legacyEntryRequirement: string | null;
}
export interface ClassAdmission {
  classId: number;
  revision: number;
  policy: AdmissionPolicy;
  canManage: boolean;
}
export interface AdmissionConfirm {
  expectedRevision: number;
  programId: number;
  outputLevelId: number;
  mode: Exclude<AdmissionMode, "UNVERIFIED">;
  acceptedLevelIds: number[];
  reason: string;
}
export interface ClassAdmissionChange {
  id: number;
  revision: number;
  oldPolicyId: number | null;
  newPolicyId: number | null;
  actorName: string;
  occurredAt: string;
  reason: string;
}
export type AssessmentMethod = "TEST" | "INTERVIEW" | "CERTIFICATE" | "OTHER";
export type AssessmentStatus = "DRAFT" | "CONFIRMED" | "SUPERSEDED" | "REVOKED";
export interface Assessment {
  id: number;
  version: number;
  studentId: number;
  branchId: number;
  programId: number;
  programCode: string;
  programName: string;
  levelId: number;
  levelCode: string;
  levelName: string;
  method: AssessmentMethod;
  status: AssessmentStatus;
  assessedOn: string;
  assessorName: string;
  source: string;
  score: number | null;
  maxScore: number | null;
  recordedBy: number;
  recordedByName: string;
  confirmedBy: number | null;
  confirmedByName: string | null;
  confirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
  supersedesId: number | null;
  supersededById: number | null;
}
export interface AssessmentDraft {
  version?: number;
  programId: number;
  levelId: number;
  method: AssessmentMethod;
  assessedOn: string;
  assessorName: string;
  source: string;
  score?: number | null;
  maxScore?: number | null;
  reason?: string;
}
export interface AssessmentEvent {
  id: number;
  action: string;
  beforeState: string;
  afterState: string;
  reason: string | null;
  actorName: string;
  occurredAt: string;
  assessmentVersion: number;
}
