import { useState } from 'react';
import { Table, Tag, Typography } from 'antd';
import { onlineManagementService, orderLabels } from '../../../services/onlineManagementService';
import { useRemoteResource } from '../../../hooks/useRemoteResource';
import { LoadError } from '../Academic';
import { ContextLink } from '../ContextLink';
import { displayDate } from '../../../utils/display';
export function RelatedOnlineOrders({ studentId, tuitionId, receiptId, branchId }: {
    studentId?: number;
    tuitionId?: number;
    receiptId?: number;
    branchId?: number;
}) {
    const [page, setPage] = useState(0);
    const data = useRemoteResource(onlineManagementService.list, { page, size: 5, studentId, tuitionId, receiptId, branchId });
    return <section><LoadError error={data.error} reload={data.reload}/>{!data.error && <Table size="small" rowKey="id" loading={data.loading} dataSource={data.data?.content ?? []} scroll={{ x: 650 }} locale={{ emptyText: 'Chưa có giao dịch online trong phạm vi này' }} pagination={{ current: page + 1, pageSize: 5, total: data.data?.totalElements, showSizeChanger: false, onChange: p => setPage(p - 1) }} columns={[
                { title: 'Giao dịch', render: (_, o) => <ContextLink to={'/online-payments?orderId=' + o.id + (o.branchId ? '&branchId=' + o.branchId : '')}>{'GD-' + o.id.slice(0, 8).toUpperCase()}</ContextLink> },
                { title: 'Lớp / khóa', render: (_, o) => <span>{o.className ?? 'Chưa có thông tin lớp'}<br /><Typography.Text type="secondary">{o.courseName ?? ''}</Typography.Text></span> },
                { title: 'Số tiền', align: 'right', render: (_, o) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(o.amount)) },
                { title: 'Kết quả', render: (_, o) => <Tag>{orderLabels[o.state] ?? o.state}</Tag> }, { title: 'Tạo lúc', render: (_, o) => displayDate(o.createdAt) }
            ]}/>}</section>;
}
