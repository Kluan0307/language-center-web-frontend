import {managementClasses} from '../../services/managementOptions';
import {effectiveBranch,scopeLabel as managementScopeLabel} from '../../utils/managementScope';
import { ContextLink } from '../../components/Common/ContextLink';

import type { ManagedOrder } from '../../services/onlineManagementService';
import { readOnlineQuery, patchOnlineQuery } from './query';
import { RefreshCw } from 'lucide-react';
import { DetailSection, StateView } from '../../components/Common/ManagementViews';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Button, Card, Descriptions, Drawer, Input, Select, Space, Table, Tabs, Tag, Typography } from 'antd';
import { api } from '../../api/axiosInstance';
import { useAuth } from '../../hooks/useAuth';
import { useBranches } from '../../hooks/useBranches';
import { useRemoteResource } from '../../hooks/useRemoteResource';
import { ManagementLayout, Filters } from '../../components/Layout/ManagementLayout';
import { BranchFilter, LoadError } from '../../components/Common/Academic';

import { displayDate } from '../../utils/display';
import { getErrorMessage } from '../../utils/apiErrors';
import type { PageResponse } from '../../types/api';
type Order = ManagedOrder;
type Event = {
    id: number;
    source: string;
    merchantRef: string;
    transactionNo: string;
    amount: string;
    outcome: string;
    status: string;
    resultCode: string | null;
    orderId: string | null;
    receivedAt: string;
};
const labels: Record<string, string> = { CREATED: 'Đang khởi tạo', PENDING: 'Chờ xác nhận', SUCCEEDED: 'Đã ghi nhận phiếu', FAILED: 'Không thành công', EXPIRED: 'Hết hạn', REVIEW_REQUIRED: 'Cần đối soát' };
function money(s: string) { const [whole, fraction = '00'] = s.split('.'); return whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (fraction === '00' ? '' : ',' + fraction) + ' đ'; }
const service = { async list(p: {
        page: number;
        size: number;
        state?: string;
        branchId?: number;allAssigned?:boolean;
        keyword?: string;
        studentId?: number;
        classId?: number;
        tuitionId?: number;
        receiptId?: number;
    }, signal?: AbortSignal) { return (await api.get<PageResponse<Order>>('/finance/payment-orders', { params: p, signal })).data; }, async detail(p: {
        id: string | null;
    }, signal?: AbortSignal) { return p.id ? (await api.get<Order>('/finance/payment-orders/' + p.id, { signal })).data : null; }, async events(p: {
        page: number;
        size: number;
    }, signal?: AbortSignal) { return (await api.get<PageResponse<Event>>('/finance/provider-events', { params: p, signal })).data; } };
