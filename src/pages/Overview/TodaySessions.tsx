import { useState } from 'react';
import { Card, Table, Tag, Space } from 'antd';
import { sessionService } from '../../services/sessionService';
import { useRemoteResource } from '../../hooks/useRemoteResource';
import { ContextLink } from '../../components/Common/ContextLink';
import { LoadError } from '../../components/Common/Academic';
import { businessDate } from '../../utils/academic';
import { SESSION_LABELS, attendanceLink } from '../../utils/sessions';
import { queueHref } from '../../utils/dashboard';
import type { DashboardScope } from '../../services/dashboardService';
export default function TodaySessions({ scope, revision }: {
    scope: DashboardScope;
    revision: number;
}) { const [page, setPage] = useState(0); const today = businessDate(); const sessions = useRemoteResource(sessionService.list, { ...scope, page, size: 5, from: today, to: today, revision }); return <Card title="Buổi học hôm nay" extra={<ContextLink to={queueHref('/schedule', scope, { date: today })}>Mở lịch</ContextLink>}><LoadError error={sessions.error} reload={sessions.reload}/>{!sessions.error && <Table rowKey="id" loading={sessions.loading} dataSource={sessions.data?.content ?? []} scroll={{ x: 750 }} locale={{ emptyText: 'Không có buổi học hôm nay' }} pagination={{ current: page + 1, pageSize: 5, total: sessions.data?.totalElements, showSizeChanger: false, onChange: p => setPage(p - 1) }} columns={[{ title: 'Giờ', render: (_, s) => s.startTime ? s.startTime + ' – ' + s.endTime : 'Chưa xác minh giờ' }, { title: 'Lớp', dataIndex: 'className' }, { title: 'Giáo viên / phòng', render: (_, s) => <span>{s.teacherName ?? 'Chưa phân công'}<br />{s.roomName ?? 'Chưa có phòng'}</span> }, { title: 'Trạng thái', render: (_, s) => <Tag>{SESSION_LABELS[s.status]}</Tag> }, { title: 'Thao tác', render: (_, s) => <Space><ContextLink to={queueHref('/schedule', { branchId: s.branchId }, { sessionId: s.id, date: s.sessionDate })}>Xem buổi</ContextLink>{s.status !== 'CANCELLED' && <ContextLink to={attendanceLink(s.id)}>Điểm danh</ContextLink>}</Space> }]}/>}</Card>; }
