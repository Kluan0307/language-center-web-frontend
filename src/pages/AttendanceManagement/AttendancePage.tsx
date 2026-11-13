import {safeReturn} from '../../utils/contextNavigation';
import {dateOr} from '../../utils/scheduleView';
import {useNavigate} from 'react-router-dom';
import SheetEditor from './SheetEditor';
import SessionAttendance from './SessionAttendance';
import {useState} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {Alert,App,Button,Card,DatePicker,Input,Select,Table,Tabs,Typography} from 'antd';
import dayjs from 'dayjs';
import {ManagementLayout,Filters} from '../../components/Layout/ManagementLayout';
import {BranchFilter,LoadError} from '../../components/Common/Academic';
import {useBranches} from '../../hooks/useBranches';
import {useRemoteResource} from '../../hooks/useRemoteResource';
import {classService} from '../../services/academicService';
import {attendanceService} from '../../services/teachingService';
import {businessDate} from '../../utils/academic';
import {positiveId} from '../../utils/admissions';
import {displayDate} from '../../utils/display';
function LegacyAttendancePage(){
 const {modal}=App.useApp();const branches=useBranches();const [params,setParams]=useSearchParams();
 const classId=positiveId(params.get('classId'))??null;const router=useNavigate();const returnTo=safeReturn(params.get('returnTo'));
 const date=dateOr(params.get('date'),businessDate());
 const branchId=positiveId(params.get('branchId'));const setBranchId=(branchId?:number)=>setParams(p=>{const n=new URLSearchParams(p);if(branchId)n.set('branchId',String(branchId));else n.delete('branchId');n.delete('classId');return n;});const classes=useRemoteResource(classService.all,{branchId});
 const sheet=useRemoteResource(attendanceService.sheet,{classId,date});
 const [from,setFrom]=useState<string>();const [to,setTo]=useState<string>();const rangeError=!!from&&!!to&&from>to;
 const history=useRemoteResource(attendanceService.history,{classId:rangeError?null:classId,from,to});
 const summary=useRemoteResource(attendanceService.summary,{classId});
 const [dirty,setDirty]=useState(false);const [busy,setBusy]=useState(false);const [tab,setTab]=useState('sheet');const [search,setSearch]=useState('');
 function navigate(next:()=>void){if(busy)return;if(dirty){modal.confirm({title:'Bỏ các thay đổi chưa lưu?',content:'Dữ liệu điểm danh đang sửa sẽ không được giữ.',okText:'Bỏ thay đổi',cancelText:'Tiếp tục sửa',onOk:()=>{setDirty(false);next();}});}else next();}
 function selectClass(id:number|undefined){navigate(()=>{setParams(p=>{const n=new URLSearchParams(p);if(id)n.set('classId',String(id));else n.delete('classId');n.set('date',date);return n;});setSearch('');});}
 function selectDate(next:string){navigate(()=>{setParams(p=>{const n=new URLSearchParams(p);n.set('date',next);return n;});setTab('sheet');});}
 const visibleSummary=summary.data?.filter(r=>r.studentName.toLowerCase().includes(search.toLowerCase()))??[];
 return <ManagementLayout backNavigation={false} title="Điểm danh" description="Ghi nhận theo buổi học, xem lịch sử và tổng hợp chuyên cần theo đăng ký."
  actions={<>{returnTo&&<Button disabled={busy} onClick={()=>navigate(()=>router(returnTo))}>Quay lại</Button>}<Button disabled={busy} onClick={()=>navigate(()=>{sheet.reload();history.reload();summary.reload();})}>Tải lại</Button></>}>
  <Card><Alert showIcon type="info" title="Điểm danh theo buổi thực tế" description={<Link to="/schedule">Mở lịch học để chọn đúng buổi, gồm cả học bù và dạy thay.</Link>} style={{marginBottom:16}}/><Filters>
   <BranchFilter branches={branches.data} loading={branches.loading} value={branchId} onChange={id=>navigate(()=>{setBranchId(id);})}/>
   <Select className="filter" style={{minWidth:300}} aria-label="Lớp điểm danh" placeholder="Chọn lớp" allowClear showSearch optionFilterProp="label" value={classId??undefined} disabled={busy} loading={classes.loading}
    options={classes.data?.map(c=>({value:c.id,label:c.code+' · '+c.name}))} onChange={selectClass}/>
   <DatePicker aria-label="Ngày điểm danh" value={dayjs(date)} allowClear={false} disabled={busy} format="DD/MM/YYYY" needConfirm={false} disabledDate={d=>d.format('YYYY-MM-DD')>businessDate()} onChange={d=>{if(d)selectDate(d.format('YYYY-MM-DD'));}}/>
  </Filters><LoadError error={classes.error} reload={classes.reload}/>
  {!classId?<Alert showIcon type="info" title="Chọn lớp để xem và ghi điểm danh"/>:<Tabs activeKey={tab} onChange={setTab} items={[
   {key:'sheet',label:'Điểm danh buổi học',children:<><LoadError error={sheet.error} reload={()=>navigate(sheet.reload)}/>{sheet.loading?<Typography.Text>Đang tải danh sách buổi học…</Typography.Text>:sheet.data&&<SheetEditor key={classId+':'+date+':'+JSON.stringify(sheet.data)} sheet={sheet.data} onDirty={setDirty} onBusy={setBusy} onSaved={()=>{sheet.reload();history.reload();summary.reload();}}/>}</>},
   {key:'history',label:'Lịch sử',children:<><Filters><DatePicker placeholder="Từ ngày" format="DD/MM/YYYY" value={from?dayjs(from):null} onChange={d=>setFrom(d?.format('YYYY-MM-DD'))}/><DatePicker placeholder="Đến ngày" format="DD/MM/YYYY" value={to?dayjs(to):null} onChange={d=>setTo(d?.format('YYYY-MM-DD'))}/></Filters>
    {rangeError&&<Alert type="warning" title="Từ ngày không được sau đến ngày"/>}<LoadError error={history.error} reload={history.reload}/>
    <Table rowKey="sessionDate" dataSource={history.data??[]} loading={history.loading} columns={[
     {title:'Ngày học',dataIndex:'sessionDate',render:(v:string)=>displayDate(v,false)},{title:'Có mặt',dataIndex:'present'},{title:'Vắng',dataIndex:'absent'},{title:'Đi muộn',dataIndex:'late'},
     {title:'Chi tiết',render:(_,r)=><Button type="link" onClick={()=>selectDate(r.sessionDate)}>Mở buổi</Button>},
    ]}/></>},
   {key:'summary',label:'Tổng hợp chuyên cần',children:<><Input.Search placeholder="Tìm học viên trong tổng hợp" allowClear value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:360,marginBottom:16}}/><LoadError error={summary.error} reload={summary.reload}/>
    <Table rowKey="enrollmentId" dataSource={visibleSummary} loading={summary.loading} scroll={{x:850}} columns={[
     {title:'Học viên',dataIndex:'studentName'},{title:'Đăng ký',dataIndex:'enrollmentId',render:v=>'#'+v},{title:'Có mặt',dataIndex:'present'},{title:'Vắng',dataIndex:'absent'},{title:'Đi muộn',dataIndex:'late'},
     {title:'Buổi đã ghi nhận',dataIndex:'totalSessions'},{title:'Tỷ lệ tham gia',dataIndex:'participationRate',render:(v:number,r)=>r.totalSessions?v+'%':'Chưa có dữ liệu'},
    ]}/><Typography.Paragraph type="secondary">Tỷ lệ = (Có mặt + Đi muộn) / số buổi đã ghi nhận. Chưa điểm danh không tự tính là vắng. Tách theo đăng ký để giữ lịch sử bảo lưu/chuyển lớp.</Typography.Paragraph></>},
  ]}/>}
  </Card>
 </ManagementLayout>;
}

export default function AttendancePage(){const [params]=useSearchParams();const id=positiveId(params.get('sessionId'));return id?<SessionAttendance id={id}/>:<LegacyAttendancePage/>;}
