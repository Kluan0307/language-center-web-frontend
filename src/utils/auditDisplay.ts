export type AuditFields = Record<string, unknown>;
export type AuditRecord = { state: 'empty' | 'parsed' | 'unsupported'; fields: AuditFields };

function splitFields(value: string, delimiter: string): string[] | null {
  let depth = 0, start = 0; const result: string[] = [];
  for (let i = 0; i < value.length; i++) {
    if (value[i] === '[' || value[i] === '{' || value[i] === '(') depth++;
    if (value[i] === ']' || value[i] === '}' || value[i] === ')') depth--;
    if (depth < 0) return null;
    if (depth === 0 && value[i] === delimiter && /^\s*[A-Za-z]\w*=/.test(value.slice(i + 1))) {
      result.push(value.slice(start, i).trim()); start = i + 1;
    }
  }
  if (depth !== 0) return null;
  result.push(value.slice(start).trim()); return result;
}
/** Read both JSON snapshots and historical Java record/session strings without evaluating them. */
export function readAuditRecord(value: string | null | undefined): AuditRecord {
  if (!value?.trim() || value.trim() === 'NONE') return { state: 'empty', fields: {} };
  const text = value.trim();
  try {
    const parsed: unknown = JSON.parse(text);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return { state: 'parsed', fields: parsed as AuditFields };
  } catch { /* Historical snapshots were stored as Java strings. */ }
  const record = /^[A-Za-z][\w.$]*\[([\s\S]*)\]$/.exec(text);
  const body = record ? record[1] : text;
  if (!record && !/^date=/.test(body)) return { state: 'unsupported', fields: {} };
  const parts = splitFields(body, record ? ',' : ';');
  if (!parts) return { state: 'unsupported', fields: {} };
  const fields: AuditFields = {};
  for (const part of parts) {
    const match = /^([A-Za-z]\w*)=([\s\S]*)$/.exec(part);
    if (!match || Object.hasOwn(fields, match[1])) return { state: 'unsupported', fields: {} };
    fields[match[1]] = match[2] === 'null' ? null : match[2];
  }
  return { state: 'parsed', fields };
}
const values: Record<string, string> = {
  ACTIVE: 'Đang làm việc', INACTIVE: 'Ngừng làm việc', SCHEDULED: 'Đã xếp lịch',
  COMPLETED: 'Đã hoàn tất', CANCELLED: 'Đã hủy', REGULAR: 'Buổi theo lịch', MAKEUP: 'Học bù', LEGACY: 'Buổi từ dữ liệu cũ',
  DRAFT: 'Bản nháp', CONFIRMED: 'Đã xác nhận', REVOKED: 'Đã thu hồi', SUPERSEDED: 'Đã thay thế',
  TEST: 'Bài kiểm tra', INTERVIEW: 'Phỏng vấn', CERTIFICATE: 'Chứng chỉ', OTHER: 'Nguồn khác',
  OPEN_ENTRY: 'Không yêu cầu đánh giá đầu vào', REQUIRES_ASSESSMENT: 'Yêu cầu đánh giá đầu vào', UNVERIFIED: 'Chưa xác nhận',
};
export function auditValue(value: unknown): string {
  if (value === null || value === undefined || value === '' || value === 'null') return '—';
  if (Array.isArray(value)) return value.length ? value.map(auditValue).join(', ') : 'Không yêu cầu';
  if (typeof value === 'object') {
    const data = value as AuditFields;
    return auditValue(data.name ?? data.levelName ?? data.code);
  }
  const text = String(value);
  if (text === 'true') return 'Có'; if (text === 'false') return 'Không';
  if (values[text]) return values[text];
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text.split('-').reverse().join('/');
  if (/^\d{2}:\d{2}:00(?:\.0+)?$/.test(text)) return text.slice(0, 5);
  if (/^(?:Level|LevelSnapshot)\[/.test(text)) {
    const data = readAuditRecord(text); return data.state === 'parsed' ? auditValue(data.fields.name ?? data.fields.code) : 'Chưa đọc được thông tin';
  }
  if (text.startsWith('[') && text.endsWith(']')) {
    if (text === '[]') return 'Không yêu cầu';
    const matches = [...text.matchAll(/name=([^\]]*)\]/g)];
    return matches.length ? matches.map(m => m[1]).join(', ') : 'Chưa đọc được thông tin';
  }
  return text;
}
export const AUDIT_LABELS: Record<string, string> = {
  fullName: 'Họ tên', email: 'Email', phone: 'Điện thoại', specialization: 'Chuyên môn', qualification: 'Bằng cấp',
  experience: 'Kinh nghiệm', certificate: 'Chứng chỉ', hireDate: 'Ngày vào làm', workStatus: 'Trạng thái làm việc',
  date: 'Ngày học', sessionDate: 'Ngày học', time: 'Giờ học', startTime: 'Giờ bắt đầu', endTime: 'Giờ kết thúc',
  room: 'Phòng học', roomName: 'Phòng học', plannedTeacher: 'Giáo viên kế hoạch', teacher: 'Giáo viên thực tế',
  teacherName: 'Giáo viên', status: 'Trạng thái', kind: 'Loại buổi', source: 'Căn cứ',
  makeupFor: 'Buổi học gốc', makeupChild: 'Buổi học bù', customized: 'Đã điều chỉnh riêng',
  programName: 'Chương trình', programCode: 'Mã chương trình', levelName: 'Trình độ', levelCode: 'Mã trình độ',
  method: 'Phương thức', assessedOn: 'Ngày đánh giá', assessorName: 'Người đánh giá', score: 'Điểm', maxScore: 'Thang điểm',
  recordedByName: 'Người ghi nhận', confirmedByName: 'Người xác nhận', confirmedAt: 'Thời điểm xác nhận',
  mode: 'Điều kiện đầu vào', outputLevel: 'Trình độ đầu ra', acceptedLevels: 'Trình độ đầu vào được chấp nhận', reason: 'Lý do',
};
