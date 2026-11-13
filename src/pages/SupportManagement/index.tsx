import {effectiveBranch,scopeLabel as managementScopeLabel} from '../../utils/managementScope';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Button, Card, Collapse, Drawer, Input, Radio, Select, Space, Table, Tag, Timeline, Typography } from 'antd';
import { api } from '../../api/axiosInstance';
import { useAuth } from '../../hooks/useAuth';
import { useRemoteResource } from '../../hooks/useRemoteResource';
import { useBranches } from '../../hooks/useBranches';
import { BranchFilter, LoadError } from '../../components/Common/Academic';
import { ManagementLayout, Filters } from '../../components/Layout/ManagementLayout';
import { ContextLink } from '../../components/Common/ContextLink';
import { getErrorMessage } from '../../utils/apiErrors';
import { displayDate } from '../../utils/display';
import { positiveId } from '../../utils/admissions';

import { patchOnlineQuery } from '../OnlinePayments/query';
import { supportManagementService as service, supportStatuses as labels, supportCategories as categories, type SupportStatus as Status, type SupportRow as Row, type SupportDetail, type SupportQuery } from '../../services/supportManagementService';
const resourceLabels: Record<string, string> = { PROFILE: 'Hồ sơ', ENROLLMENT: 'Đăng ký học', SESSION: 'Buổi học', TUITION: 'Học phí', RECEIPT: 'Phiếu thu', PAYMENT_ORDER: 'Giao dịch online' };
export default function SupportManagement() {
    const { user } = useAuth();
    const branches = useBranches();
    const [params, setParams] = useSearchParams();
    const id = positiveId(params.get('requestId')) ?? null;
    const update = (patch: Record<string, string | number | undefined>) => setParams(p => patchOnlineQuery(p, patch));
    const status = params.get('status'), category = params.get('category');
    const p = Number(params.get('page')), size = Number(params.get('size'));
    const allAssigned=user?.role==='ADMIN'&&params.get('allAssigned')==='true';
    const query: SupportQuery = {allAssigned:allAssigned||undefined, page: Number.isSafeInteger(p) && p >= 0 && p < 100000 ? p : 0, size: [10, 20, 50].includes(size) ? size : 10, branchId:allAssigned?undefined:effectiveBranch(user,positiveId(params.get('branchId'))), studentId: positiveId(params.get('studentId')), status: status && Object.hasOwn(labels, status) ? status as Status : undefined, category: category && Object.hasOwn(categories, category) ? category : undefined, keyword: params.get('keyword')?.trim().slice(0, 120) || undefined, queue: params.get('queue') === 'ALL' || status ? undefined : 'ACTIVE' };
    const [search, setSearch] = useState(query.keyword ?? '');
    useEffect(() => setSearch(query.keyword ?? ''), [query.keyword]);
    const list = useRemoteResource(service.list, query), detail = useRemoteResource(service.detail, { id });
    return <ManagementLayout title="Hỗ trợ học viên" description="Tiếp nhận, phản hồi và theo dõi yêu cầu; ghi chú nội bộ được giữ riêng." scopeLabel={managementScopeLabel(user,branches.data,query.branchId,allAssigned)} actions={<Button onClick={() => { list.reload(); detail.reload(); }}>Cập nhật</Button>}>
 <Card><Filters>
 <Input.Search className="search" aria-label="Tìm yêu cầu hỗ trợ" placeholder="Học viên, điện thoại, tiêu đề, mã giao dịch" maxLength={120} value={search} allowClear enterButton onChange={e => {
            setSearch(e.target.value);
            if (!e.target.value)
                update({ keyword: undefined, page: 0 });
        }} onSearch={v => update({ keyword: v.trim() || undefined, page: 0 })}/>
 <BranchFilter branches={branches.data} loading={branches.loading} value={query.branchId} onChange={branchId => update({ branchId, page: 0, requestId: undefined })}/>
 <Select aria-label="Hàng đợi hỗ trợ" value={query.queue ?? 'ALL'} options={[{ value: 'ACTIVE', label: 'Cần xử lý' }, { value: 'ALL', label: 'Tất cả yêu cầu' }]} onChange={queue => update({ queue, page: 0, status: undefined })}/>
 <Select className="filter" aria-label="Trạng thái hỗ trợ" allowClear placeholder="Tất cả trạng thái" value={query.status} options={Object.entries(labels).map(([value, label]) => ({ value, label }))} onChange={status => update({ status, queue: 'ALL', page: 0 })}/>
 <Select className="filter" aria-label="Loại hỗ trợ" allowClear placeholder="Tất cả loại" value={query.category} options={Object.entries(categories).map(([value, label]) => ({ value, label }))} onChange={category => update({ category, page: 0 })}/>
 {(query.studentId || query.keyword || query.category || query.status) && <Button type="text" onClick={() => { setSearch(''); update({ studentId: undefined, keyword: undefined, category: undefined, status: undefined, page: 0 }); }}>Xóa bộ lọc</Button>}
 </Filters><LoadError error={list.error} reload={list.reload}/>{!list.error && <Table<Row> rowKey="id" loading={list.loading} dataSource={list.data?.content ?? []} scroll={{ x: 1000 }} pagination={{ current: query.page + 1, pageSize: query.size, total: list.data?.totalElements, showSizeChanger: true, pageSizeOptions: [10, 20, 50], onChange: (page, size) => update({ page: page - 1, size }) }} columns={[
                { title: 'Mã', dataIndex: 'id', width: 70 }, { title: 'Học viên', render: (_, r) => <ContextLink to={'/students?studentId=' + r.studentId}>{r.studentName}</ContextLink> }, { title: 'Tiêu đề', dataIndex: 'subject' }, { title: 'Loại', dataIndex: 'category', render: (v: keyof typeof categories) => categories[v] }, { title: 'Trạng thái', dataIndex: 'status', render: (v: Status) => <Tag color={v === 'OPEN' ? 'processing' : v === 'IN_PROGRESS' ? 'warning' : 'default'}>{labels[v]}</Tag> }, { title: 'Cập nhật', dataIndex: 'updatedAt', render: (v: string) => displayDate(v) }, { title: 'Thao tác', width: 90, render: (_, r) => <Button size="small" onClick={() => update({ requestId: r.id })}>Xem</Button> }
            ]}/>}</Card><Drawer open={!!id} size={720} title="Chi tiết yêu cầu" onClose={() => update({ requestId: undefined })}><LoadError error={detail.error} reload={detail.reload}/>{detail.loading && <Typography.Paragraph role="status">Đang tải yêu cầu…</Typography.Paragraph>}{detail.data && <Workspace key={id} data={detail.data} onSaved={() => { detail.reload(); list.reload(); }}/>}</Drawer></ManagementLayout>;
}
function Workspace({ data, onSaved }: {
    data: SupportDetail;
    onSaved: () => void;
}) {
    const [message, setMessage] = useState(''), [internal, setInternal] = useState(false), [reason, setReason] = useState(''), [error, setError] = useState<string>(), [busy, setBusy] = useState(false);
    const [pending, setPending] = useState<{
        path: string;
        method: 'POST' | 'PATCH';
        body: Record<string, unknown>;
    }>();
    const r = data.request;
    const allowed: Status[] = r.status === 'OPEN' ? ['IN_PROGRESS'] : r.status === 'IN_PROGRESS' ? ['RESOLVED'] : r.status === 'RESOLVED' ? ['IN_PROGRESS', 'CLOSED'] : [];
    const [next, setNext] = useState<Status>();
    async function execute(op: NonNullable<typeof pending>) {
        if (busy)
            return;
        setPending(op);
        setBusy(true);
        setError(undefined);
        try {
            await api.request({ url: op.path, method: op.method, data: op.body });
            setPending(undefined);
            setMessage('');
            setInternal(false);
            setReason('');
            setNext(undefined);
            onSaved();
        }
        catch (e) {
            setError(getErrorMessage(e));
        }
        finally {
            setBusy(false);
        }
    }
    async function recover() {
        if (!pending || busy)
            return;
        setBusy(true);
        try {
            await api.get('/academic/support-requests/operations/' + pending.body.requestId);
            setPending(undefined);
            setError(undefined);
            onSaved();
        }
        catch (e) {
            setError(getErrorMessage(e));
        }
        finally {
            setBusy(false);
        }
    }
    return <Space orientation="vertical" style={{ width: '100%' }}><Typography.Title level={4}>{r.subject}</Typography.Title><Typography.Text>{r.studentName} · {labels[r.status]} · {categories[r.category as keyof typeof categories]}</Typography.Text>{r.resourceType && <Typography.Text type="secondary">Liên quan: {resourceLabels[r.resourceType] ?? 'Thông tin liên quan'} #{r.resourceKey ? 'GD-' + r.resourceKey.slice(0, 8).toUpperCase() : r.resourceId}</Typography.Text>}{r.resourceType === 'PAYMENT_ORDER' && r.resourceKey && <ContextLink to={'/online-payments?orderId=' + r.resourceKey + '&branchId=' + r.branchId}>Mở giao dịch online</ContextLink>}{(r.resourceType === 'TUITION' || r.resourceType === 'RECEIPT') && r.resourceId && <ContextLink to={(r.resourceType === 'TUITION' ? '/tuition?tuitionId=' : '/payments?paymentId=') + r.resourceId}>Mở {r.resourceType === 'TUITION' ? 'khoản học phí' : 'phiếu thu'}</ContextLink>}<ContextLink to={'/students?studentId=' + r.studentId}>Hồ sơ học viên</ContextLink><Collapse items={[{ key: 'history', label: 'Lịch sử trạng thái', children: data.statusHistory?.length ? <Timeline items={data.statusHistory.map(e => ({ content: <><Typography.Text strong>{e.previousStatus ? labels[e.previousStatus] + ' → ' : ''}{labels[e.status]}</Typography.Text><div>{e.actorName} · {displayDate(e.createdAt)}</div><Typography.Paragraph style={{ whiteSpace: 'pre-wrap' }}>{e.reason}</Typography.Paragraph></> }))}/> : <Typography.Text type="secondary">Yêu cầu cũ chưa có lịch sử trạng thái chi tiết.</Typography.Text> }]}/>{data.messages.map(m => <Card key={m.id} size="small" title={<Space>{m.internalNote && <Tag color="orange">Nội bộ</Tag>}<span>{m.sender === 'STUDENT' ? 'Học viên' : m.actorName}</span><Typography.Text type="secondary">{displayDate(m.createdAt)}</Typography.Text></Space>}><Typography.Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{m.message}</Typography.Paragraph></Card>)}{error && <Alert type="error" showIcon title={error}/>}
 {pending ? <Space wrap><Button loading={busy} onClick={() => void execute(pending)}>Gửi lại cùng yêu cầu</Button><Button disabled={busy} onClick={() => void recover()}>Kiểm tra kết quả vừa gửi</Button><Typography.Text type="secondary">Nội dung và mã yêu cầu được giữ nguyên khi phản hồi chưa rõ.</Typography.Text></Space> : r.status !== 'CLOSED' ? <><Input.TextArea aria-label="Phản hồi hỗ trợ" maxLength={2000} rows={4} value={message} onChange={e => setMessage(e.target.value)} placeholder="Nhập phản hồi"/><Radio.Group aria-label="Nơi nhận nội dung" value={internal ? 'internal' : 'public'} onChange={e => setInternal(e.target.value === 'internal')} options={[{ value: 'public', label: 'Phản hồi cho học viên' }, { value: 'internal', label: 'Ghi chú nội bộ' }]}/><Alert type={internal ? 'warning' : 'info'} showIcon title={internal ? 'Chỉ nhân viên trung tâm xem được ghi chú này' : 'Nội dung sẽ hiển thị cho học viên'}/><Button type="primary" disabled={!message.trim() || busy} onClick={() => void execute({ path: '/academic/support-requests/' + r.id + '/messages', method: 'POST', body: { requestId: crypto.randomUUID(), version: r.version, message: message.trim(), internalNote: internal } })}>{internal ? 'Lưu ghi chú' : 'Gửi phản hồi cho học viên'}</Button><Select placeholder="Chọn trạng thái tiếp theo" value={next} options={allowed.map(value => ({ value, label: labels[value] }))} onChange={setNext}/><Input.TextArea aria-label="Lý do xử lý" rows={2} value={reason} maxLength={500} onChange={e => setReason(e.target.value)} placeholder="Lý do cập nhật trạng thái (nội bộ)"/><Button disabled={!next || !reason.trim() || busy} onClick={() => void execute({ path: '/academic/support-requests/' + r.id + '/status', method: 'PATCH', body: { requestId: crypto.randomUUID(), version: r.version, status: next, reason: reason.trim() } })}>Cập nhật trạng thái</Button></> : <Alert type="info" title="Yêu cầu đã đóng. Học viên có thể tạo yêu cầu mới nếu cần."/>}</Space>;
}
