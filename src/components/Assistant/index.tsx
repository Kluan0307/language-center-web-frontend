import { useEffect, useRef, useState } from 'react';
import { Alert, App, Button, Drawer, Empty, Input, Popconfirm, Select, Space, Spin, Tooltip } from 'antd';
import { BotMessageSquare, Plus, Send, Sparkles, Square } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { assistantService, chatFailure } from '../../services/assistantService';
import { branchService } from '../../services/branchService';
import { getSessionToken } from '../../utils/authStorage';
import { selectBranch } from '../../utils/branchScope';
import { assistantDestination, sampleQuestions } from '../../utils/assistant';
import type { AssistantChoice, AssistantConfig, AssistantFailure, AssistantRequest, AssistantScope, AssistantScopeMode, AssistantTurn } from '../../types/assistant';
import type { UserResponse } from '../../types/auth';
import type { Branch } from '../../types/branch';
import { AssistantResults } from './AssistantResults';
import * as S from './Assistant.styles';

export default function Assistant() {
  const { user, token, isAuthenticated } = useAuth();
  const { pathname } = useLocation();
  if (!isAuthenticated || !user || !token || user.mustChangePassword || pathname === '/login' || !['SUPER_ADMIN', 'ADMIN', 'STAFF', 'TEACHER'].includes(user.role)) return null;
  // React key is internal; it never becomes a DOM attribute. No chat content goes to storage.
  return <AssistantPanel key={[token, user.accountId, user.role, user.branchId, [...(user.branchIds ?? [])].sort().join(',')].join(':')} user={user} token={token} />;
}

