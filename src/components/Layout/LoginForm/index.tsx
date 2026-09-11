import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as S from './LoginForm.styles';
import { PrimaryButton, Input } from '../../Common';
import type { LoginPayload } from '../../../types';

interface LoginFormProps {
    onSubmit?: (credentials: LoginPayload) => void | Promise<any>;
    errorMessage?: string;
    isLoading?: boolean;
}

function LoginForm({ onSubmit, errorMessage, isLoading }: LoginFormProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit({ username, password });
        } else {
            navigate('/overview');
        }
    };

    return (
        <S.LoginFormContainer>
            <S.Title>Đăng nhập</S.Title>
            <S.Form onSubmit={handleSubmit}>
                <S.FormGroup>
                    <S.Label htmlFor="username">Tài khoản</S.Label>
                    <Input
                        id="username"
                        type="text"
                        placeholder="Nhập tài khoản"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </S.FormGroup>

                <S.FormGroup>
                    <S.Label htmlFor="password">Mật khẩu</S.Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Nhập mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </S.FormGroup>

                {errorMessage && <S.ErrorMessage>{errorMessage}</S.ErrorMessage>}

                <PrimaryButton type="submit" disabled={isLoading}>
                    {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                </PrimaryButton>
            </S.Form>
        </S.LoginFormContainer>
    );
}

export default LoginForm;