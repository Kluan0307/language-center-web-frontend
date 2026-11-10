import {useState} from 'react';
import {Alert,App,Button,Form,Input,Space} from 'antd';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import {authService} from '../../../services/authService';
import {useAuth} from '../../../hooks/useAuth';
import {passwordError} from '../../../utils/accountSecurity';
import {getErrorMessage} from '../../../utils/apiErrors';
import type {ChangePasswordRequest} from '../../../types/auth';
export default function PasswordForm(){
 const [saving,setSaving]=useState(false);const [error,setError]=useState<string>();const [uncertain,setUncertain]=useState(false);
 const {logout}=useAuth();const navigate=useNavigate();const {message}=App.useApp();
 async function save(values:ChangePasswordRequest){
  if(saving)return;setSaving(true);setError(undefined);setUncertain(false);
  try{await authService.changePassword(values);message.success('Đã đổi mật khẩu và đăng xuất tất cả phiên. Hãy đăng nhập lại.');logout();navigate('/login',{replace:true});}
  catch(e){setError(getErrorMessage(e));setUncertain(axios.isAxiosError(e)&&(!e.response||e.response.status>=500));}
  finally{setSaving(false);}
 }
 return <Form<ChangePasswordRequest> layout="vertical" onFinish={save} disabled={saving}>
  {error&&<Alert type="error" showIcon title={error} style={{marginBottom:16}}/>}
  {uncertain&&<Alert type="warning" showIcon title="Chưa xác định được kết quả đổi mật khẩu" description="Hãy đăng nhập lại bằng mật khẩu mới. Nếu chưa được, thử mật khẩu cũ trước khi thực hiện lại." style={{marginBottom:16}} action={<Button onClick={()=>{logout();navigate('/login',{replace:true});}}>Đăng nhập lại</Button>}/>}
  <Form.Item name="currentPassword" label="Mật khẩu hiện tại" rules={[{required:true,message:'Nhập mật khẩu hiện tại.'}]}><Input.Password autoComplete="current-password" maxLength={72}/></Form.Item>
  <Form.Item name="newPassword" label="Mật khẩu mới" rules={[{validator:(_,value:string)=>{const error=passwordError(value);return error?Promise.reject(new Error(error)):Promise.resolve();}}]}><Input.Password autoComplete="new-password" maxLength={72}/></Form.Item>
  <Form.Item name="confirmPassword" label="Xác nhận mật khẩu mới" dependencies={['newPassword']} rules={[{required:true,message:'Nhập lại mật khẩu mới.'},({getFieldValue})=>({validator:(_,value:string)=>value===getFieldValue('newPassword')?Promise.resolve():Promise.reject(new Error('Mật khẩu xác nhận chưa khớp.'))})]}><Input.Password autoComplete="new-password" maxLength={72}/></Form.Item>
  <Space wrap><Button type="primary" htmlType="submit" loading={saving}>Đổi mật khẩu</Button></Space>
 </Form>;
}