function AssistantPanel({ user, token }: { user: UserResponse; token: string }) {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<AssistantConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [failure, setFailure] = useState<AssistantFailure | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [retryBlocked, setRetryBlocked] = useState(false);
  const retryTimer = useRef<number | undefined>(undefined);
  const [mode, setMode] = useState<AssistantScopeMode>(user.role === 'SUPER_ADMIN' ? 'WHOLE_SYSTEM' : 'ACTIVE_BRANCH');
  const [branch, setBranch] = useState<number | null>(user.branchId);
  const configRequest = useRef<AbortController | null>(null);
  const branchRequest = useRef<AbortController | null>(null);
  const launcher = useRef<HTMLButtonElement | null>(null);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; configRequest.current?.abort(); branchRequest.current?.abort(); window.clearTimeout(retryTimer.current); }; }, []);
  async function loadConfig() {
    if (loading || retryBlocked) return;
    configRequest.current?.abort();
    const controller = new AbortController(); configRequest.current = controller;
    setLoading(true); setFailure(null);
    try {
      const result = await assistantService.config({ token, branchId: user.branchId }, controller.signal);
      if (!controller.signal.aborted && alive.current && getSessionToken() === token) {
        if (result.role !== user.role) throw Error('ROLE_CHANGED');
        setConfig(result);
      }
    } catch (error) {
      if (!controller.signal.aborted && alive.current) {
        const issue = chatFailure(error, 'config'); setFailure(issue);
        if (issue.retryAfter) { setRetryBlocked(true); retryTimer.current = window.setTimeout(() => { if (alive.current) setRetryBlocked(false); }, issue.retryAfter * 1000); }
      }
    } finally { if (configRequest.current === controller && alive.current) setLoading(false); }
  }
  function launch() {
    setOpen(true);
    if (!config) void loadConfig();
    if (user.role === 'SUPER_ADMIN' && !branches.length) {
      branchRequest.current?.abort(); const controller = new AbortController(); branchRequest.current = controller;
      void branchService.all({}, controller.signal).then(result => { if (alive.current && !controller.signal.aborted) setBranches(result.filter(b => b.status === 'ACTIVE')); }).catch(() => { /* Whole-system scope remains usable; branch select offers explicit retry. */ });
    }
  }
  const branchIds = mode === 'WHOLE_SYSTEM' ? [] : mode === 'ALL_ASSIGNED' ? [...(user.branchIds ?? [])] : branch ? [branch] : [];
  const scope: AssistantScope = { mode, branchIds, label: mode === 'WHOLE_SYSTEM' ? 'Toàn hệ thống' : mode === 'ALL_ASSIGNED' ? 'Các chi nhánh được phân công' : branches.find(b => b.id === branch)?.name ?? `Chi nhánh #${branch ?? '—'}` };
  const ready = mode !== 'ACTIVE_BRANCH' || branch !== null;
  return <>
    <S.Launcher><Button ref={launcher} type="primary" icon={<BotMessageSquare size={18} />} onClick={launch} aria-expanded={open} aria-controls="center-assistant">Trợ lý</Button></S.Launcher>
    <Drawer id="center-assistant" title={<S.Title><BotMessageSquare size={22} color="#2563eb" /><div><strong>Trợ lý trung tâm</strong><small>Tra cứu nhanh trong công việc</small></div></S.Title>}
      open={open} afterOpenChange={visible => { if (!visible) launcher.current?.focus(); }} onClose={() => { setOpen(false); configRequest.current?.abort(); }} size="min(520px, 100vw)" styles={{ body: { padding: 0, overflow: 'hidden' } }}>
      {loading ? <div role="status" style={{ padding: 40, textAlign: 'center' }}><Spin /><p>Đang kết nối trợ lý…</p></div>
        : config?.enabled ? <Conversation key={`${mode}:${branch}`} user={user} token={token} scope={scope} open={open} onClose={() => setOpen(false)}
          renderScope={busy => <>
            {user.role === 'SUPER_ADMIN' ? <><Select aria-label="Phạm vi tra cứu" value={mode} disabled={busy} onChange={setMode} options={[{ value: 'WHOLE_SYSTEM', label: 'Toàn hệ thống' }, { value: 'ACTIVE_BRANCH', label: 'Một chi nhánh' }]} />
              {mode === 'ACTIVE_BRANCH' && <Select aria-label="Chi nhánh tra cứu" value={branch} disabled={busy} onChange={setBranch} placeholder="Chọn chi nhánh" options={branches.map(b => ({ value: b.id, label: b.code + ' · ' + b.name }))} notFoundContent={<Button type="link" onClick={launch}>Tải lại chi nhánh</Button>} />}</>
              : user.role === 'ADMIN' ? <Select aria-label="Phạm vi tra cứu" value={mode} disabled={busy} onChange={setMode} options={[{ value: 'ACTIVE_BRANCH', label: `Chi nhánh đang làm việc #${user.branchId}` }, { value: 'ALL_ASSIGNED', label: 'Các chi nhánh được phân công' }]} /> : <strong>{scope.label}</strong>}
            <p>Đổi phạm vi sẽ bắt đầu hội thoại mới.</p>{!ready && <Alert type="info" title="Chọn chi nhánh để bắt đầu tra cứu." />}
          </>} ready={ready} />
          : <div style={{ padding: '40px 24px' }}><Empty description={failure?.message ?? 'Trợ lý hiện chưa sẵn sàng. Bạn vẫn có thể sử dụng các trang nghiệp vụ.'} /><Button block disabled={retryBlocked} onClick={() => void loadConfig()}>Kiểm tra lại kết nối</Button></div>}
    </Drawer>
  </>;
}

