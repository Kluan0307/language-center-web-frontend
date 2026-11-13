import {displayDate} from '../../utils/display';
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
import {dateOr} from '../../utils/scheduleView';
import {positiveId} from '../../utils/admissions';
import {monthStart} from '../../utils/reports';
import AcademicPanel from './AcademicPanel';
import RevenuePanel from './RevenuePanel';
import EvaluationPanel from './EvaluationPanel';
export default function Reports(){
 const {user}=useAuth();const branches=useBranches();const [params,setParams]=useSearchParams();
 const allAssigned=user?.role==='ADMIN'&&params.get('allAssigned')==='true';
 const patch=(values:Record<string,string|undefined>)=>setParams(p=>{const n=new URLSearchParams(p);for(const[k,v]of Object.entries(values)){if(v===undefined)n.delete(k);else n.set(k,v);}return n;});
 const setAllAssigned=(value:boolean)=>patch({allAssigned:value?'true':undefined,branchId:undefined});
 const branchId=user?.role==='SUPER_ADMIN'?positiveId(params.get('branchId')):user?.branchId??undefined;
 const scope=allAssigned?'Tất cả chi nhánh được phân công':branchId?branchLabel(branches.data,branchId):'Toàn hệ thống';
 const from=params.get('from')===''?undefined:dateOr(params.get('from'),monthStart(businessDate()));const to=params.get('to')===''?undefined:dateOr(params.get('to'),businessDate());
 const [revision,setRevision]=useState(0);
 const report=useRemoteResource(reportService.academic,{branchId:allAssigned?undefined:branchId,groupByBranch:user?.role==='SUPER_ADMIN'||allAssigned,allAssigned});
 return <ManagementLayout title="Báo cáo" description="Đối chiếu hoạt động, tiền thu và công nợ theo đúng phạm vi được phân quyền."
 scopeLabel={scope} actions={<Button onClick={()=>{report.reload();setRevision(v=>v+1);}}>Tải lại báo cáo</Button>}>
  <Card><Filters><BranchFilter branches={branches.data} loading={branches.loading} value={branchId} onChange={id=>patch({branchId:id?String(id):undefined,allAssigned:undefined})}/>
   {user?.role==='ADMIN'&&<Switch checked={allAssigned} onChange={setAllAssigned} checkedChildren="Tất cả chi nhánh được giao" unCheckedChildren="Chi nhánh đang làm việc"/>}
   <Typography.Text strong>{scope}</Typography.Text></Filters>
   <LoadError error={branches.error} reload={branches.reload}/>{report.loadedAt&&<Typography.Text type="secondary">Tải dữ liệu vận hành lúc {displayDate(report.loadedAt)}</Typography.Text>}
   <Tabs activeKey={['academic','finance','evaluation'].includes(params.get('tab')??'')?params.get('tab')!:'academic'} onChange={tab=>patch({tab})} items={[
    {key:'academic',label:'Vận hành',children:<><LoadError error={report.error} reload={report.reload}/>{report.loading?<Typography.Text>Đang tải số liệu vận hành…</Typography.Text>:report.data&&<AcademicPanel report={report.data} scope={scope}/>}</>},
    {key:'finance',label:'Tài chính',children:<RevenuePanel allAssigned={allAssigned} branchId={allAssigned?undefined:branchId} branches={branches.data} scope={scope} from={from} to={to} onRange={(a,b)=>patch({from:a??'',to:b??''})} revision={revision}/>},
    {key:'evaluation',label:'Đánh giá lớp',children:<><Typography.Paragraph type="secondary">Đánh giá lớp theo chi nhánh được chọn; khi xem tổng hợp dùng chi nhánh đang làm việc.</Typography.Paragraph><EvaluationPanel key={String(branchId)} branchId={branchId}/></>},
   ]}/>
  </Card>
 </ManagementLayout>;
}
