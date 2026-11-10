import {useState} from 'react';
import {Alert,Col,DatePicker,Form,Input,Modal,Row} from 'antd';
import dayjs from 'dayjs';import type {Dayjs} from 'dayjs';
import {teacherProfileService} from '../../services/teacherProfileService';
import {useFormLeaveGuard} from '../../hooks/useFormLeaveGuard';
import {getErrorMessage,applyFormErrors} from '../../utils/apiErrors';
import type {TeacherProfile,TeacherProfileUpdate} from '../../types/teacherProfile';
type Values=Omit<TeacherProfileUpdate,'version'|'hireDate'>&{hireDate?:Dayjs};
export default function TeacherProfileForm({profile,onClose,onSaved}:{profile:TeacherProfile;onClose:()=>void;onSaved:()=>void}){
 const [form]=Form.useForm<Values>();const [busy,setBusy]=useState(false);const [error,setError]=useState<string>();const leave=useFormLeaveGuard(busy,onClose);
 async function save(v:Values){if(busy)return;setBusy(true);setError(undefined);try{await teacherProfileService.update(profile.profileId,{...v,version:profile.version,fullName:v.fullName.trim(),hireDate:v.hireDate?.format('YYYY-MM-DD')??null});onSaved();}catch(e){applyFormErrors(form,e);setError(getErrorMessage(e));}finally{setBusy(false);}}
 return <Modal open title="Cập nhật hồ sơ giáo viên" width={760} okText="Lưu hồ sơ" cancelText="Hủy" onOk={()=>form.submit()} onCancel={leave.cancel} confirmLoading={busy} closable={!busy} maskClosable={!busy} cancelButtonProps={{disabled:busy}}>
 {error&&<Alert showIcon type="error" title={error} style={{marginBottom:16}}/>}
 <Form<Values> name="teacherProfile" form={form} layout="vertical" initialValues={{...profile,hireDate:profile.hireDate?dayjs(profile.hireDate):undefined}} onFinish={save} onValuesChange={leave.changed} disabled={busy}><Row gutter={16}>
 <Col span={24}><Form.Item name="fullName" label="Họ và tên" rules={[{required:true,whitespace:true,message:'Nhập họ tên.'},{max:100}]}><Input maxLength={100}/></Form.Item></Col>
 <Col xs={24} sm={12}><Form.Item name="email" label="Email" rules={[{type:'email'},{max:100}]}><Input maxLength={100}/></Form.Item></Col>
 <Col xs={24} sm={12}><Form.Item name="phone" label="Điện thoại" rules={[{pattern:/^$|^[+0-9() .-]{6,15}$/,message:'Số điện thoại không hợp lệ.'}]}><Input maxLength={15}/></Form.Item></Col>
 <Col xs={24} sm={12}><Form.Item name="specialization" label="Chuyên môn" rules={[{max:100}]}><Input maxLength={100}/></Form.Item></Col>
 <Col xs={24} sm={12}><Form.Item name="qualification" label="Bằng cấp / trình độ" rules={[{max:100}]}><Input maxLength={100}/></Form.Item></Col>
 <Col xs={24} sm={12}><Form.Item name="experience" label="Kinh nghiệm" rules={[{max:50}]}><Input maxLength={50}/></Form.Item></Col>
 <Col xs={24} sm={12}><Form.Item name="hireDate" label="Ngày vào làm"><DatePicker format="DD/MM/YYYY" style={{width:'100%'}}/></Form.Item></Col>
 <Col span={24}><Form.Item name="certificate" label="Chứng chỉ" rules={[{max:255}]}><Input.TextArea maxLength={255}/></Form.Item></Col>
 </Row></Form></Modal>;
}
