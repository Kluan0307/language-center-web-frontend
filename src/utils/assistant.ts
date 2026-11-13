import type { Role } from '../types/auth';
import type { AssistantFailure, AssistantResponse, AssistantScope } from '../types/assistant';

export function object(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
const positive = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) > 0;
const uuid = (value: unknown): value is string => typeof value === 'string' && /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(value);
const statuses = ['ANSWER', 'NO_RESULTS', 'CLARIFICATION_REQUIRED', 'OUT_OF_SCOPE', 'UNSUPPORTED_CAPABILITY', 'UNSUPPORTED_ACTION'];
const words = (value: unknown, max = 2000): value is string => typeof value === 'string' && value.length <= max;

export function parseAssistantResponse(value: unknown, requestId: string, expected: AssistantScope): AssistantResponse {
  const r = object(value), scope = object(r.scope);
  if (r.requestId !== requestId || !uuid(r.conversationId) || !statuses.includes(String(r.status))
    || !words(r.message) || !Number.isFinite(Date.parse(String(r.observedAt)))
    || scope.mode !== expected.mode || !words(scope.label, 300) || !Array.isArray(scope.branchIds)
    || scope.branchIds.some(id => !positive(id)) || [...scope.branchIds].sort().join(',') !== [...expected.branchIds].sort().join(',')
    || !Array.isArray(r.cards) || r.cards.length > 4 || r.cards.some(c => !words(object(c).tool, 64) || !words(object(c).title, 120))
    || !Array.isArray(r.choices) || r.choices.length > 5 || r.choices.some(c => !['STUDENT', 'CLASS', 'SESSION'].includes(String(object(c).type)) || !positive(object(c).id) || !words(object(c).label, 700) || !words(object(c).code, 120) || !(object(c).branchId === null || positive(object(c).branchId)))
    || !Array.isArray(r.warnings) || r.warnings.length > 10 || r.warnings.some(w => !words(w, 1000))
    || !Array.isArray(r.sources) || r.sources.length > 4 || r.sources.some(s => !words(object(s).tool, 64) || !Number.isFinite(Date.parse(String(object(s).observedAt))))
    || typeof r.hasMore !== 'boolean' || !(r.nextPage === null || Number.isSafeInteger(r.nextPage) && Number(r.nextPage) >= 0)) throw Error('INVALID_ASSISTANT_RESPONSE');
  return value as AssistantResponse;
}

