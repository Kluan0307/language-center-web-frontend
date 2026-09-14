import styled from 'styled-components';

export const LoginFormContainer = styled.div`
    width: 100%;
    max-width: 400px;
    padding: 32px;
    background-color: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
`;

export const Title = styled.h2`
    font-size: 24px;
    font-weight: 600;
    color: #0F172A;
    margin: 0 0 24px 0;
    text-align: center;
`;

export const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

export const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    text-align: left;
`;

export const Label = styled.label`
    font-size: 14px;
    font-weight: 500;
    color: #334155;
`;

export const ErrorMessage = styled.p`
    color: #EF4444;
    font-size: 13px;
    margin: 0;
    text-align: center;
`;

export const CaptchaWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

export const CaptchaCanvas = styled.div`
    border-radius: 8px;
    border: 1px solid #E2E8F0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #F8FAFC;
    height: 52px;

    canvas {
        display: block;
        border-radius: 6px;
    }
`;

export const CaptchaInputRow = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;
`;

export const RefreshButton = styled.button`
    flex-shrink: 0;
    width: 38px;
    height: 38px;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    background-color: #F8FAFC;
    color: #64748B;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    transition: all 0.2s ease-in-out;
    padding: 0;

    &:hover {
        background-color: #EFF6FF;
        border-color: #2563EB;
        color: #2563EB;
    }

    &:active {
        transform: rotate(180deg);
    }
`;

export const RememberRow = styled.div`
    display: flex;
    align-items: center;
`;

export const CheckboxLabel = styled.label`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #475569;
    cursor: pointer;
    user-select: none;

    input[type='checkbox'] {
        width: 15px;
        height: 15px;
        accent-color: #2563EB;
        cursor: pointer;
        flex-shrink: 0;
    }
`;

export const ForgotPasswordLink = styled.a`
    font-size: 13px;
    color: #2563EB;
    text-decoration: none;
    text-align: right;
    display: block;

    &:hover {
        text-decoration: underline;
        color: #1D4ED8;
    }
`;
