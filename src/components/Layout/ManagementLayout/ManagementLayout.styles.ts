import styled from 'styled-components';
import {theme} from '../../Common/theme';

export const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
  color: ${theme.colors.text};
`;
export const Main = styled.main`
  flex: 1;
  min-width: 0;
  padding: 28px 32px 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  .ant-card { border-color: ${theme.colors.borderLight}; box-shadow: none; }
  .ant-table-cell { vertical-align: middle; }
  :focus-visible { outline: 2px solid ${theme.colors.primary}; outline-offset: 3px; }
  .ant-descriptions-item-content { overflow-wrap: anywhere; }
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
  h1.ant-typography { margin: 4px 0 8px; font-size: 26px; font-weight: 650; letter-spacing: -0.4px; }
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
  padding: 16px;
  border: 1px solid ${theme.colors.borderLight};
  border-radius: 10px;
  background: #f8fafc;
  .search { width: min(100%, 320px); }
  .filter { min-width: 190px; max-width: 100%; }
`;
