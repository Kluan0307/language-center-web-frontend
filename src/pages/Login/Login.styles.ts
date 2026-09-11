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
    background-color: #F8FAFC;

    @media (max-width: 768px) {
        display: none;
    }
`;

export const LoginRight = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background-color: #FFFFFF;
`;
