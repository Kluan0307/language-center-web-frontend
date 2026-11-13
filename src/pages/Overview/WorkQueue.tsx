import { Card, Space, Typography } from 'antd';
import { Metric } from '../../components/Common/Reports';
import { MetricGrid } from '../../components/Common/Reports/Reports.styles';
import { ContextLink } from '../../components/Common/ContextLink';
import { LoadError } from '../../components/Common/Academic';
import { dashboardService } from '../../services/dashboardService';
import type { DashboardScope } from '../../services/dashboardService';
import { useRemoteResource } from '../../hooks/useRemoteResource';
import { queueHref } from '../../utils/dashboard';
import { displayDate } from '../../utils/display';
async function academic(p: DashboardScope & {
    revision: number;
}, signal?: AbortSignal) { return dashboardService.academic({ branchId: p.branchId, allAssigned: p.allAssigned }, signal); }
async function finance(p: DashboardScope & {
    revision: number;
}, signal?: AbortSignal) { return dashboardService.finance({ branchId: p.branchId, allAssigned: p.allAssigned }, signal); }
export default function WorkQueue({ scope, revision }: {
    scope: DashboardScope;
    revision: number;
}) {
    const a = useRemoteResource(academic, { ...scope, revision }), f = useRemoteResource(finance, { ...scope, revision });
    return <Card title="Cần xử lý"><LoadError error={a.error} reload={a.reload}/><LoadError error={f.error} reload={f.reload}/><MetricGrid>
    <div><Metric title="Hỗ trợ đang chờ xử lý" value={a.data?.supportActive} loading={a.loading}/><ContextLink to={queueHref('/support-requests', scope, { queue: 'ACTIVE' })}>Mở hàng đợi hỗ trợ</ContextLink></div>
    <div><Metric title="Khoản học phí quá hạn" value={f.data?.tuitionOverdue} loading={f.loading}/><ContextLink to={queueHref('/tuition', scope, { overdue: 'true' })}>Xem khoản quá hạn</ContextLink></div>
    <div><Metric title="Giao dịch cần kiểm tra" value={f.data?.ordersReview} loading={f.loading}/><ContextLink to={queueHref('/online-payments', scope, { state: 'REVIEW_REQUIRED' })}>Xem giao dịch cần kiểm tra</ContextLink></div>
    <div><Metric title="Lead chưa tiếp nhận" value={a.data?.leadsNew} loading={a.loading}/><ContextLink to={queueHref('/leads', scope, { status: 'NEW' })}>Mở Lead mới</ContextLink></div>
    </MetricGrid><Space wrap style={{ marginTop: 16 }}>{a.data && <Typography.Text type="secondary">Học vụ: {displayDate(a.data.observedAt)}</Typography.Text>}{f.data && <Typography.Text type="secondary">Tài chính: {displayDate(f.data.observedAt)}</Typography.Text>}</Space></Card>;
}
