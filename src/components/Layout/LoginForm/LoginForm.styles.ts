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
