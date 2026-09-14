import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CaptchaCode from 'react-captcha-code';
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
    const [rememberMe, setRememberMe] = useState(false);
    const [captchaValue, setCaptchaValue] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [captchaError, setCaptchaError] = useState('');
    const [captchaKey, setCaptchaKey] = useState(0);
    const navigate = useNavigate();

    const handleCaptchaChange = useCallback((code: string) => {
        setCaptchaValue(code);
    }, []);

    const handleRefreshCaptcha = () => {
        setCaptchaKey(prev => prev + 1);
        setCaptchaInput('');
        setCaptchaError('');
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (captchaInput.trim().toLowerCase() !== captchaValue.toLowerCase()) {
            setCaptchaError('Mã xác thực không đúng. Vui lòng thử lại!');
            handleRefreshCaptcha();
            return;
        }

        setCaptchaError('');

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

                <S.RememberRow>
                    <S.CheckboxLabel htmlFor="remember-me">
                        <input
                            id="remember-me"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        Ghi nhớ đăng nhập
                    </S.CheckboxLabel>
                </S.RememberRow>

                <S.FormGroup>
                    <S.Label htmlFor="captcha-input">Mã xác thực</S.Label>
                    <S.CaptchaCanvas>
                        <CaptchaCode
                            key={captchaKey}
                            onChange={handleCaptchaChange}
                            width={220}
                            height={50}
                            charNum={4}
                            fontSize={28}
                        />
                    </S.CaptchaCanvas>
                    <S.CaptchaInputRow>
                        <Input
                            id="captcha-input"
                            type="text"
                            placeholder="Nhập mã xác thực"
                            value={captchaInput}
                            onChange={(e) => {
                                setCaptchaInput(e.target.value);
                                setCaptchaError('');
                            }}
                            required
                        />
                        <S.RefreshButton
                            type="button"
                            onClick={handleRefreshCaptcha}
                            title="Làm mới mã xác thực"
                        >
                            ↻
                        </S.RefreshButton>
                    </S.CaptchaInputRow>
                    {captchaError && <S.ErrorMessage>{captchaError}</S.ErrorMessage>}
                </S.FormGroup>

                {errorMessage && <S.ErrorMessage>{errorMessage}</S.ErrorMessage>}

                <S.ForgotPasswordLink href="#">Quên mật khẩu?</S.ForgotPasswordLink>

                <PrimaryButton type="submit" disabled={isLoading}>
                    {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                </PrimaryButton>
            </S.Form>
        </S.LoginFormContainer>
    );
}

export default LoginForm;