export default function OnlinePayments() {
    const { user } = useAuth();
    const manager = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
    const branches = useBranches();
    const [params, setParams] = useSearchParams();
    const id = params.get('orderId');
    const parsed = readOnlineQuery(params);
    const [search, setSearch] = useState(parsed.keyword ?? '');
    useEffect(() => setSearch(parsed.keyword ?? ''), [parsed.keyword]);
    const allAssigned=user?.role==='ADMIN'&&params.get('allAssigned')==='true';
 const query = {allAssigned:allAssigned||undefined, page: parsed.page, size: parsed.size, state: parsed.state, keyword: parsed.keyword, studentId: parsed.studentId, classId: parsed.classId, tuitionId: parsed.tuitionId, receiptId: parsed.receiptId, branchId: allAssigned?undefined:effectiveBranch(user,parsed.branchId) };
    const update = (patch: Record<string, string | number | undefined>) => setParams(p => patchOnlineQuery(p, patch));
    const list = useRemoteResource(service.list, query), detail = useRemoteResource(service.detail, { id }), events = useRemoteResource(service.events, { page: parsed.eventPage, size: 10 });
    const scope = parsed.tab === 'events' ? (user?.role === 'SUPER_ADMIN' ? 'Nhật ký toàn hệ thống' : 'Các chi nhánh được phân công') :
        managementScopeLabel(user,branches.data,query.branchId,allAssigned);
    const classes = useRemoteResource(managementClasses, { branchId: query.branchId,allAssigned,branchIds:user?.branchIds });
    function refresh() { list.reload(); detail.reload(); events.reload(); }
    const show = (id: string) => update({ orderId: id });
    return <ManagementLayout title="Thanh toán trực tuyến" description="Tra cứu phiên thanh toán, kiểm tra kết quả và mở phiếu thu liên quan." scopeLabel={scope} actions={<Button icon={<RefreshCw size={16}/>} onClick={refresh}>Cập nhật</Button>}>
 
 <Tabs activeKey={parsed.tab} onChange={tab => update({ tab })} items={[
            { key: 'orders', label: 'Đơn thanh toán', children: <Card>
 <Filters><Input.Search className="search" aria-label="Tìm giao dịch" placeholder="Học viên, lớp, mã giao dịch" value={search} maxLength={120} allowClear enterButton onChange={e => {
                        setSearch(e.target.value);
                        if (!e.target.value)
                            update({ keyword: undefined, page: 0 });
                    }} onSearch={value => update({ keyword: value.trim() || undefined, page: 0 })}/><BranchFilter branches={branches.data} loading={branches.loading} value={query.branchId} onChange={branchId => update({ branchId, classId: undefined, page: 0, orderId: undefined })}/>
 <Select aria-label="Trạng thái giao dịch" allowClear placeholder="Tất cả trạng thái" value={query.state} options={Object.entries(labels).map(([value, label]) => ({ value, label }))} style={{ minWidth: 220 }} onChange={state => update({ state, page: 0 })}/>
 <Select className="filter" aria-label="Lọc lớp giao dịch" allowClear showSearch optionFilterProp="label" placeholder="Tất cả lớp gốc" loading={classes.loading} value={query.classId} options={classes.data?.map(c => ({ value: c.id, label: c.code + ' · ' + c.name }))} onChange={classId => update({ classId, page: 0 })}/>
 {(query.state || query.branchId || query.keyword || query.studentId || query.tuitionId || query.receiptId || query.classId) && <Button type="text" onClick={() => { setSearch(''); update({ state: undefined, branchId: undefined, keyword: undefined, studentId: undefined, tuitionId: undefined, receiptId: undefined, classId: undefined, page: 0 }); }}>Xóa bộ lọc</Button>}
 </Filters>
 <LoadError error={classes.error} reload={classes.reload}/>
 <LoadError error={list.error} reload={list.reload}/>
 {!list.error && <><Space wrap style={{ marginBottom: 16 }}><Typography.Text type="secondary">{list.loading ? 'Đang cập nhật…' : (list.data?.totalElements ?? 0) + ' giao dịch'}</Typography.Text>{query.state && <Tag closable onClose={() => update({ state: undefined, page: 0 })}>{labels[query.state]}</Tag>}<Typography.Text type="secondary">Đơn thanh toán chỉ ghi nhận thu tiền khi đã có phiếu thu.</Typography.Text></Space>
 <Table<Order> rowKey="id" loading={list.loading} dataSource={list.data?.content ?? []} scroll={{ x: 1100 }} locale={{ emptyText: <StateView title="Không có đơn phù hợp" description="Kiểm tra bộ lọc hoặc giao dịch từ ứng dụng học viên."/> }} pagination={{ current: query.page + 1, pageSize: query.size, total: list.data?.totalElements, showSizeChanger: true, pageSizeOptions: [10, 20, 50], onChange: (page, size) => update({ page: page - 1, size }) }} columns={[
                            { title: 'Giao dịch', dataIndex: 'id', width: 180, render: (v: string, o) => <Space orientation="vertical" size={2}><Button type="link" title={v} style={{ padding: 0 }} onClick={() => show(v)}>{'GD-' + v.slice(0, 8).toUpperCase()}</Button><Typography.Text type="secondary">Học phí #{o.tuitionId}</Typography.Text></Space> },
                            { title: 'Học viên / lớp', width: 240, render: (_, o) => <Space orientation="vertical" size={2}><ContextLink to={'/students?studentId=' + o.studentId}>{o.studentName ?? 'Học viên #' + o.studentId}</ContextLink><Typography.Text>{o.className ?? 'Chưa có thông tin lớp'}</Typography.Text><Typography.Text type="secondary">{o.courseName ?? ''}</Typography.Text></Space> },
                            { title: 'Số tiền', dataIndex: 'amount', align: 'right', width: 170, render: (v: string) => <Typography.Text strong style={{ fontVariantNumeric: 'tabular-nums' }}>{money(v)}</Typography.Text> },
                            { title: 'Kết quả', render: (_, o) => <Space orientation="vertical" size={4}><Tag color={o.state === 'SUCCEEDED' ? 'success' : o.state === 'FAILED' ? 'error' : o.state === 'PENDING' ? 'processing' : 'default'}>{labels[o.state] ?? o.state}</Tag>{o.reviewRequired && <Tag color="warning">Cần kiểm tra thêm</Tag>}</Space> },
                            { title: 'Tạo lúc', dataIndex: 'createdAt', render: (v: string) => displayDate(v) },
                            { title: 'Môi trường', dataIndex: 'environment', render: v => <Typography.Text type="secondary">{v === 'PROTOCOL_TEST' ? 'Mô phỏng cục bộ' : 'VNPAY sandbox'}</Typography.Text> },
                            { title: '', width: 84, render: (_, o) => <Button size="small" aria-label={'Xem giao dịch ' + o.id} onClick={() => show(o.id)}>Xem</Button> }
                        ]}/></>}
 </Card> },
            { key: 'events', label: 'Nhật ký xác thực', children: <Card><Typography.Paragraph type="secondary">Dành cho tra cứu bằng chứng kỹ thuật trong phạm vi được cấp. Nhật ký không phải danh sách phiếu thu.</Typography.Paragraph>
 <LoadError error={events.error} reload={events.reload}/>{!events.error && <Table<Event> rowKey="id" loading={events.loading} dataSource={events.data?.content ?? []} pagination={{ current: parsed.eventPage + 1, pageSize: 10, total: events.data?.totalElements, onChange: p => update({ eventPage: p - 1 }) }} scroll={{ x: 1000 }} columns={[
                            { title: 'Mã', dataIndex: 'id', width: 70 }, { title: 'Nguồn', dataIndex: 'source' }, { title: 'Tham chiếu', dataIndex: 'merchantRef', ellipsis: true }, { title: 'Giao dịch cổng', dataIndex: 'transactionNo' }, { title: 'Số tiền', dataIndex: 'amount', align: 'right', render: (v: string) => money(v) }, { title: 'Xử lý', dataIndex: 'status' }, { title: 'Kết quả', dataIndex: 'resultCode' }, { title: '', width: 100, render: (_, e) => e.orderId ? <Button size="small" onClick={() => show(e.orderId!)}>Xem đơn</Button> : <Typography.Text type="secondary">Chưa xác định</Typography.Text> }
                        ]}/>}</Card> }
        ]}/>
 <Drawer open={!!id} title="Chi tiết giao dịch" size={640} onClose={() => update({ orderId: undefined })}><LoadError error={detail.error} reload={detail.reload}/>{detail.loading && <Typography.Paragraph role="status">Đang tải giao dịch…</Typography.Paragraph>}{detail.data && <Workspace key={detail.data.id} order={detail.data} manager={manager} onSaved={refresh}/>}</Drawer>
 </ManagementLayout>;
}
function Workspace({ order: o, manager, onSaved }: {
    order: Order;
    manager: boolean;
    onSaved: () => void;
}) {
    const [reason, setReason] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState<string>(), [pending, setPending] = useState<{
        requestId: string;
        expectedVersion: number;
        reason: string;
    }>();
    async function reconcile() {
        if (busy)
            return;
        const intent = pending ?? { requestId: crypto.randomUUID(), expectedVersion: o.version, reason: reason.trim() };
        setPending(intent);
        setBusy(true);
        setError(undefined);
        try {
            await api.post('/finance/payment-orders/' + o.id + '/reconcile', intent);
            setPending(undefined);
            setReason('');
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
            const r = await api.get<{
                operationStatus: string;
                order: Order;
            }>('/finance/payment-orders/reconciliations/' + pending.requestId);
            if (r.data.operationStatus === 'DONE') {
                setPending(undefined);
                setError(undefined);
                onSaved();
            }
            else
                setError('Lần đối soát chưa hoàn tất. Có thể gửi lại cùng yêu cầu; không xác nhận tiền bằng tay.');
        }
        catch (e) {
            setError(getErrorMessage(e));
        }
        finally {
            setBusy(false);
        }
    }
    return <Space orientation="vertical" size={20} style={{ width: '100%' }}><ContextLink to={'/students?studentId=' + o.studentId}>{o.studentName ?? 'Hồ sơ học viên #' + o.studentId}</ContextLink><Typography.Text>{o.className ?? 'Chưa có thông tin lớp'}{o.courseName ? ' · ' + o.courseName : ''}</Typography.Text><Typography.Title level={3} style={{ margin: 0 }}>{money(o.amount)}</Typography.Title><Tag color={o.state === 'SUCCEEDED' ? 'success' : 'default'}>{labels[o.state] ?? o.state}</Tag><Alert type={o.environment === 'PROTOCOL_TEST' ? 'warning' : 'info'} showIcon title={o.environment === 'PROTOCOL_TEST' ? 'Mô phỏng giao thức cục bộ — không phải giao dịch VNPAY thật' : 'VNPAY sandbox — giao dịch thử nghiệm'}/><Typography.Paragraph style={{ margin: 0 }}>{o.message}</Typography.Paragraph><DetailSection title="Thông tin và mã giao dịch đầy đủ" collapsible><Descriptions size="small" bordered column={1} items={[{ key: 'id', label: 'Đơn', children: o.id }, { key: 'amount', label: 'Số tiền', children: money(o.amount) }, { key: 'state', label: 'Trạng thái', children: labels[o.state] }, { key: 'created', label: 'Tạo lúc', children: displayDate(o.createdAt) }, { key: 'expire', label: 'Hết hạn', children: displayDate(o.expiresAt) }, { key: 'msg', label: 'Thông tin', children: o.message }]}/></DetailSection>{o.reviewRequired && <Alert type="warning" showIcon title="Có giao dịch cần đối soát thêm; phiếu đã ghi không bị xóa tự động."/>}<ContextLink to={'/tuition?tuitionId=' + o.tuitionId + '&branchId=' + o.branchId}>Mở khoản học phí</ContextLink>{o.receiptId && <ContextLink to={'/payments?paymentId=' + o.receiptId + '&branchId=' + o.branchId}>Mở phiếu thu</ContextLink>}{error && <Alert type="error" showIcon title={error}/>}{manager && <><Typography.Paragraph>Đối soát sẽ truy vấn VNPAY, xác minh chữ ký và chỉ ghi phiếu nếu có bằng chứng thanh toán thành công và còn đủ công nợ. Không có thao tác tự đánh dấu đã trả tiền. Tiền đến muộn/sai số dư tiếp tục được giữ để xử lý.</Typography.Paragraph><Input.TextArea aria-label="Lý do đối soát" value={pending?.reason ?? reason} onChange={e => setReason(e.target.value)} disabled={busy || !!pending} rows={3} maxLength={500} placeholder="Lý do đối soát"/><Space wrap><Button type="primary" loading={busy} disabled={!pending && reason.trim().length < 3} onClick={() => void reconcile()}>{pending ? 'Gửi lại cùng yêu cầu' : 'Đối soát với VNPAY'}</Button>{pending && <Button disabled={busy} onClick={() => void recover()}>Khôi phục lần đối soát</Button>}</Space></>}</Space>;
}
