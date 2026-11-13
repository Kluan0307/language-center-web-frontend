export type AssistantScopeMode = 'ACTIVE_BRANCH' | 'ALL_ASSIGNED' | 'WHOLE_SYSTEM';
export interface AssistantScope { mode: AssistantScopeMode; branchIds: number[]; label: string }
export interface AssistantConfig { enabled: boolean; readOnly: boolean; role: string; maxMessageLength: number; conversationTtlMinutes: number }
export interface AssistantChoice { type: 'STUDENT' | 'CLASS' | 'SESSION'; id: number; code: string; label: string; branchId: number | null }
export interface AssistantRequest { message: string; requestId: string; conversationId?: string; scopeMode: AssistantScopeMode; selection?: Pick<AssistantChoice, 'type' | 'id'> }
export interface AssistantCard { tool: string; title: string; data: unknown }
export interface AssistantResponse {
  requestId: string; conversationId: string; status: 'ANSWER' | 'NO_RESULTS' | 'CLARIFICATION_REQUIRED' | 'OUT_OF_SCOPE' | 'UNSUPPORTED_CAPABILITY' | 'UNSUPPORTED_ACTION';
  message: string; scope: AssistantScope; observedAt: string; cards: AssistantCard[]; choices: AssistantChoice[];
  sources: { tool: string; observedAt: string; scope: AssistantScope }[]; warnings: string[]; hasMore: boolean; nextPage: number | null;
}
export interface AssistantFailure { message: string; retryAfter: number; reset: boolean; retryable: boolean }
export interface AssistantTurn { id: string; request: AssistantRequest; response?: AssistantResponse; failure?: AssistantFailure }
