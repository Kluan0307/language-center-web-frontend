import {useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {Alert,Button,Card,Space,Switch,Typography} from 'antd';
import {ManagementLayout,Filters} from '../../components/Layout/ManagementLayout';
import {BranchFilter,LoadError} from '../../components/Common/Academic';
import {Metric,CountDistribution} from '../../components/Common/Reports';
import {MetricGrid,TwoColumns,QuickGrid} from '../../components/Common/Reports/Reports.styles';
import {PendingPaymentBanner} from '../../components/Common/Finance';
import {useAuth} from '../../hooks/useAuth';
import {useBranches} from '../../hooks/useBranches';
import {useRemoteResource} from '../../hooks/useRemoteResource';
import {reportService} from '../../services/reportService';
import {tuitionService} from '../../services/financeService';
import {getNavigation,getItemLabel,getItemDescription} from '../../config/navigation';
import {STUDENT_LABELS,LEAD_LABELS} from '../../utils/admissions';
import {branchLabel,businessDate} from '../../utils/academic';
import {monthStart,totalCounts} from '../../utils/reports';
function FinanceSummary({branchId,revision,allAssigned}:{branchId?:number;revision:number;allAssigned:boolean}){
 const today=businessDate();
 const report=useRemoteResource(asyncRevenue,{branchId,from:monthStart(today),to:today,revision,allAssigned});
 return <><LoadError error={report.error} reload={report.reload}/><MetricGrid>
  <Metric title="Thu ròng tháng này (VND)" value={report.data?.collected} loading={report.loading} description="Thu gốc trừ đảo phiếu và hoàn tiền phát sinh trong tháng."/>
  <Metric title="Công nợ hiện tại (VND)" value={report.data?.outstanding} loading={report.loading} description="Số còn phải thu của học phí chưa hủy, không giới hạn tháng."/>
 </MetricGrid></>;
}
async function asyncRevenue({branchId,from,to,allAssigned}:{branchId?:number;from:string;to:string;revision:number;allAssigned:boolean},signal?:AbortSignal){return reportService.revenue({branchId,from,to,allAssigned},signal);}
async function overdueCount({branchId,allAssigned,ids}:{branchId?:number;allAssigned:boolean;ids:number[]},signal?:AbortSignal){
 const scopes=allAssigned?ids:[branchId];
 const pages=await Promise.all(scopes.map(id=>tuitionService.list({page:0,size:1,branchId:id,overdue:true},signal)));
 return {totalElements:pages.reduce((sum,p)=>sum+p.totalElements,0)};
}
export default function OperationsDashboard(){
 const {user}=useAuth();const navigate=useNavigate();const manager=user?.role==='SUPER_ADMIN'||user?.role==='ADMIN';const branches=useBranches();const [branchId,setBranchId]=useState<number>();const [revision,setRevision]=useState(0);
 const [allAssigned,setAllAssigned]=useState(false);
 const stats=useRemoteResource(reportService.academic,{branchId,groupByBranch:user?.role==='SUPER_ADMIN'||allAssigned,allAssigned});
 const overdue=useRemoteResource(overdueCount,{branchId,allAssigned,ids:user?.branchIds??[]});
 const v=stats.data?.overall;const scope=allAssigned?'Tất cả chi nhánh được phân công':user?.role==='SUPER_ADMIN'?(branchId?branchLabel(branches.data,branchId):'Toàn hệ thống'):branchLabel(branches.data,user?.branchId??null);
 const quick=user?getNavigation(user.role).filter(n=>['leads','students','classes','enrollment','attendance','tuition','payments','reports'].includes(n.id)):[];
 function refresh(){stats.reload();overdue.reload();setRevision(n=>n+1);}
 return <ManagementLayout title="Tổng quan" description={'Xin chào '+(user?.fullName||user?.username||'')+'. Theo dõi hoạt động trong phạm vi '+scope+'.'}
  actions={<Button onClick={refresh}>Tải lại số liệu</Button>}>
  <PendingPaymentBanner onResume={()=>navigate('/payments')}/>
  <Filters><BranchFilter branches={branches.data} loading={branches.loading} value={branchId} onChange={setBranchId}/>{user?.role==='ADMIN'&&<Switch checked={allAssigned} onChange={setAllAssigned} checkedChildren="Tất cả chi nhánh được giao" unCheckedChildren="Chi nhánh đang làm việc"/>}<Typography.Text strong>{scope}</Typography.Text></Filters>
  <LoadError error={branches.error} reload={branches.reload}/><LoadError error={stats.error} reload={stats.reload}/>
  <MetricGrid>
   <Metric title="Học viên đang học" value={v?.studentsByStatus.STUDYING} loading={stats.loading}/>
   <Metric title="Học viên mới tháng này" value={v?.newStudentsThisMonth} loading={stats.loading}/>
   <Metric title="Lớp đang diễn ra" value={v?.classesByStatus.ONGOING} loading={stats.loading}/>
   <Metric title="Lead cần tiếp nhận" value={v?.leadsByStatus.NEW} loading={stats.loading} description="Lead trạng thái Mới."/>
  </MetricGrid>
  <MetricGrid>
   <Metric title="Tổng Lead" value={totalCounts(v?.leadsByStatus)} loading={stats.loading}/>
   <Metric title="Chuyển đổi Lead" value={v?.leadConversionRate} suffix="%" loading={stats.loading}/>
   <Metric title="Lấp đầy lớp chưa kết thúc" value={v?.classOccupancyRate} suffix="%" loading={stats.loading}/>
   <Metric title="Khoản học phí quá hạn" value={overdue.data?.totalElements} loading={overdue.loading} description="Số khoản còn nợ và đã qua hạn đóng, không phải số học viên."/>
  </MetricGrid>
  <LoadError error={overdue.error} reload={overdue.reload}/>
  {manager&&<FinanceSummary branchId={branchId} revision={revision} allAssigned={allAssigned}/>}
  {v&&<TwoColumns><Card title="Học viên theo trạng thái"><CountDistribution values={v.studentsByStatus} labels={STUDENT_LABELS}/></Card><Card title="Lead theo trạng thái"><CountDistribution values={v.leadsByStatus} labels={LEAD_LABELS}/></Card></TwoColumns>}
  {!v&&!stats.loading&&!stats.error&&<Alert showIcon type="info" title="Chưa có dữ liệu tổng quan"/>}
  <Card title="Truy cập nhanh"><QuickGrid>{quick.map(n=><Link key={n.id} to={n.id==='reports'&&branchId?'/reports?branchId='+branchId:n.path}><strong>{getItemLabel(n,user!.role)}</strong><Typography.Paragraph type="secondary" style={{margin:'8px 0 0'}}>{getItemDescription(n,user!.role)}</Typography.Paragraph></Link>)}</QuickGrid>
   <Typography.Paragraph type="secondary" style={{marginTop:16,marginBottom:0}}>Các trang nghiệp vụ có bộ lọc riêng. Báo cáo giữ lựa chọn chi nhánh khi mở từ tổng quan.</Typography.Paragraph>
  </Card>
  <Space wrap><Typography.Text type="secondary">Học viên mới theo tháng hiện tại; các chỉ số vận hành khác là hiện trạng.</Typography.Text>{manager&&<Link to={branchId?'/reports?branchId='+branchId:'/reports'}>Xem báo cáo chi tiết</Link>}</Space>
 </ManagementLayout>;
}

