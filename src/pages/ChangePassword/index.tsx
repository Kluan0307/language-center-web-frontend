import {Alert,Button,Card,Space,Typography} from 'antd';
import {Link} from 'react-router-dom';
import PasswordForm from '../../components/Common/AccountSecurity/PasswordForm';
import {useAuth} from '../../hooks/useAuth';
import * as S from './ChangePassword.styles';
export default function ChangePassword(){
 const {user,logout}=useAuth();
 return <S.Page><S.Content><Card title="Đổi mật khẩu">
  <Typography.Paragraph>Tài khoản: <strong>{user?.username}</strong></Typography.Paragraph>
  {user?.mustChangePassword&&<Alert type="warning" showIcon title="Bạn đang sử dụng mật khẩu tạm" description="Đặt mật khẩu riêng trước khi tiếp tục sử dụng hệ thống." style={{marginBottom:20}}/>}
  <Typography.Paragraph type="secondary">Mật khẩu mới có ít nhất 8 ký tự, tối đa 72 byte UTF-8. Sau khi đổi, tất cả phiên đăng nhập sẽ hết hiệu lực.</Typography.Paragraph>
  <PasswordForm/>
  <Space style={{marginTop:20}}>{!user?.mustChangePassword&&<Link to="/profile">Về hồ sơ</Link>}<Button type="link" onClick={logout}>Đăng xuất</Button></Space>
 </Card></S.Content></S.Page>;
}
