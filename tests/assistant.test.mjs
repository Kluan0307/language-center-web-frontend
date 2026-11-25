import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
import { createRequire } from 'node:module';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
const source = await readFile(new URL('../src/utils/assistant.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023 } });
const module = { exports: {} }; vm.runInNewContext('(function(module,exports){' + outputText + '\n})', { URL })(module, module.exports);
const { assistantDestination: link, assistantFailure, parseAssistantResponse, assistantRows, sampleQuestions } = module.exports;
const localRequire = createRequire(import.meta.url);
const requestId = '849b9d40-4ecf-438a-ad7a-016e233b8388';
const scope = { mode: 'ACTIVE_BRANCH', branchIds: [1], label: 'Chi nhánh 1' };
const response = () => ({ requestId, conversationId: '3a9486b3-7e83-43c1-bb04-20cd41c1c289', status: 'ANSWER', message: 'Có 0 học viên', scope, observedAt: new Date().toISOString(), cards: [{ tool: 'get_student_statistics', title: 'Thống kê học viên', data: { value: 0 } }], choices: [], sources: [], warnings: [], hasMore: false, nextPage: null });

test('valid response preserves actual 0/null and verified request/scope', () => {
  const value = response(); assert.equal(parseAssistantResponse(value, requestId, scope), value);
  assert.equal(assistantRows({ records: { content: [{ score: 0 }, { score: null }] } })[0].score, 0);
  assert.equal(assistantRows({ value: 0 })[0].value, 0);
});
test('stale identity/scope/request and unexpected response statuses are rejected', () => {
  for (const patch of [{ requestId: 'other' }, { scope: { ...scope, branchIds: [2] } }, { scope: { ...scope, mode: 'WHOLE_SYSTEM' } }, { status: 'SYSTEM' }, { conversationId: 'script' }]) assert.throws(() => parseAssistantResponse({ ...response(), ...patch }, requestId, scope));
});
test('invalid choices, oversized arrays and invalid timestamps never reach UI', () => {
  for (const patch of [{ choices: [{ id: 1.5, type: 'STUDENT', code: 'HV1', label: 'An', branchId: 1 }] }, { cards: new Array(5).fill({ tool: 'x', title: 'x' }) }, { warnings: ['x'.repeat(1001)] }, { observedAt: 'invalid' }, { sources: [{ tool: 'a', observedAt: 'invalid' }] }]) assert.throws(() => parseAssistantResponse({ ...response(), ...patch }, requestId, scope));
});
test('navigation rejects external URL, traversal, redirects, duplicate keys and hidden controls', () => {
  for (const path of ['https://evil.invalid/students', '//evil.invalid/students', '/students/../courses', '/%73tudents?studentId=1', '/students?studentId=1&redirect=https://evil.invalid', '/students?studentId=1&studentId=2', '/students?studentId=%0A1', '/courses?keyword=%3Cscript%3E', '/students\\x', '/students#fragment', '/login']) assert.equal(link(path, 'ADMIN', 1, [1, 2], 1), null, path);
});
test('teacher navigation follows actual web route roles, not tool permission alone', () => {
  assert.equal(link('/courses?keyword=GT1', 'TEACHER', 1, [1], 1), null);
  assert.equal(link('/tuition?tuitionId=1', 'TEACHER', 1, [1], 1), null);
  assert.equal(link('/my-schedule?sessionId=101', 'TEACHER', 1, [1], 1).href, '/my-schedule?sessionId=101&branchId=1');
  assert.equal(link('/grades?examId=201', 'STAFF', 1, [1], 1), null);
});
test('cross-branch links require valid assignment and explicit admin branch switch', () => {
  assert.equal(link('/students?studentId=11', 'ADMIN', 1, [1, 2], 2).switchBranch, true);
  assert.equal(link('/students?studentId=11', 'STAFF', 1, [1, 2], 2), null);
  assert.equal(link('/students?studentId=11', 'ADMIN', 1, [1, 2], 3), null);
  assert.equal(link('/students?studentId=11&branchId=1', 'ADMIN', 1, [1, 2], 2), null);
});
test('course keywords and branch context are preserved safely', () => {
  assert.equal(link('/courses?keyword=GT%26A&branchId=2', 'SUPER_ADMIN', null, [], 2).href, '/courses?keyword=GT%26A&branchId=2');
});
test('429 consumes finite Retry-After; no reset or automatic provider fallback', () => {
  assert.equal(assistantFailure(429, 'MODEL_RATE_LIMITED', '5').retryAfter, 5);
  assert.equal(assistantFailure(429, null, 'Infinity').retryAfter, 60);
  assert.equal(assistantFailure(429, null, 9999).retryAfter, 300);
  assert.equal(assistantFailure(429, null).reset, false);
});
test('expired/changed conversation requires reset; busy conflict can retry', () => {
  assert.equal(assistantFailure(409, 'CONTEXT_CHANGED').reset, true);
  assert.equal(assistantFailure(404, 'CONVERSATION_NOT_FOUND').reset, true);
  assert.equal(assistantFailure(409, 'CONVERSATION_BUSY').reset, false);
  assert.equal(assistantFailure(403).retryable, false);
});
test('config routing failures never claim a conversation expired before one exists', () => {
  for (const status of [404, 409]) {
    const failure = assistantFailure(status, undefined, undefined, 'config');
    assert.equal(failure.reset, false);
    assert.equal(failure.retryable, true);
    assert.match(failure.message, /kết nối/);
    assert.doesNotMatch(failure.message, /hết hạn|hội thoại mới/);
  }
  assert.equal(assistantFailure(404, undefined).reset, false);
  assert.equal(assistantFailure(404, 'NOT_FOUND').reset, false);
  assert.match(assistantFailure(404, 'NOT_FOUND').message, /Không tìm thấy dữ liệu/);
  assert.equal(assistantFailure(409, 'REQUEST_CONFLICT').reset, false);
  assert.equal(assistantFailure(409, 'REQUEST_CONFLICT').retryable, false);
});
test('role-specific starter questions omit forbidden teacher finances/statistics', () => {
  assert.equal(sampleQuestions('TEACHER').some(s => /học phí|khách hàng|Tổng số/.test(s)), false);
  assert.equal(sampleQuestions('STAFF').length, 3);
});
test('AI overload and timeout have distinct messages and a bounded cooldown', () => {
  const busy=assistantFailure(503,'MODEL_BUSY','30');
  assert.equal(busy.retryAfter,30);assert.match(busy.message,/Dịch vụ AI đang bận/);
  assert.equal(assistantFailure(503,'MODEL_COOLDOWN').retryAfter,30);
  assert.equal(assistantFailure(503,'CHAT_DISABLED').retryAfter,0);
  assert.match(assistantFailure(504,'MODEL_TIMEOUT').message,/AI chưa phản hồi/);
});

 test('verified personnel selection is accepted; unknown entity is rejected', () => {
  const value = { ...response(), status: 'CLARIFICATION_REQUIRED', choices: [{ type: 'PERSONNEL', id: 12, code: 'GV#12', label: 'An', branchId: null }] };
  assert.equal(parseAssistantResponse(value, requestId, scope), value);
  assert.throws(() => parseAssistantResponse({ ...value, choices: [{ ...value.choices[0], type: 'RAW_TABLE' }] }, requestId, scope));
 });

test('personnel result shows qualifications and branch assignments in Vietnamese', async () => {
  const source = await readFile(new URL('../src/components/Assistant/AssistantResults.tsx', import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2023 } }).outputText;
  const renderedModule = { exports: {} };
  const requireView = name => {
    if (name === './Assistant.styles') return { Result: 'section' };
    if (name === '../../utils/assistant') return module.exports;
    if (name === 'antd') return { Button: () => null };
    if (name === 'lucide-react') return { ArrowUpRight: () => null };
    return localRequire(name);
  };
  vm.runInNewContext('(function(module,exports,require){' + compiled + '\n})', {})(renderedModule, renderedModule.exports, requireView);
  const html = renderToStaticMarkup(createElement(renderedModule.exports.AssistantResults, {
    cards: [{ tool: 'get_personnel_profile', title: 'Hồ sơ', data: { fullName: 'An', qualification: 'Master', certificate: 'IELTS 8.0', branchIds: [1, 2], accountStatus: false } }, { tool: 'get_academic_statistics', title: 'Thống kê', data: { content: [{ branchId: 2, value: 3, metric: 'CLASSES_ONGOING' }] } }, { tool: 'get_cash_flow', title: 'Dòng tiền', data: { netCollected: -100, refundedAmount: 100 } }],
    onNavigate: () => {}, canNavigate: () => false,
  }));
  for (const expected of ['Bằng cấp', 'Master', 'Chứng chỉ', 'IELTS 8.0', '#1, #2', 'Đã khóa', 'Chi nhánh', 'Lớp đang diễn ra', 'Thực thu sau hủy/hoàn', '-100']) assert.ok(html.includes(expected), expected);
});

test('exam choices preserve verified exam IDs and reject arbitrary types', () => {
  const value = { ...response(), status: 'CLARIFICATION_REQUIRED', choices: [{ type: 'EXAM', id: 502, code: '#502', label: 'Midterm', branchId: 1 }] };
  assert.equal(parseAssistantResponse(value, requestId, scope), value);
});

test('account choices preserve the account identity used for lead assignment', () => {
  const value = { ...response(), status: 'CLARIFICATION_REQUIRED', choices: [{ type: 'ACCOUNT', id: 102, code: 'TK#102', label: 'An', branchId: null }] };
  assert.equal(parseAssistantResponse(value, requestId, scope), value);
});
