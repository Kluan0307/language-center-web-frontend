import TableActions from '../../components/Common/TableActions';
import {useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {Alert,App,Button,Card,Descriptions,Drawer,Select,Space,Table,Tag,Typography} from 'antd';
import {ManagementLayout,Filters} from '../../components/Layout/ManagementLayout';
import {BranchFilter,LoadError} from '../../components/Common/Academic';
import {useAuth} from '../../hooks/useAuth';
import {useBranches} from '../../hooks/useBranches';
import {useRemoteResource} from '../../hooks/useRemoteResource';
import {classService,courseService} from '../../services/academicService';
import {documentService} from '../../services/teachingService';
import {branchLabel} from '../../utils/academic';
import {positiveId} from '../../utils/admissions';
import {DOCUMENT_LABELS,fileSize,isTeachingManager} from '../../utils/teaching';
import {displayDate} from '../../utils/display';
import {getErrorMessage} from '../../utils/apiErrors';
import UploadForm from './UploadForm';
import ReviewForm from './ReviewForm';
import ResubmitForm from './ResubmitForm';
import DocumentHistory from './DocumentHistory';
import type {DocumentDto,DocumentQuery,DocumentStatus} from '../../types/teaching';
function StatusTag({status}:{status:DocumentStatus}){return <Tag color={status==='APPROVED'?'green':status==='REJECTED'?'red':'orange'}>{DOCUMENT_LABELS[status]}</Tag>;}
async function loadCourses({branchId,teacher}:{branchId?:number;teacher:boolean},signal?:AbortSignal){return teacher?[]:courseService.all({branchId},signal);}
export default function DocumentManagement(){
 const {user}=useAuth();const admin=isTeachingManager(user?.role);const {message}=App.useApp();const branches=useBranches();const [params,setParams]=useSearchParams();
 const selectedId=positiveId(params.get('documentId'))??null;
 const [query,setQuery]=useState<DocumentQuery>({page:0,size:10});
 const list=useRemoteResource(documentService.list,query);const detail=useRemoteResource(documentService.detail,{id:selectedId});
 const classes=useRemoteResource(classService.all,{branchId:query.branchId});
 const courses=useRemoteResource(loadCourses,{branchId:query.branchId,teacher:user?.role==='TEACHER'});
 const [resubmit,setResubmit]=useState<DocumentDto|null>(null);
 const [upload,setUpload]=useState(false);const [review,setReview]=useState<DocumentDto|null>(null);const [busyId,setBusyId]=useState<number|null>(null);
 function refresh(){list.reload();detail.reload();}
 function saved(d:DocumentDto){setUpload(false);setReview(null);setResubmit(null);setParams({documentId:String(d.id)});setQuery(q=>({...q,page:0}));refresh();message.success('Đã lưu tài liệu.');}
 async function download(d:DocumentDto){if(busyId!==null)return;setBusyId(d.id);
  try{const blob=await documentService.download(d.id);const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=d.filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  catch(e){message.error(getErrorMessage(e));}finally{setBusyId(null);}
 }
 const actions=(d:DocumentDto,view=true)=><TableActions items={[
    {
        key: "action-1", label: "Tải file", disabled: busyId !== null, loading: busyId === d.id, onClick: () => void download(d)
    },
    ...((d.status === 'REJECTED' && d.uploadedBy === user?.accountId) ? ([
        {
            key: "action-2", label: "Sửa / gửi lại", onClick: () => setResubmit(d)
        }
    ]) : []), ...((admin && d.status === 'PENDING') ? ([
        {
            key: "action-3", label: "Duyệt", onClick: () => setReview(d)
        }
    ]) : [])
]}>{view && <Button size="small" onClick={() => setParams({
    documentId: String(d.id)
})}>Xem</Button>}</TableActions>;
 const d=detail.data;
 return <ManagementLayout title={user?.role==='TEACHER'?'Tài liệu của tôi':'Tài liệu'} description="Tải lên, duyệt và tải tài liệu theo đúng quyền của từng vai trò."
  actions={<><Button loading={list.loading} onClick={refresh}>Tải lại</Button>{user?.role!=='STAFF'&&<Button type="primary" onClick={()=>setUpload(true)}>Tải tài liệu lên</Button>}</>}>
  {user?.role==='STAFF'&&<Alert type="info" showIcon title="Chỉ hiển thị tài liệu đã được duyệt trong chi nhánh" style={{marginBottom:16}}/>}
  <LoadError error={list.error} reload={list.reload}/>
  <Card><Filters>
   <BranchFilter branches={branches.data} loading={branches.loading} value={query.branchId} onChange={branchId=>{setQuery({page:0,size:query.size,branchId});setParams({});}}/>
   <Select className="filter" style={{minWidth:280}} placeholder="Tất cả lớp" allowClear showSearch optionFilterProp="label" value={query.classId} loading={classes.loading}
    options={classes.data?.map(c=>({value:c.id,label:c.code+' · '+c.name}))} onChange={classId=>setQuery(q=>({...q,classId,courseId:undefined,page:0}))}/>
   <Select className="filter" style={{minWidth:220}} placeholder="Tất cả khóa" allowClear showSearch optionFilterProp="label" value={query.courseId}
    options={user?.role==='TEACHER'?[...new Map(classes.data?.map(c=>[c.courseId,{value:c.courseId,label:c.courseName}])??[]).values()]:courses.data?.map(c=>({value:c.id,label:c.code+' · '+c.name}))} onChange={courseId=>setQuery(q=>({...q,courseId,classId:undefined,page:0}))}/>
   {user?.role!=='STAFF'&&<Select className="filter" placeholder="Tất cả trạng thái" allowClear value={query.status}
    options={Object.entries(DOCUMENT_LABELS).map(([value,label])=>({value,label}))} onChange={status=>setQuery(q=>({...q,status,page:0}))}/>}
   <Typography.Text type="secondary">{list.data?.totalElements??0} tài liệu</Typography.Text>
  </Filters><LoadError error={classes.error} reload={classes.reload}/><LoadError error={courses.error} reload={courses.reload}/>
  <Table<DocumentDto> rowKey="id" loading={list.loading} dataSource={list.data?.content??[]} scroll={{x:1400}} columns={[
   {title:'Tài liệu',key:'title',width:270,render:(_,v)=><div><Button type="link" style={{padding:0}} onClick={()=>setParams({documentId:String(v.id)})}>{v.title}</Button><div><Typography.Text type="secondary">{v.filename} · {fileSize(v.fileSize)}</Typography.Text></div></div>},
   {title:'Phạm vi',key:'target',render:(_,v)=>v.classId?classes.data?.find(c=>c.id===v.classId)?.name||'Lớp #'+v.classId:'Khóa #'+v.courseId},
   {title:'Phiên / gửi gần nhất',key:'revision',render:(_,v)=><>Phiên {v.revision}<div>{displayDate(v.lastSubmittedAt)}</div></>},
   {title:'Người tải lên',dataIndex:'uploadedByName'},{title:'Ngày tải',dataIndex:'uploadedAt',render:(v:string)=>displayDate(v)},
   {title:'Trạng thái',dataIndex:'status',render:(v:DocumentStatus)=><StatusTag status={v}/>},
   ...(user?.role==='SUPER_ADMIN'?[{title:'Chi nhánh',dataIndex:'branchId',render:(id:number)=>branchLabel(branches.data,id)}]:[]),
   {title:'Thao tác',key:'actions',fixed:'right',width:160,render:(_,v)=>actions(v)},
  ]} pagination={{current:query.page+1,pageSize:query.size,total:list.data?.totalElements??0,showSizeChanger:true,onChange:(page,size)=>setQuery(q=>({...q,page:size!==q.size?0:page-1,size}))}}/>
  </Card>
  <Drawer open={selectedId!==null} title="Chi tiết tài liệu" size={760} loading={detail.loading} onClose={()=>setParams({})}>
   <LoadError error={detail.error} reload={detail.reload}/>
   {d&&<><Space wrap style={{marginBottom:16}}>{actions(d,false)}</Space><Descriptions bordered column={1} items={[
    {key:'title',label:'Tiêu đề',children:d.title},{key:'file',label:'File',children:d.filename+' · '+fileSize(d.fileSize)},
    {key:'description',label:'Mô tả',children:<span style={{whiteSpace:'pre-wrap'}}>{d.description||'—'}</span>},
    {key:'branch',label:'Chi nhánh',children:branchLabel(branches.data,d.branchId)},
    {key:'target',label:'Phạm vi',children:d.classId?classes.data?.find(c=>c.id===d.classId)?.name||'Lớp #'+d.classId:'Khóa #'+d.courseId},
    {key:'status',label:'Trạng thái',children:<StatusTag status={d.status}/>},{key:'by',label:'Người tải lên',children:d.uploadedByName},{key:'at',label:'Tải lên lúc',children:displayDate(d.uploadedAt)},
    {key:'reviewer',label:'Người duyệt',children:d.reviewedByName||'—'},{key:'reviewed',label:'Duyệt lúc',children:displayDate(d.reviewedAt)},{key:'reason',label:'Lý do từ chối',children:d.rejectReason||'—'},
   ]}/>{user?.role!=='STAFF'&&<DocumentHistory id={d.id} version={d.version}/>}</>}
  </Drawer>
  {resubmit&&<ResubmitForm document={resubmit} onClose={()=>setResubmit(null)} onSaved={saved}/>}
  {upload&&<UploadForm defaultBranchId={query.branchId??user?.branchId??undefined} onClose={()=>{setUpload(false);list.reload();}} onSaved={saved}/>}
  {review&&<ReviewForm document={review} onClose={()=>setReview(null)} onSaved={saved}/>}
 </ManagementLayout>;
}
