import type { LeadState, StudyState, StudentState, DeliveryState } from '../types/admissions';
export const LEAD_LABELS: Record<LeadState, string> = {
  NEW: 'Mới', CONTACTED: 'Đã liên hệ', CONSULTING: 'Đang tư vấn', CONVERTED: 'Đã chuyển đổi', LOST: 'Không tiềm năng',
};
export const STUDENT_LABELS: Record<StudentState, string> = { STUDYING: 'Đang học', PAUSED: 'Tạm ngừng', GRADUATED: 'Đã hoàn thành' };
export const STUDY_LABELS: Record<StudyState, string> = {
  STUDYING: 'Đang học', RESERVED: 'Bảo lưu', DROPPED: 'Đã ngừng học', COMPLETED: 'Hoàn thành', TRANSFERRED: 'Đã chuyển lớp',
};
export const DELIVERY_LABELS: Record<DeliveryState, string> = { PENDING: 'Chờ tạo học phí', CREATED: 'Đã tạo học phí', FAILED: 'Tạo học phí lỗi' };
export const canConvertLead = (state: LeadState) => state === 'CONTACTED' || state === 'CONSULTING';
export function nextStudyStates(state: StudyState): Exclude<StudyState, 'TRANSFERRED'>[] {
  if (state === 'STUDYING') return ['RESERVED', 'COMPLETED', 'DROPPED'];
  return state === 'RESERVED' ? ['STUDYING', 'DROPPED'] : [];
}
export const positiveId = (value: string | null) => {
  const parsed = Number(value);
  return value !== null && Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
};
export const optionalText = (value?: string | null) => value?.trim() || undefined;

export function existingClassEnrollment(rows: { classId: number; studyStatus: StudyState; id: number }[], classId: number | undefined) {
  return rows.find((e) => e.classId === classId && (e.studyStatus === 'STUDYING' || e.studyStatus === 'RESERVED'));
}