const ops: Role[] = ['SUPER_ADMIN', 'ADMIN', 'STAFF'];
const routes: Record<string, { roles: Role[]; keys: string[] }> = {
  '/courses': { roles: ops, keys: ['keyword', 'branchId'] }, '/classes': { roles: ops, keys: ['classId', 'branchId'] },
  '/students': { roles: ops, keys: ['studentId', 'branchId'] }, '/schedule': { roles: ops, keys: ['sessionId', 'branchId'] },
  '/tuition': { roles: ops, keys: ['tuitionId', 'branchId'] }, '/payments': { roles: ops, keys: ['paymentId', 'branchId'] },
  '/leads': { roles: ops, keys: ['leadId', 'branchId'] }, '/my-classes': { roles: ['TEACHER'], keys: ['classId', 'branchId'] },
  '/my-schedule': { roles: ['TEACHER'], keys: ['sessionId', 'branchId'] },
  '/grades': { roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER'], keys: ['examId', 'branchId'] },
  '/attendance': { roles: ['SUPER_ADMIN', 'ADMIN', 'STAFF', 'TEACHER'], keys: ['sessionId', 'branchId'] },
};
export function assistantDestination(value: unknown, role: Role, currentBranch: number | null, assigned: number[], rowBranch?: unknown): { href: string; branchId: number | null; switchBranch: boolean } | null {
  if (typeof value !== 'string' || value.length > 700 || !value.startsWith('/') || /[\\\p{Cc}\p{Cf}]/u.test(value)) return null;
  try {
    const url = new URL(value, 'https://local.invalid'), rule = routes[url.pathname];
    if (url.origin !== 'https://local.invalid' || url.hash || !rule?.roles.includes(role) || /%/.test(url.pathname) || value.split('?')[0] !== url.pathname) return null;
    const seen = new Set<string>();
    for (const [key, v] of url.searchParams) {
      if (!rule.keys.includes(key) || seen.has(key) || /[\p{Cc}\p{Cf}<>]/u.test(v)) return null;
      seen.add(key);
      if (key === 'keyword' ? v.length > 120 || /https?:|javascript:|bearer\s|api key/i.test(v) : !/^[1-9]\d{0,14}$/.test(v)) return null;
    }
    const queryBranch = url.searchParams.has('branchId') ? Number(url.searchParams.get('branchId')) : null;
    if (rowBranch !== undefined && rowBranch !== null && !positive(rowBranch)) return null;
    if (queryBranch && positive(rowBranch) && queryBranch !== rowBranch) return null;
    const branchId = queryBranch ?? (positive(rowBranch) ? rowBranch : currentBranch);
    if (role !== 'SUPER_ADMIN' && branchId !== null && !assigned.includes(branchId)) return null;
    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN' && branchId !== currentBranch) return null;
    if (branchId) url.searchParams.set('branchId', String(branchId));
    return { href: url.pathname + url.search, branchId, switchBranch: role === 'ADMIN' && branchId !== currentBranch };
  } catch { return null; }
}

export function assistantFailure(status: number | undefined, code: unknown, retryAfter?: unknown, operation: 'chat' | 'config' = 'chat'): AssistantFailure {
  const reset = operation === 'chat' && (status === 404 && code === 'CONVERSATION_NOT_FOUND'
    || status === 409 && (code === 'CONTEXT_CHANGED' || code === 'SESSION_CHANGED'));
  const seconds = Number(retryAfter);
  const wait = status === 429 || status === 503 && (code === 'MODEL_BUSY' || code === 'MODEL_COOLDOWN')
    ? Number.isFinite(seconds) && seconds > 0 ? Math.min(300, Math.ceil(seconds)) : status === 429 ? 60 : 30 : 0;
  const message = (operation === 'config' && (status === 404 || status === 409)) || status === 404 && !code ? 'Chưa kết nối được dịch vụ trợ lý. Vui lòng kiểm tra lại kết nối.'
    : reset ? 'Hội thoại đã hết hạn hoặc phạm vi đã thay đổi. Hãy bắt đầu hội thoại mới.'
    : status === 401 ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
    : status === 403 ? 'Bạn không có quyền tra cứu thông tin này trong phạm vi đang chọn.'
    : status === 429 ? 'Trợ lý đang đạt giới hạn sử dụng. Vui lòng chờ trước khi thử lại.'
    : status === 404 ? 'Không tìm thấy dữ liệu phù hợp trong phạm vi đang chọn.'
    : status === 409 && code === 'CONVERSATION_BUSY' ? 'Hội thoại đang xử lý. Vui lòng chờ rồi thử lại.'
    : status === 409 ? 'Yêu cầu đã thay đổi. Hãy gửi lại thành câu hỏi mới.'
    : status === 400 || status === 413 ? 'Nội dung chưa hợp lệ. Hãy rút gọn hoặc nêu rõ yêu cầu hơn.'
    : status === 503 && (code === 'MODEL_BUSY' || code === 'MODEL_COOLDOWN') ? 'Dịch vụ AI đang bận hoặc tạm thời gián đoạn. Vui lòng chờ rồi thử lại.'
    : status === 503 && code === 'MODEL_CREDENTIAL_REJECTED' ? 'Dịch vụ AI chưa thể xác thực. Vui lòng liên hệ quản trị viên.'
    : status === 503 && code === 'MODEL_NOT_FOUND' ? 'Model AI hiện không khả dụng. Vui lòng liên hệ quản trị viên.'
    : status === 503 ? 'Trợ lý hiện chưa sẵn sàng. Bạn vẫn có thể dùng các trang nghiệp vụ.'
    : status === 504 && code === 'MODEL_TIMEOUT' ? 'Dịch vụ AI chưa phản hồi kịp. Vui lòng thử lại sau ít phút.'
    : status === 504 ? 'Tra cứu mất quá nhiều thời gian. Bạn có thể thử lại hoặc thu hẹp câu hỏi.'
    : 'Chưa nhận được kết quả. Kiểm tra kết nối rồi thử lại.';
  const conflict = operation === 'chat' && status === 409 && code !== 'CONVERSATION_BUSY';
  const missingResource = operation === 'chat' && status === 404 && !!code;
  return { message, retryAfter: wait, reset, retryable: !reset && !conflict && !missingResource && ![400, 401, 403, 413, 415].includes(status ?? 0) };
}

export function assistantRows(value: unknown, depth = 0): Record<string, unknown>[] {
  if (depth > 5) return [];
  const data = object(value);
  if (Array.isArray(data.content)) return data.content.slice(0, 20).map(object);
  if (data.records) return assistantRows(data.records, depth + 1);
  return Object.keys(data).length ? [data] : [];
}

export function sampleQuestions(role: Role): string[] {
  return role === 'TEACHER' ? ['Tuần này tôi dạy những buổi nào?', 'Tìm học viên An trong lớp của tôi.', 'Cách mở lịch tuần?']
    : ['Khóa giao tiếp dưới 5 triệu?', 'Tổng số học viên trong phạm vi đang xem?', 'Top 5 khách hàng cần ưu tiên chăm sóc?'];
}
