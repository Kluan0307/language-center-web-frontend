import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
`;
export const Main = styled.main`
  flex: 1;
  min-width: 0;
  padding: 28px 32px 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  .ant-card { border-color: #e2e8f0; }
  .ant-table-wrapper { min-width: 0; }
  .ant-table-cell .ant-space-item { min-width: 0; }
  .ant-table-cell .ant-btn-link {
    height: auto;
    max-width: 100%;
    white-space: normal;
    text-align: left;
    overflow-wrap: anywhere;
  }
  @media (max-width: 900px) { padding: 80px 16px 24px; }
`;
export const Header = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  h1.ant-typography { margin: 4px 0 8px; font-size: 26px; }
`;
export const HeaderCopy = styled.div`
  flex: 1;
  min-width: 220px;
  .ant-typography { margin-bottom: 0; }
`;
export const Filters = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
  .search { width: min(100%, 320px); }
  .filter { min-width: 190px; max-width: 100%; }
`;
