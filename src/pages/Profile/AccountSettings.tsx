import {useState} from 'react';
import {Alert,App,Button,Card,Form,Input,Typography} from 'antd';
import {useNavigate} from 'react-router-dom';
import {authService} from '../../services/authService';
import {useAuth} from '../../hooks/useAuth';
import {getErrorMessage} from '../../utils/apiErrors';
import PasswordForm from '../../components/Common/AccountSecurity/PasswordForm';
export default function AccountSettings(){
 const {user,refreshUser,logout}=useAuth();const {message,modal}=App.useApp();const navigate=useNavigate();
 const [saving,setSaving]=useState(false);const [revoking,setRevoking]=useState(false);const [error,setError]=useState<string>();
 async function save(values:{email?:string;phone?:string}){
  if(saving)return;setSaving(true);setError(undefined);
  try{await authService.updateProfile({email:values.email?.trim()||null,phone:values.phone?.trim()||null});message.success('Đã cập nhật thông tin liên hệ.');void refreshUser();}
  catch(e){setError(getErrorMessage(e));}finally{setSaving(false);}
 }
 function revoke(){modal.confirm({title:'Đăng xuất tất cả phiên?',content:'Tất cả thiết bị, kể cả phiên hiện tại, sẽ phải đăng nhập lại.',okText:'Đăng xuất tất cả',cancelText:'Hủy',onOk:async()=>{setRevoking(true);try{await authService.logoutAll();logout();navigate('/login',{replace:true});message.success('Đã đăng xuất tất cả phiên.');}catch(e){message.error(getErrorMessage(e));}finally{setRevoking(false);}}});}
 return <>
  <Card title="Cập nhật liên hệ"><Typography.Paragraph type="secondary">Bạn có thể sửa email và số điện thoại. Liên hệ người quản lý để sửa thông tin nhân sự khác.</Typography.Paragraph>
   <Form layout="vertical" initialValues={{email:user?.email??'',phone:user?.phone??''}} onFinish={save} disabled={saving}>
    {error&&<Alert showIcon type="error" title={error} style={{marginBottom:16}}/>}
    <Form.Item name="email" label="Email" rules={[{type:'email',message:'Email không hợp lệ.'},{max:100}]}><Input autoComplete="email" maxLength={100}/></Form.Item>
    <Form.Item name="phone" label="Điện thoại" rules={[{pattern:/^$|^[+0-9() .-]{6,15}$/,message:'Nhập số điện thoại từ 6 đến 15 ký tự.'}]}><Input autoComplete="tel" maxLength={15}/></Form.Item>
    <Button type="primary" htmlType="submit" loading={saving}>Lưu liên hệ</Button>
   </Form>
  </Card>
  <Card title="Đổi mật khẩu"><Typography.Paragraph type="secondary">Đổi mật khẩu sẽ kết thúc tất cả phiên đăng nhập hiện có.</Typography.Paragraph><PasswordForm/></Card>
  <Card title="Phiên đăng nhập"><Typography.Paragraph>Đăng xuất tất cả thiết bị khi không còn muốn duy trì các phiên đã đăng nhập.</Typography.Paragraph><Button danger loading={revoking} onClick={revoke}>Đăng xuất tất cả phiên</Button></Card>
 </>;
}
