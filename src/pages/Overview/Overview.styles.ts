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
    padding: calc(var(--lc-shell-header-height, 80px) + 28px) 32px 32px;
    @media (max-width: 900px) { padding-top: calc(var(--lc-shell-header-height, 80px) + 24px); }
    display: flex;
    flex-direction: column;
`;

