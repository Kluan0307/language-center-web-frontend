import {useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {Button,Card,Switch,Tabs,Typography} from 'antd';
import {ManagementLayout,Filters} from '../../components/Layout/ManagementLayout';
import {BranchFilter,LoadError} from '../../components/Common/Academic';
import {useAuth} from '../../hooks/useAuth';
import {useBranches} from '../../hooks/useBranches';
import {useRemoteResource} from '../../hooks/useRemoteResource';
import {reportService} from '../../services/reportService';
import {branchLabel,businessDate} from '../../utils/academic';
import {positiveId} from '../../utils/admissions';
import {monthStart} from '../../utils/reports';
import AcademicPanel from './AcademicPanel';
import RevenuePanel from './RevenuePanel';
import EvaluationPanel from './EvaluationPanel';
export default function Reports(){
 const {user}=useAuth();const branches=useBranches();const [params,setParams]=useSearchParams();
 const [allAssigned,setAllAssigned]=useState(user?.role==='ADMIN'&&params.get('allAssigned')==='true');
 const branchId=user?.role==='SUPER_ADMIN'?positiveId(params.get('branchId')):user?.branchId??undefined;
 const scope=allAssigned?'Tất cả chi nhánh được phân công':branchId?branchLabel(branches.data,branchId):'Toàn hệ thống';
 const [from,setFrom]=useState<string|undefined>(monthStart(businessDate()));const [to,setTo]=useState<string|undefined>(businessDate());
 const [revision,setRevision]=useState(0);
 const report=useRemoteResource(reportService.academic,{branchId:allAssigned?undefined:branchId,groupByBranch:user?.role==='SUPER_ADMIN'||allAssigned,allAssigned});
 return <ManagementLayout title="Báo cáo" description="Đối chiếu hoạt động, tiền thu và công nợ theo đúng phạm vi được phân quyền."
  actions={<Button onClick={()=>{report.reload();setRevision(v=>v+1);}}>Tải lại báo cáo</Button>}>
  <Card><Filters><BranchFilter branches={branches.data} loading={branches.loading} value={branchId} onChange={id=>setParams(id?{branchId:String(id)}:{})}/>
   {user?.role==='ADMIN'&&<Switch checked={allAssigned} onChange={setAllAssigned} checkedChildren="Tất cả chi nhánh được giao" unCheckedChildren="Chi nhánh đang làm việc"/>}
   <Typography.Text strong>{scope}</Typography.Text></Filters>
   <LoadError error={branches.error} reload={branches.reload}/>
   <Tabs items={[
    {key:'academic',label:'Vận hành',children:<><LoadError error={report.error} reload={report.reload}/>{report.loading?<Typography.Text>Đang tải số liệu vận hành…</Typography.Text>:report.data&&<AcademicPanel report={report.data} scope={scope}/>}</>},
    {key:'finance',label:'Tài chính',children:<RevenuePanel allAssigned={allAssigned} branchId={allAssigned?undefined:branchId} branches={branches.data} scope={scope} from={from} to={to} onRange={(a,b)=>{setFrom(a);setTo(b);}} revision={revision}/>},
    {key:'evaluation',label:'Đánh giá lớp',children:<><Typography.Paragraph type="secondary">Đánh giá lớp theo chi nhánh đang làm việc.</Typography.Paragraph><EvaluationPanel key={String(branchId)} branchId={branchId}/></>},
   ]}/>
  </Card>
 </ManagementLayout>;
}
