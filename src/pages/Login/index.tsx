import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as S from './Login.styles';
import LoginForm from '../../components/Layout/LoginForm';
import { useAuth } from '../../hooks/useAuth';
import type { LoginPayload } from '../../types';

function Login() {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/overview', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = async (credentials: LoginPayload) => {
        try {
            setIsLoading(true);
            setErrorMessage('');
            await login(credentials);
            navigate('/overview', { replace: true });
        } catch (error: any) {
            const resData = error.response?.data;
            if (typeof resData === 'object' && resData !== null) {
                if (resData.message) {
                    setErrorMessage(resData.message);
                } else {
                    const firstError = Object.values(resData)[0];
                    setErrorMessage(typeof firstError === 'string' ? firstError : 'Đăng nhập thất bại!');
                }
            } else {
                setErrorMessage('Sai tên đăng nhập hoặc mật khẩu!');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <S.LoginContainer>
            <S.LoginLeft>
            </S.LoginLeft>

            <S.LoginRight>
                <LoginForm
                    onSubmit={handleLogin}
                    errorMessage={errorMessage}
                    isLoading={isLoading}
                />
            </S.LoginRight>
        </S.LoginContainer>
    );
}

export default Login;
