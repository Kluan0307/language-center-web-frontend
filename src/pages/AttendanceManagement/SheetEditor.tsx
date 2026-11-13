import {useState} from 'react';
import {Alert,App,Button,Checkbox,Input,Select,Space,Table,Tag} from 'antd';
import {attendanceService} from '../../services/teachingService';
import {attendancePayload,ATTENDANCE_LABELS} from '../../utils/teaching';
import {getErrorMessage} from '../../utils/apiErrors';
import type {AttendanceRow,AttendanceSheet,AttendanceStatus} from '../../types/teaching';
export default function SheetEditor({sheet,onSaved,onDirty,onBusy}:{sheet:AttendanceSheet;onSaved:()=>void;onDirty:(dirty:boolean)=>void;onBusy:(busy:boolean)=>void}){
 const {message}=App.useApp();const [rows,setRows]=useState<AttendanceRow[]>(sheet.records);const [busy,setBusy]=useState(false);const [dirty,setDirty]=useState(false);const [error,setError]=useState<string>();const [reason,setReason]=useState('');
 function change(id:number,status:AttendanceStatus,permission?:boolean){setRows(prev=>prev.map(r=>r.enrollmentId===id?{...r,status,hasPermission:status==='ABSENT'&&(permission??r.hasPermission)}:r));setDirty(true);onDirty(true);}
 async function save(){if(busy||!sheet.canEdit)return;if(sheet.correctionRequired&&reason.trim().length<3){setError('Nhập lý do sửa điểm danh từ 3 ký tự.');return;}setBusy(true);onBusy(true);setError(undefined);
  try{const saved=await attendanceService.save(sheet.classId,sheet.sessionDate,attendancePayload(rows),{sessionId:sheet.sessionId,version:sheet.version,reason:sheet.correctionRequired?reason.trim():undefined});setRows(saved.records);setDirty(false);onDirty(false);onSaved();message.success('Đã lưu điểm danh.');}
  catch(e){setError(getErrorMessage(e));}finally{setBusy(false);onBusy(false);}
 }
 return <>
  <Alert type={rows.every(r=>r.saved)?'success':'info'} showIcon style={{marginBottom:16}} title={rows.every(r=>r.saved)&&rows.length?'Buổi học đã có dữ liệu điểm danh':'Kiểm tra danh sách trước khi lưu'}
   description="Các dòng chưa lưu mặc định Có mặt để nhập nhanh; chưa được tính chuyên cần cho đến khi bấm Lưu điểm danh. Có phép chỉ áp dụng khi Vắng."/>
  {error&&<Alert showIcon type="error" title={error} description="Nếu danh sách đã thay đổi do bảo lưu/chuyển lớp, hãy tải lại buổi học và kiểm tra lại trước khi lưu." style={{marginBottom:16}}/>}
  {!sheet.canEdit&&<Alert type="info" showIcon title="Buổi này chỉ được xem" description="Buổi đã lưu chỉ Admin được sửa với lý do; giáo viên chỉ ghi buổi thực tế được giao." style={{marginBottom:16}}/>}
  {sheet.canEdit&&sheet.correctionRequired&&<Input.TextArea aria-label="Lý do sửa điểm danh" placeholder="Lý do sửa điểm danh (bắt buộc)" value={reason} onChange={e=>setReason(e.target.value)} maxLength={500} rows={2} style={{marginBottom:16}}/>}
  <Space wrap style={{marginBottom:16}}><Button disabled={busy||!sheet.canEdit||!rows.length} onClick={()=>{setRows(prev=>prev.map(r=>({...r,status:'PRESENT',hasPermission:false})));setDirty(true);onDirty(true);}}>Tất cả có mặt</Button>
   <Button type="primary" loading={busy} disabled={!sheet.canEdit||!rows.length} onClick={()=>void save()}>Lưu điểm danh</Button>{dirty&&<Tag color="orange">Có thay đổi chưa lưu</Tag>}</Space>
  <Table<AttendanceRow> rowKey="enrollmentId" dataSource={rows} pagination={false} scroll={{x:950}} locale={{emptyText:'Không có học viên có hiệu lực tại ngày này'}} columns={[
   {title:'Học viên',dataIndex:'studentName',fixed:'left',width:220},{title:'Trình độ',dataIndex:'currentLevel',render:v=>v||'—'},
   {title:'Trạng thái',key:'status',width:180,render:(_,r)=><Select aria-label={'Điểm danh '+r.studentName} style={{width:160}} value={r.status} disabled={busy||!sheet.canEdit||!rows.length} options={Object.entries(ATTENDANCE_LABELS).map(([value,label])=>({value,label}))} onChange={s=>change(r.enrollmentId,s)}/>},
   {title:'Có phép',key:'permission',render:(_,r)=><Checkbox checked={r.hasPermission} disabled={busy||!sheet.canEdit||r.status!=='ABSENT'} onChange={e=>change(r.enrollmentId,r.status,e.target.checked)}/>},
   {title:'Đã lưu',dataIndex:'saved',render:v=><Tag color={v?'green':'default'}>{v?'Đã lưu':'Chưa lưu'}</Tag>},
   {title:'Người ghi gần nhất',dataIndex:'recordedByName',render:v=>v||'—'},
  ]}/>
 </>;
}
