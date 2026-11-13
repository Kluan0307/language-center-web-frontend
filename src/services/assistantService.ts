import axios from 'axios';
import { api } from '../api/axiosInstance';
import type { AssistantConfig, AssistantRequest, AssistantScope } from '../types/assistant';
import { assistantFailure, object, parseAssistantResponse } from '../utils/assistant';

export interface AssistantSession { token: string; branchId: number | null }
const headers = (session: AssistantSession) => ({ Authorization: `Bearer ${session.token}`, ...(session.branchId ? { 'X-Branch-Id': String(session.branchId) } : {}) });
export const assistantService = {
  async config(session: AssistantSession, signal: AbortSignal): Promise<AssistantConfig> {
    const { data } = await api.get('/assistant/config', { signal, headers: headers(session), timeout: 8000 });
    const c = object(data);
    if (typeof c.enabled !== 'boolean' || c.readOnly !== true || typeof c.role !== 'string' || c.maxMessageLength !== 2000) throw Error('INVALID_ASSISTANT_CONFIG');
    return data;
  },
  async chat(request: AssistantRequest, scope: AssistantScope, session: AssistantSession, signal: AbortSignal) {
    const { data } = await api.post('/assistant/chat', request, { signal, headers: headers(session), timeout: 35000 });
    return parseAssistantResponse(data, request.requestId, scope);
  },
  async remove(id: string, session: AssistantSession, signal: AbortSignal) {
    await api.delete(`/assistant/conversations/${encodeURIComponent(id)}`, { signal, headers: headers(session), timeout: 8000 });
  },
};
export function chatFailure(error: unknown, operation: 'chat' | 'config' = 'chat') {
  if (!axios.isAxiosError(error)) return assistantFailure(undefined, undefined, undefined, operation);
  return assistantFailure(error.response?.status, object(error.response?.data).code, error.response?.headers?.['retry-after'], operation);
}
