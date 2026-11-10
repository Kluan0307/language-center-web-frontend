import {useState} from 'react';import {Alert,Form,Input,Modal,Select} from 'antd';
import {teacherProfileService} from '../../services/teacherProfileService';import {useFormLeaveGuard} from '../../hooks/useFormLeaveGuard';import {getErrorMessage} from '../../utils/apiErrors';import type {TeacherProfile} from '../../types/teacherProfile';
export default function TeacherWorkStatusForm({profile,blocked,onClose,onSaved}:{profile:TeacherProfile;blocked:boolean;onClose:()=>void;onSaved:()=>void}){
 const [form]=Form.useForm<{workStatus:'ACTIVE'|'INACTIVE';reason:string}>();const [busy,setBusy]=useState(false);const [error,setError]=useState<string>();const leave=useFormLeaveGuard(busy,onClose);
 async function save(v:{workStatus:'ACTIVE'|'INACTIVE';reason:string}){if(busy||v.workStatus==='INACTIVE'&&blocked)return;setBusy(true);setError(undefined);try{await teacherProfileService.workStatus(profile.profileId,{...v,reason:v.reason.trim(),version:profile.version});onSaved();}catch(e){setError(getErrorMessage(e));}finally{setBusy(false);}}
 return <Modal open title="Trạng thái làm việc giáo viên" okText="Xác nhận" cancelText="Hủy" confirmLoading={busy} onOk={()=>form.submit()} onCancel={leave.cancel} closable={!busy} maskClosable={!busy} cancelButtonProps={{disabled:busy}}>
 <Alert showIcon type="info" title="Trạng thái làm việc và đăng nhập được quản lý riêng." description="Ngừng làm việc cần bàn giao mọi trách nhiệm. Khóa đăng nhập vì bảo mật vẫn thực hiện ở danh sách tài khoản."/>
 {blocked&&<Alert showIcon type="warning" title="Còn trách nhiệm chưa xử lý hoặc chưa tải được danh sách; chưa thể ngừng làm việc."/>}{error&&<Alert showIcon type="error" title={error}/>}
 <Form name="teacherWorkStatus" form={form} layout="vertical" onFinish={save} onValuesChange={leave.changed} disabled={busy} initialValues={{workStatus:profile.workStatus==='ACTIVE'?'INACTIVE':'ACTIVE'}}>
 <Form.Item name="workStatus" label="Trạng thái mới" rules={[{required:true}]}><Select options={[{value:'ACTIVE',label:'Đang làm việc'},{value:'INACTIVE',label:'Ngừng làm việc',disabled:blocked}]}/></Form.Item>
 <Form.Item name="reason" label="Lý do" rules={[{required:true,whitespace:true},{min:3,max:500}]}><Input.TextArea maxLength={500} rows={3}/></Form.Item></Form></Modal>;
}
