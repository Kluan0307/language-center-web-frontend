import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button, Card, Switch, Typography } from 'antd';
import { ManagementLayout, Filters } from '../../components/Layout/ManagementLayout';
import { BranchFilter, LoadError } from '../../components/Common/Academic';
import { Metric } from '../../components/Common/Reports';
import { MetricGrid, QuickGrid } from '../../components/Common/Reports/Reports.styles';
import { PendingPaymentBanner } from '../../components/Common/Finance';
import { ContextLink } from '../../components/Common/ContextLink';
import { useAuth } from '../../hooks/useAuth';
import { useBranches } from '../../hooks/useBranches';
import { useRemoteResource } from '../../hooks/useRemoteResource';
import { reportService } from '../../services/reportService';
import { getNavigation, getItemLabel } from '../../config/navigation';
import { businessDate } from '../../utils/academic';
import { monthStart } from '../../utils/reports';
import { positiveId } from '../../utils/admissions';
import { scopeLabel, effectiveBranch } from '../../utils/managementScope';
import { queueHref } from '../../utils/dashboard';
import WorkQueue from './WorkQueue';
import TodaySessions from './TodaySessions';
function FinanceSummary({ branchId, revision, allAssigned }: {
    branchId?: number;
    revision: number;
    allAssigned: boolean;
}) {
    const today = businessDate();
    const report = useRemoteResource(asyncRevenue, { branchId, from: monthStart(today), to: today, revision, allAssigned });
    return <><LoadError error={report.error} reload={report.reload}/><MetricGrid>
  <Metric title="Thu ròng tháng này (VND)" value={report.data?.collected} loading={report.loading} description="Thu gốc trừ đảo phiếu và hoàn tiền phát sinh trong tháng."/>
  <Metric title="Công nợ hiện tại (VND)" value={report.data?.outstanding} loading={report.loading} description="Số còn phải thu của học phí chưa hủy, không giới hạn tháng."/>
 </MetricGrid></>;
}
async function asyncRevenue({ branchId, from, to, allAssigned }: {
    branchId?: number;
    from: string;
    to: string;
    revision: number;
    allAssigned: boolean;
}, signal?: AbortSignal) { return reportService.revenue({ branchId, from, to, allAssigned }, signal); }
export default function OperationsDashboard() {
    const { user } = useAuth(), branches = useBranches(), navigate = useNavigate();
    const [params, setParams] = useSearchParams();
    const [revision, setRevision] = useState(0);
    const manager = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
    const allAssigned = user?.role === 'ADMIN' && params.get('allAssigned') === 'true';
    const branchId = allAssigned ? undefined : effectiveBranch(user, positiveId(params.get('branchId')));
    const scope = { branchId, allAssigned };
    const stats = useRemoteResource(reportService.academic, { ...scope, groupByBranch: false, revision });
    const v = stats.data?.overall;
    const label = scopeLabel(user, branches.data, branchId, allAssigned);
    const update = (id?: number, assigned = false) => setParams(p => { const n = new URLSearchParams(p); if (id)
        n.set('branchId', String(id));
    else
        n.delete('branchId'); if (assigned)
        n.set('allAssigned', 'true');
    else
        n.delete('allAssigned'); return n; });
    const quick = user ? getNavigation(user.role).filter(n => ['students', 'classes', 'enrollment', 'payments', 'support', 'reports'].includes(n.id)) : [];
    return <ManagementLayout title="Tổng quan" description={'Xin chào ' + (user?.fullName || user?.username || '') + '. Hoạt động và công việc cần xử lý hôm nay.'} scopeLabel={label} actions={<Button onClick={() => { stats.reload(); setRevision(v => v + 1); }}>Cập nhật</Button>}><PendingPaymentBanner onResume={() => navigate('/payments')}/><Filters><BranchFilter branches={branches.data} loading={branches.loading} value={branchId} onChange={id => update(id)}/>{user?.role === 'ADMIN' && <Switch checked={allAssigned} onChange={v => update(undefined, v)} checkedChildren="Tất cả chi nhánh được giao" unCheckedChildren="Chi nhánh đang làm việc"/>}<Typography.Text>{label}</Typography.Text></Filters><LoadError error={branches.error} reload={branches.reload}/><LoadError error={stats.error} reload={stats.reload}/><MetricGrid><Metric title="Học viên đang học" value={v?.studentsByStatus.STUDYING} loading={stats.loading}/><Metric title="Học viên mới tháng này" value={v?.newStudentsThisMonth} loading={stats.loading}/><Metric title="Lớp đang diễn ra" value={v?.classesByStatus.ONGOING} loading={stats.loading}/><Metric title="Lấp đầy lớp chưa kết thúc" value={v?.classOccupancyRate} suffix="%" loading={stats.loading}/></MetricGrid>{manager && <FinanceSummary branchId={branchId} revision={revision} allAssigned={allAssigned}/>}<WorkQueue key={String(branchId) + ':' + String(allAssigned) + ':' + String(user?.branchId)} scope={scope} revision={revision}/><TodaySessions key={String(branchId) + ':' + String(allAssigned) + ':' + String(user?.branchId)} scope={scope} revision={revision}/><Card title="Truy cập nhanh"><QuickGrid>{quick.map(n => <ContextLink key={n.id} to={queueHref(n.path, n.id === 'reports' ? scope : { branchId })}>{getItemLabel(n, user!.role)}</ContextLink>)}</QuickGrid></Card>{manager && <ContextLink to={queueHref('/reports', scope)}>Xem báo cáo chi tiết</ContextLink>}</ManagementLayout>;
}
