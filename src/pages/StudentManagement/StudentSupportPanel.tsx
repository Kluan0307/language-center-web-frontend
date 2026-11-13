import { useState } from 'react';
import { Table, Tag } from 'antd';
import { useRemoteResource } from '../../hooks/useRemoteResource';
import { supportManagementService, supportStatuses } from '../../services/supportManagementService';
import { ContextLink } from '../../components/Common/ContextLink';
import { LoadError } from '../../components/Common/Academic';
import { displayDate } from '../../utils/display';
export default function StudentSupportPanel({ studentId, branchId }: {
    studentId: number;
    branchId: number;
}) { const [page, setPage] = useState(0); const rows = useRemoteResource(supportManagementService.list, { studentId, branchId, page, size: 5 }); return <><ContextLink to={'/support-requests?studentId=' + studentId + '&branchId=' + branchId + '&queue=ALL'}>Tất cả yêu cầu của học viên</ContextLink><LoadError error={rows.error} reload={rows.reload}/>{!rows.error && <Table rowKey="id" loading={rows.loading} dataSource={rows.data?.content ?? []} locale={{ emptyText: 'Chưa có yêu cầu hỗ trợ' }} pagination={{ current: page + 1, pageSize: 5, total: rows.data?.totalElements, showSizeChanger: false, onChange: p => setPage(p - 1) }} columns={[{ title: 'Yêu cầu', render: (_, r) => <ContextLink to={'/support-requests?requestId=' + r.id + '&studentId=' + studentId + '&branchId=' + branchId + '&queue=ALL'}>{r.subject}</ContextLink> }, { title: 'Trạng thái', render: (_, r) => <Tag>{supportStatuses[r.status]}</Tag> }, { title: 'Cập nhật', dataIndex: 'updatedAt', render: (v: string) => displayDate(v) }]}/>}</>; }
