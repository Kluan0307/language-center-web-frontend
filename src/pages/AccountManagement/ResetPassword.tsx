import {useState} from 'react';
import {Alert,App,Form,Input,Modal} from 'antd';
import axios from 'axios';
import {authService} from '../../services/authService';
import {getErrorMessage} from '../../utils/apiErrors';
import {passwordError} from '../../utils/accountSecurity';
import type {UserResponse,ResetPasswordRequest} from '../../types/auth';
export default function ResetPassword({account,onClose,onSaved}:{account:UserResponse;onClose:()=>void;onSaved:()=>void}){
 const [form]=Form.useForm<ResetPasswordRequest>();const [saving,setSaving]=useState(false);const [error,setError]=useState<string>();const {message}=App.useApp();
 async function save(values:ResetPasswordRequest){
  if(saving)return;setSaving(true);setError(undefined);
  try{await authService.resetPassword(account.accountId,{...values,reason:values.reason.trim()});message.success('Đã cấp lại mật khẩu. Người dùng phải đổi mật khẩu khi đăng nhập.');onSaved();}
  catch(e){const unknown=axios.isAxiosError(e)&&(!e.response||e.response.status>=500);setError(getErrorMessage(e)+(unknown?' Có thể yêu cầu đã được xử lý. Kiểm tra đăng nhập bằng mật khẩu tạm trước khi gửi lại.':''));}
  finally{setSaving(false);}
 }
 return <Modal open title={'Cấp lại mật khẩu · '+account.username} onCancel={()=>{if(!saving)onClose();}} onOk={()=>form.submit()} confirmLoading={saving} cancelButtonProps={{disabled:saving}} closable={!saving} maskClosable={!saving} okText="Cấp lại mật khẩu" cancelText="Hủy">
  <Alert type="warning" showIcon title="Tất cả phiên của tài khoản sẽ hết hiệu lực" description="Chuyển mật khẩu tạm cho đúng người dùng. Họ phải đổi mật khẩu trước khi vào nghiệp vụ. Tài khoản đang khóa vẫn giữ trạng thái khóa." style={{marginBottom:16}}/>
  <Form form={form} layout="vertical" onFinish={save} disabled={saving}>
   {error&&<Alert type="error" showIcon title={error} style={{marginBottom:16}}/>}
   <Form.Item name="temporaryPassword" label="Mật khẩu tạm" rules={[{validator:(_,value:string)=>{const error=passwordError(value);return error?Promise.reject(new Error(error)):Promise.resolve();}}]}><Input.Password autoComplete="new-password" maxLength={72}/></Form.Item>
   <Form.Item name="confirmPassword" label="Xác nhận mật khẩu tạm" dependencies={['temporaryPassword']} rules={[{required:true,message:'Nhập lại mật khẩu tạm.'},({getFieldValue})=>({validator:(_,value:string)=>value===getFieldValue('temporaryPassword')?Promise.resolve():Promise.reject(new Error('Mật khẩu xác nhận chưa khớp.'))})]}><Input.Password autoComplete="new-password" maxLength={72}/></Form.Item>
   <Form.Item name="reason" label="Lý do cấp lại" rules={[{required:true,whitespace:true,message:'Nhập lý do.'},{min:3,max:255}]}><Input.TextArea rows={3} maxLength={255}/></Form.Item>
  </Form>
 </Modal>;
}
