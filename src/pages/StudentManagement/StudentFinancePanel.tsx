import { useState } from 'react';
import { Table, Tabs, Typography } from 'antd';
import { useRemoteResource } from '../../hooks/useRemoteResource';
import { tuitionService, paymentService } from '../../services/financeService';
import { RelatedOnlineOrders } from '../../components/Common/Finance/RelatedOnlineOrders';
import { ContextLink } from '../../components/Common/ContextLink';
import { LoadError } from '../../components/Common/Academic';
import { TuitionTag } from '../../components/Common/Finance';
import { money } from '../../utils/academic';
import { displayDate } from '../../utils/display';
function Tuitions({ studentId, branchId }: {
    studentId: number;
    branchId: number;
}) { const [page, setPage] = useState(0); const rows = useRemoteResource(tuitionService.list, { studentId, branchId, page, size: 5 }); return <><LoadError error={rows.error} reload={rows.reload}/>{!rows.error && <Table rowKey="id" loading={rows.loading} dataSource={rows.data?.content ?? []} scroll={{ x: 700 }} locale={{ emptyText: 'Chưa có khoản học phí' }} pagination={{ current: page + 1, pageSize: 5, total: rows.data?.totalElements, showSizeChanger: false, onChange: p => setPage(p - 1) }} columns={[{ title: 'Khoản học phí', render: (_, t) => <ContextLink to={'/tuition?tuitionId=' + t.id + '&studentId=' + studentId + '&branchId=' + branchId}>Học phí #{t.id}</ContextLink> }, { title: 'Lớp gốc', dataIndex: 'className' }, { title: 'Phải thu', dataIndex: 'amount', align: 'right', render: money }, { title: 'Còn nợ', dataIndex: 'balance', align: 'right', render: money }, { title: 'Trạng thái', render: (_, t) => <TuitionTag tuition={t}/> }]}/>}</>; }
function Receipts({ studentId, branchId }: {
    studentId: number;
    branchId: number;
}) { const [page, setPage] = useState(0); const rows = useRemoteResource(paymentService.list, { studentId, branchId, page, size: 5 }); return <><LoadError error={rows.error} reload={rows.reload}/>{!rows.error && <Table rowKey="id" loading={rows.loading} dataSource={rows.data?.content ?? []} scroll={{ x: 650 }} locale={{ emptyText: 'Chưa có phiếu thu' }} pagination={{ current: page + 1, pageSize: 5, total: rows.data?.totalElements, showSizeChanger: false, onChange: p => setPage(p - 1) }} columns={[{ title: 'Phiếu thu', render: (_, p) => <ContextLink to={'/payments?paymentId=' + p.id + '&studentId=' + studentId + '&branchId=' + branchId}>{p.receiptNo ?? '#' + p.id}</ContextLink> }, { title: 'Thu gốc', dataIndex: 'amount', align: 'right', render: money }, { title: 'Còn hiệu lực', dataIndex: 'availableAmount', align: 'right', render: money }, { title: 'Ngày thu', dataIndex: 'paidAt', render: (v: string) => displayDate(v) }]}/>}</>; }
export default function StudentFinancePanel(props: {
    studentId: number;
    branchId: number;
}) { const [tab, setTab] = useState('tuition'); return <><Typography.Paragraph type="secondary">Theo dõi học phí, các lần thanh toán và phiếu thu của học viên trong chi nhánh này.</Typography.Paragraph><Tabs activeKey={tab} onChange={setTab} items={[{ key: 'tuition', label: 'Học phí & công nợ', children: tab === 'tuition' ? <Tuitions {...props}/> : null }, { key: 'orders', label: 'Giao dịch online', children: tab === 'orders' ? <RelatedOnlineOrders {...props}/> : null }, { key: 'receipts', label: 'Phiếu thu', children: tab === 'receipts' ? <Receipts {...props}/> : null }]}/></>; }
