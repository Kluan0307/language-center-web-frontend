import styled from 'styled-components';
import { theme } from '../theme';

export const TableContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background-color: ${theme.colors.white};
    box-sizing: border-box;
`;

export const Toolbar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
`;

export const SearchWrapper = styled.div`
    position: relative;
    width: 100%;
    max-width: 320px;

    .search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: ${theme.colors.textSecondary};
        pointer-events: none;
        display: flex;
        align-items: center;
    }

    input {
        padding-left: 36px;
    }
`;

export const ActionsWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    margin-left: auto;

    /* Nút thêm mới hiển thị gọn đẹp, không bị chiếm 100% width */
    button {
        width: auto;
        white-space: nowrap;
        gap: 8px;
    }
`;

export const StyledTableWrapper = styled.div`
    width: 100%;
    overflow-x: auto;

    .ant-table-wrapper {
        width: 100%;
    }

    .ant-table {
        border-radius: ${theme.borderRadius.md};
        overflow: hidden;
        border: 1px solid ${theme.colors.borderLight};
        background: ${theme.colors.white};
        font-family: inherit;
    }

    .ant-table-container {
        border-radius: ${theme.borderRadius.md};
    }

    .ant-table-thead > tr > th {
        background-color: ${theme.colors.lightBg};
        color: ${theme.colors.primaryHover};
        font-weight: 600;
        font-size: 13.5px;
        padding: 12px 16px;
        border-bottom: 1px solid ${theme.colors.border};
        white-space: nowrap;

        &::before {
            display: none !important; /* Xóa vạch ngăn chia default của AntD */
        }
    }

    .ant-table-tbody > tr > td {
        padding: 12px 16px;
        font-size: 13.5px;
        color: ${theme.colors.text};
        border-bottom: 1px solid ${theme.colors.borderLight};
        transition: ${theme.transitions.default};
    }

    .ant-table-tbody > tr:hover > td,
    .ant-table-tbody > tr.ant-table-row-hover > td {
        background-color: ${theme.colors.rowHover} !important;
    }

    .ant-table-tbody > tr:last-child > td {
        border-bottom: none;
    }

    .ant-empty-description {
        color: ${theme.colors.textSecondary};
        font-size: 13.5px;
    }
`;
