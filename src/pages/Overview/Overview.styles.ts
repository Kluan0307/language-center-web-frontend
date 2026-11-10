import styled from 'styled-components';

export const OverviewContainer = styled.div`
    display: flex;
    min-height: 100vh;
    width: 100%;
    background-color: #F8FAFC;
`;

export const MainContent = styled.main`

    flex: 1;
    min-width: 0;
    padding: 32px;
    @media (max-width: 900px) { padding-top: 80px; }
    display: flex;
    flex-direction: column;
`;

