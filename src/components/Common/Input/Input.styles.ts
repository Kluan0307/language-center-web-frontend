import styled from 'styled-components';

export const Input = styled.input`
    width: 100%;
    padding: 10px 14px;
    background-color: #FFFFFF;
    color: #0F172A;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    transition: all 0.2s ease-in-out;
    box-sizing: border-box;

    &::placeholder {
        color: #64748B;
        opacity: 1;
    }

    &:focus {
        border-color: #2563EB; 
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15); 
    }

    &:disabled {
        background-color: #F8FAFC;
        color: #64748B;
        cursor: not-allowed;
    }
`;