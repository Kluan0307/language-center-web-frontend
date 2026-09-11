import styled from 'styled-components';

export const PrimaryButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 10px 16px;
    background-color: #2563EB;
    color: #FFFFFF;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    &:hover {
        background-color: #1D4ED8;
        transform: scale(1.01); 
    }

    &:active {
        transform: scale(0.99);
    }

    &:disabled {
        background-color: #93C5FD;
        cursor: not-allowed;
    }
`;

export const SecondaryButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 16px;
    background-color: #EFF6FF;
    color: #2563EB;
    border: 1px solid #BFDBFE;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    &:hover {
        background-color: #DBEAFE;
        transform: scale(1.01); 
    }

    &:active {
        transform: scale(0.99);
    }
`;