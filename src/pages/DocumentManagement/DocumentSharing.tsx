import {useState} from 'react';
import {Alert,Button,Input,Modal,Space,Tag} from 'antd';
import {api} from '../../api/axiosInstance';
import {getErrorMessage} from '../../utils/apiErrors';
import type {DocumentDto} from '../../types/teaching';
export default function DocumentSharing({document:d,onSaved}:{document:DocumentDto;onSaved:()=>void}){
 const [open,setOpen]=useState(false),[busy,setBusy]=useState(false),[reason,setReason]=useState(''),[error,setError]=useState<string>();
 return <Space><Tag color={d.sharedToStudents?'blue':'default'}>{d.sharedToStudents?'Đã chia sẻ cho học viên':'Chưa chia sẻ'}</Tag><Button disabled={d.status!=='APPROVED'&&!d.sharedToStudents} danger={d.sharedToStudents} onClick={()=>{setError(undefined);setOpen(true);}}>{d.sharedToStudents?'Ngừng chia sẻ':'Chia sẻ cho học viên'}</Button><Modal open={open} title={d.sharedToStudents?'Ngừng chia sẻ tài liệu':'Chia sẻ tài liệu đã duyệt'} confirmLoading={busy} closable={!busy} maskClosable={!busy} cancelButtonProps={{disabled:busy}} okButtonProps={{disabled:reason.trim().length<3}} okText="Xác nhận" cancelText="Hủy" onCancel={()=>{if(!busy)setOpen(false);}} onOk={()=>{if(busy)return;setBusy(true);setError(undefined);void api.patch('/teaching/documents/'+d.id+'/student-sharing',{version:d.version,sharedToStudents:!d.sharedToStudents,reason:reason.trim()}).then(()=>{setOpen(false);setReason('');onSaved();}).catch(e=>setError(getErrorMessage(e))).finally(()=>setBusy(false));}}>
 {error&&<Alert type="error" showIcon title={error}/>}
 <p>{d.sharedToStudents?'Học viên sẽ không thể tải tài liệu qua ứng dụng kể từ khi ngừng chia sẻ.':'Chỉ học viên có đăng ký lớp/khóa phù hợp mới xem và tải tài liệu. Mô tả và file hiện tại được chia sẻ cùng nhau.'}</p><Input.TextArea aria-label="Lý do chia sẻ" value={reason} maxLength={500} rows={3} onChange={e=>setReason(e.target.value)} placeholder="Lý do"/>
 </Modal></Space>;
}
