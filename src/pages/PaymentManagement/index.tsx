import { useListQuery } from '../../hooks/useListQuery';
import { ContextLink } from '../../components/Common/ContextLink';
import { RelatedOnlineOrders } from '../../components/Common/Finance/RelatedOnlineOrders';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { App, Button, Card, Descriptions, Drawer, Input, Space, Table, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { ManagementLayout, Filters } from '../../components/Layout/ManagementLayout';
import { BranchFilter, LoadError } from '../../components/Common/Academic';
import { PendingPaymentBanner, ReceiptDetails } from '../../components/Common/Finance';
import { useBranches } from '../../hooks/useBranches';
import { usePendingFinance } from '../../hooks/usePendingFinance';
import { usePendingPayment } from '../../hooks/usePendingPayment';
import { useAuth } from '../../hooks/useAuth';
import { useRemoteResource } from '../../hooks/useRemoteResource';
import { paymentService, tuitionService } from '../../services/financeService';
import { branchLabel, money } from '../../utils/academic';
import { METHOD_LABELS, PAYMENT_LABELS } from '../../utils/finance';
import { positiveId } from '../../utils/admissions';
import { displayDate } from '../../utils/display';
import PaymentFlow from './PaymentFlow';
import TuitionPicker from './TuitionPicker';
import FinanceOperationFlow, { PendingFinanceBanner } from '../../components/Common/Finance/FinanceOperationFlow';
import type { FinanceTarget } from '../../components/Common/Finance/FinanceOperationFlow';
import { PaymentLedgerHistory } from '../../components/Common/Finance/LedgerHistory';
import { canAdjustTuition } from '../../utils/finance';
import type { PaymentDto, PaymentQuery } from '../../types/finance';
export default function PaymentManagement() {
    const { user } = useAuth();
    const { message } = App.useApp();
    const branches = useBranches();
    const pending = usePendingPayment();
    const financial = usePendingFinance();
    const [params, setParams] = useSearchParams();
    const tuitionId = positiveId(params.get('tuitionId'));
    const selectedId = positiveId(params.get('paymentId')) ?? null;
    const [rawQuery, setQuery] = useListQuery<PaymentQuery>([]);
    const query = { ...rawQuery, branchId: user?.role === 'SUPER_ADMIN' ? rawQuery.branchId : undefined };
    const studentId = positiveId(params.get('studentId')), classId = positiveId(params.get('classId'));
    const [search, setSearch] = useState(query.keyword ?? '');
    useEffect(() => setSearch(query.keyword ?? ''), [query.keyword]);
    const list = useRemoteResource(paymentService.list, { ...query, tuitionId, studentId, classId });
    const detail = useRemoteResource(paymentService.detail, { id: selectedId });
    const bill = useRemoteResource(tuitionService.detail, { id: detail.data?.tuitionId ?? tuitionId ?? null });
    const [operation, setOperation] = useState<{
        target?: FinanceTarget;
    } | null>(null);
    const [picker, setPicker] = useState(false);
    const [collect, setCollect] = useState<{
        id: number | null;
    } | null>(null);
    function refresh() { list.reload(); detail.reload(); bill.reload(); }
    function paid(p: PaymentDto) { setCollect(null); setParams(old => { const n = new URLSearchParams(old); n.set('paymentId', String(p.id)); return n; }); refresh(); message.success('Đã xác nhận phiếu thu.'); }
    const columns: TableColumnsType<PaymentDto> = [
        { title: 'Số phiếu', dataIndex: 'receiptNo', width: 260, render: (v, p) => <Button type="link" style={{ padding: 0, whiteSpace: 'normal', textAlign: 'left' }} onClick={() => setParams(n => { const next = new URLSearchParams(n); next.set('paymentId', String(p.id)); return next; })}>{v || '#' + p.id}</Button> },
        { title: 'Học viên / lớp', width: 220, render: (_, p) => <span>{p.studentId ? <ContextLink to={'/students?studentId=' + p.studentId}>{p.studentName ?? '#' + p.studentId}</ContextLink> : 'Chưa có thông tin học viên'}<br /><Typography.Text type="secondary">{p.className ?? ''}</Typography.Text></span> },
        { title: 'Nguồn thu', render: (_, p) => p.source === 'ONLINE' && p.onlineOrderId ? <ContextLink to={'/online-payments?orderId=' + p.onlineOrderId + '&branchId=' + p.branchId}>VNPAY online</ContextLink> : p.source === 'DIRECT' ? 'Thu trực tiếp' : 'Cần xác minh' },
        { title: 'Học phí', dataIndex: 'tuitionId', render: (id: number) => <ContextLink to={'/tuition?tuitionId=' + id}>#{id}</ContextLink> },
        { title: 'Thu gốc', dataIndex: 'amount', render: money }, { title: 'Đã đảo', dataIndex: 'voidedAmount', render: money }, { title: 'Đã hoàn', dataIndex: 'refundedAmount', render: money }, { title: 'Còn hiệu lực', dataIndex: 'availableAmount', render: money }, { title: 'Phương thức', dataIndex: 'paymentMethod', render: (v: PaymentDto['paymentMethod']) => METHOD_LABELS[v] },
        { title: 'Mã giao dịch', dataIndex: 'referenceCode', render: v => v || '—' }, { title: 'Thời gian thu', dataIndex: 'paidAt', render: (v: string) => displayDate(v) },
        { title: 'Người thu', dataIndex: 'recordedByName', render: v => v || '—' }, { title: 'Trạng thái gốc', dataIndex: 'status', render: (v: PaymentDto['status']) => PAYMENT_LABELS[v] },
        ...(user?.role === 'SUPER_ADMIN' ? [{ title: 'Chi nhánh', dataIndex: 'branchId', render: (id: number) => branchLabel(branches.data, id) }] : []),
    ];
    return <ManagementLayout title="Phiếu thu" description="Thu trực tiếp, tra cứu chứng từ và lịch sử điều chỉnh sổ thu." scopeLabel={query.branchId ? branchLabel(branches.data, query.branchId) : user?.role === 'SUPER_ADMIN' ? 'Toàn hệ thống' : user?.branchId ? branchLabel(branches.data, user.branchId) : 'Chưa chọn chi nhánh'} actions={<><Button loading={list.loading} onClick={refresh}>Tải lại</Button><Button type="primary" disabled={!!pending.error || !!financial.draft || !!financial.error} onClick={() => pending.draft ? setCollect({ id: null }) : tuitionId ? setCollect({ id: tuitionId }) : setPicker(true)}>Thu tiền</Button></>}>
  
  <PendingFinanceBanner onResume={() => setOperation({})}/><PendingPaymentBanner onResume={() => setCollect({ id: null })}/><LoadError error={list.error} reload={list.reload}/>
  {tuitionId && <Card size="small" style={{ marginBottom: 16 }} title={'Phiếu thu của học phí #' + tuitionId} extra={<Button onClick={() => { setParams(p => { const n = new URLSearchParams(p); n.delete('tuitionId'); n.delete('paymentId'); n.set('page', '0'); return n; }); }}>Bỏ lọc học phí</Button>}>
   <LoadError error={bill.error} reload={bill.reload}/>
   {bill.data && <Space wrap><Typography.Text>{bill.data.studentName} · {bill.data.className}</Typography.Text><Typography.Text strong>Còn {money(bill.data.balance)}</Typography.Text><ContextLink to={'/tuition?tuitionId=' + tuitionId}>Chi tiết học phí</ContextLink></Space>}
  </Card>}
  <Card><Filters>
   <Input.Search className="search" placeholder="Học viên, lớp, số phiếu hoặc mã giao dịch" value={search} allowClear enterButton onChange={e => {
            setSearch(e.target.value);
            if (!e.target.value)
                setQuery(q => ({ ...q, page: 0, keyword: undefined }));
        }} onSearch={keyword => setQuery(q => ({ ...q, keyword: keyword.trim() || undefined, page: 0 }))}/>
   <BranchFilter branches={branches.data} loading={branches.loading} value={query.branchId} onChange={branchId => { setQuery(q => ({ ...q, branchId, page: 0 })); }}/>
   <Typography.Text type="secondary">{list.loading ? 'Đang tải…' : list.data?.totalElements ?? '—'} phiếu thu</Typography.Text>
  </Filters>
  {!list.error && <Table<PaymentDto> rowKey="id" columns={columns} loading={list.loading} dataSource={list.data?.content ?? []} scroll={{ x: 1450 }} locale={{ emptyText: list.error ? 'Chưa tải được dữ liệu' : 'Không có phiếu thu phù hợp' }} pagination={{ current: query.page + 1, pageSize: query.size, total: list.data?.totalElements ?? 0, showSizeChanger: true, pageSizeOptions: [10, 20, 50], onChange: (page, size) => setQuery(q => ({ ...q, page: size !== q.size ? 0 : page - 1, size })) }}/>}
  </Card>
  <Drawer open={selectedId !== null} title="Chi tiết phiếu thu" size={760} loading={detail.loading} onClose={() => setParams(p => { const n = new URLSearchParams(p); n.delete('paymentId'); return n; })}>
   <LoadError error={detail.error} reload={detail.reload}/>
   {detail.data && <>
    <LoadError error={bill.error} reload={bill.reload}/>
    {bill.data && <Descriptions column={1} size="small" items={[
                    { key: 'student', label: 'Học viên', children: bill.data.studentName || '#' + bill.data.studentId }, { key: 'class', label: 'Lớp gốc', children: bill.data.className || '#' + bill.data.classId },
                    { key: 'branch', label: 'Chi nhánh', children: branchLabel(branches.data, detail.data.branchId) },
                ]}/>}
    <ReceiptDetails receipt={detail.data}/><Space wrap style={{ marginTop: 16, marginBottom: 16 }}><ContextLink to={"/tuition?tuitionId=" + detail.data.tuitionId + "&branchId=" + detail.data.branchId}>Mở khoản học phí</ContextLink>{bill.data && <ContextLink to={"/students?studentId=" + bill.data.studentId}>Hồ sơ học viên</ContextLink>}</Space><Typography.Title level={5}>Giao dịch online liên quan</Typography.Title><RelatedOnlineOrders key={detail.data.id} receiptId={detail.data.id} branchId={detail.data.branchId}/><Typography.Paragraph type="secondary">Đảo/hoàn phiếu điều chỉnh sổ thu của trung tâm; không đồng nghĩa VNPAY đã hoàn tiền về ngân hàng.</Typography.Paragraph>
    {canAdjustTuition(user?.role) && detail.data.status === 'PAID' && detail.data.availableAmount > 0 && <Space style={{ marginTop: 16 }} wrap>
     {detail.data.voidedAmount === 0 && detail.data.refundedAmount === 0 && <Button danger onClick={() => setOperation({ target: { kind: 'VOID', tuitionId: detail.data!.tuitionId, paymentId: detail.data!.id } })}>Đảo phiếu thu nhầm</Button>}
     <Button disabled={!bill.data || bill.data.credit <= 0} onClick={() => setOperation({ target: { kind: 'REFUND', tuitionId: detail.data!.tuitionId, paymentId: detail.data!.id } })}>Hoàn tiền</Button>
    </Space>}
    <PaymentLedgerHistory id={detail.data.id} revision={bill.data?.version ?? 0}/>

   </>}
  </Drawer>
  {picker && <TuitionPicker defaultBranchId={query.branchId ?? user?.branchId ?? undefined} onClose={() => setPicker(false)} onSelected={id => { setPicker(false); setCollect({ id }); }}/>}
  {operation && <FinanceOperationFlow target={operation.target} onClose={() => setOperation(null)} onSaved={() => { setOperation(null); refresh(); message.success('Đã xác nhận giao dịch tài chính.'); }}/>}
  {collect && <PaymentFlow tuitionId={collect.id} onClose={() => setCollect(null)} onSaved={paid}/>}
 </ManagementLayout>;
}
