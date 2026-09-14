import styled from 'styled-components';

export const LoginContainer = styled.div`
    display: flex;
    min-height: 100vh;
    width: 100%;
`;

export const LoginLeft = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #EEF2FF;

    img {
        width: 80%;
        max-width: 440px;
        object-fit: contain;
    }

    @media (max-width: 768px) {
        display: none;
    }
`;

export const LoginLeftContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
`;

export const LoginBrand = styled.h1`
    font-size: 28px;
    font-weight: 700;
    color: #2563EB;
    margin: 0;
    text-align: center;
    letter-spacing: -0.3px;
`;

export const LoginRight = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background-color: #FFFFFF;
`;
