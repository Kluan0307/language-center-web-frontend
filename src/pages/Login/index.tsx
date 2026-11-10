import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Spin } from 'antd';
import * as S from './Login.styles';
import LoginForm from '../../components/Layout/LoginForm';
import { message } from '../../components/Common';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../utils/apiErrors';
import type { LoginPayload } from '../../types';
import bgLogin from '../../assets/images/background-login.svg';

function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: restoring, sessionError, refreshUser, user } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (isAuthenticated) navigate(user?.mustChangePassword?'/change-password':'/dashboard', { replace: true });
  }, [isAuthenticated, navigate, user?.mustChangePassword]);
  const handleLogin = async (credentials: LoginPayload, remember: boolean) => {
    if (isLoading) return;
    setIsLoading(true); setErrorMessage('');
    try {
      const result=await login(credentials, remember);
      message.success('Đăng nhập thành công!');
      navigate(result.mustChangePassword?'/change-password':'/dashboard', { replace: true });
    } catch (error) { setErrorMessage(getErrorMessage(error)); }
    finally { setIsLoading(false); }
  };
  if (restoring) return <Spin fullscreen tip="Đang khôi phục phiên đăng nhập…" />;
  return <S.LoginContainer>
    <S.LoginLeft><S.LoginLeftContent>
      <S.LoginBrand>Language Center Management</S.LoginBrand>
      <img src={bgLogin} alt="Minh hoạ đăng nhập" />
    </S.LoginLeftContent></S.LoginLeft>
    <S.LoginRight>
      {sessionError && <Alert type="warning" showIcon title={sessionError}
        action={<Button onClick={() => void refreshUser()}>Thử lại phiên cũ</Button>} />}
      <LoginForm onSubmit={handleLogin} errorMessage={errorMessage} isLoading={isLoading} />
    </S.LoginRight>
  </S.LoginContainer>;
}
export default Login;