function Conversation({ user, token, scope, open, onClose, renderScope, ready }: {
  user: UserResponse; token: string; scope: AssistantScope; open: boolean; onClose: () => void;
  renderScope: (busy: boolean) => React.ReactNode; ready: boolean;
}) {
  const { modal } = App.useApp(); const navigate = useNavigate(); const { refreshUser } = useAuth();
  const [turns, setTurns] = useState<AssistantTurn[]>([]);
  const [draft, setDraft] = useState(''); const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(0);
  const pending = useRef<AbortController | null>(null); const alive = useRef(true);
  const conversation = useRef<string | undefined>(undefined); const history = useRef<HTMLDivElement>(null);
  const session = { token, branchId: scope.mode === 'ACTIVE_BRANCH' ? scope.branchIds[0] ?? null : user.branchId };
  useEffect(() => { alive.current = true; return () => { alive.current = false; pending.current?.abort(); }; }, []);
  useEffect(() => { if (!open) pending.current?.abort(); }, [open]);
  useEffect(() => { history.current?.scrollTo({ top: history.current.scrollHeight, behavior: 'smooth' }); }, [turns, busy]);
  useEffect(() => {
    if (remaining <= 0) return;
    const timer = window.setTimeout(() => setRemaining(value => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [remaining]);

  async function send(message: string, selection?: AssistantRequest['selection'], retry?: AssistantTurn) {
    if (busy || pending.current || !ready || remaining > 0 || !message.trim() || message.length > 2000) return;
    const controller = new AbortController(); pending.current = controller;
    const request: AssistantRequest = retry?.request ?? { message: message.trim(), requestId: crypto.randomUUID(), conversationId: conversation.current, scopeMode: scope.mode, ...(selection ? { selection } : {}) };
    const turn: AssistantTurn = { id: request.requestId, request };
    setTurns(previous => retry ? previous.map(t => t.id === retry.id ? turn : t) : [...previous.slice(-39), turn]);
    setDraft(''); setNotice(null); setBusy(true);
    const current = () => alive.current && pending.current === controller && getSessionToken() === token;
    try {
      const response = await assistantService.chat(request, scope, session, controller.signal);
      if (!current() || controller.signal.aborted) return;
      conversation.current = response.conversationId;
      setTurns(previous => previous.map(t => t.id === turn.id ? { ...turn, response } : t));
    } catch (error) {
      if (!current()) return;
      const failure: AssistantFailure = controller.signal.aborted ? { message: 'Đã dừng chờ kết quả. Bạn có thể thử lại yêu cầu này.', retryAfter: 0, reset: false, retryable: true } : chatFailure(error);
      if (failure.reset) { setTurns([]); conversation.current = undefined; setNotice(failure.message); void refreshUser(); }
      else setTurns(previous => previous.map(t => t.id === turn.id ? { ...turn, failure } : t));
      if (failure.retryAfter) setRemaining(failure.retryAfter);
    } finally { if (alive.current && pending.current === controller) { pending.current = null; setBusy(false); } }
  }

  async function clear() {
    const id = conversation.current; pending.current?.abort();
    conversation.current = undefined; setTurns([]); setDraft(''); setNotice(null);
    if (!id) return;
    const controller = new AbortController(); pending.current = controller; setBusy(true);
    try { await assistantService.remove(id, session, controller.signal); }
    catch { if (alive.current) setNotice('Đã mở hội thoại mới. Chưa thể xóa lịch sử trước trên máy chủ; lịch sử đó sẽ tự hết hạn.'); }
    finally { if (alive.current && pending.current === controller) { pending.current = null; setBusy(false); } }
  }
  const destination = (path: unknown, branch?: unknown) => {
    if (scope.branchIds.length !== 1 && branch === undefined && !(typeof path === 'string' && /[?&]branchId=/.test(path))) return null;
    const currentBranch = user.role === 'SUPER_ADMIN' && scope.mode === 'ACTIVE_BRANCH' ? scope.branchIds[0] ?? null : user.branchId;
    return assistantDestination(path, user.role, currentBranch, user.branchIds ?? [], branch);
  };
  function go(path: unknown, branch?: unknown) {
    const target = destination(path, branch); if (!target) return;
    const visit = () => { onClose(); if (target.switchBranch) selectBranch(target.branchId); navigate(target.href); };
    if (target.switchBranch) modal.confirm({ title: 'Chuyển chi nhánh để mở kết quả?', content: `Kết quả thuộc chi nhánh #${target.branchId}. Biểu mẫu chưa lưu trên trang hiện tại có thể bị mất.`, okText: 'Chuyển và mở', cancelText: 'Ở lại', onOk: visit });
    else visit();
  }
  const last = turns.at(-1);
  const choose = (choice: AssistantChoice) => void send(`Chọn ${choice.code}`, { type: choice.type, id: choice.id });
  return <S.Shell>
    <S.Scope>{renderScope(busy)}<Space style={{ justifyContent: 'space-between', width: '100%' }}><small>Chỉ tra cứu theo quyền hiện tại</small>
      <Popconfirm title="Bắt đầu hội thoại mới?" description="Nội dung hội thoại hiện tại sẽ được xóa." onConfirm={() => void clear()} okText="Hội thoại mới" cancelText="Giữ lại" disabled={!turns.length || busy}>
        <Button size="small" type="text" icon={<Plus size={15} />} disabled={!turns.length || busy}>Hội thoại mới</Button>
      </Popconfirm></Space></S.Scope>
    <S.History ref={history} role="log" aria-label="Hội thoại với trợ lý" aria-live="polite" aria-busy={busy}>
      {notice && <Alert type="info" title={notice} />}
      {!turns.length && <S.Welcome><Sparkles size={28} color="#2563eb" /><h2>Bạn cần tra cứu gì?</h2><p>Tìm khóa học, theo dõi lớp và xem thông tin trong phạm vi công việc của bạn.</p>
        {sampleQuestions(user.role).map(text => <Button key={text} disabled={busy || !ready || remaining > 0} onClick={() => void send(text)}>{text}</Button>)}
      </S.Welcome>}
      {turns.map(turn => <article key={turn.id}><S.Question>{turn.request.message}</S.Question><S.Answer>
        {turn.response && <><p className="answer-text">{turn.response.message}</p>
          <AssistantResults cards={turn.response.cards} canNavigate={(path, branch) => !!destination(path, branch)} onNavigate={go} />
          {turn.response.warnings.map((warning, i) => <Alert key={i} type="info" title={warning} />)}
          {turn === last && turn.response.choices.map(choice => <Button key={choice.type + choice.id} disabled={busy || remaining > 0} style={{ height: 'auto', whiteSpace: 'normal', textAlign: 'left' }} onClick={() => choose(choice)}>{choice.code} · {choice.label}{choice.branchId ? ` · CN #${choice.branchId}` : ''}</Button>)}
          {turn === last && turn.response.hasMore && <Button disabled={busy || remaining > 0} onClick={() => void send('Xem tiếp trang sau')}>Xem thêm kết quả</Button>}
          <S.Source>Phạm vi: {turn.response.scope.label}<br />Tra cứu lúc {new Date(turn.response.observedAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}{turn.response.sources.length > 1 ? ` · ${turn.response.sources.length} nguồn dữ liệu` : ''}</S.Source>
        </>}
        {turn.failure && <><Alert type="warning" title={turn.failure.message} />{turn === last && turn.failure.retryable && <Button disabled={busy || remaining > 0} onClick={() => void send(turn.request.message, undefined, turn)}>Thử lại yêu cầu</Button>}</>}
      </S.Answer></article>)}
      {busy && <Space role="status"><Spin size="small" />Đang tra cứu…</Space>}
    </S.History>
    <S.Composer>
      <Input.TextArea aria-label="Câu hỏi cho trợ lý" placeholder="Ví dụ: Khóa giao tiếp dưới 5 triệu?" value={draft} onChange={e => setDraft(e.target.value)} maxLength={2000} autoSize={{ minRows: 2, maxRows: 5 }} disabled={!ready}
        onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } }}
        onPressEnter={e => { if (!e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(draft); } }} />
      <div className="compose-actions"><small>{remaining > 0 ? `Có thể gửi lại sau ${remaining} giây` : `${draft.length}/2000 · Enter để gửi`}</small>
        {busy ? <Button icon={<Square size={14} />} onClick={() => pending.current?.abort()}>Dừng chờ</Button>
          : <Tooltip title="Gửi câu hỏi"><Button type="primary" icon={<Send size={16} />} aria-label="Gửi câu hỏi" disabled={!draft.trim() || !ready || remaining > 0} onClick={() => void send(draft)}>Gửi</Button></Tooltip>}
      </div>
      <small>Thông tin tại thời điểm tra cứu có thể thay đổi. Trợ lý không thực hiện cập nhật dữ liệu.</small>
    </S.Composer>
  </S.Shell>;
}
