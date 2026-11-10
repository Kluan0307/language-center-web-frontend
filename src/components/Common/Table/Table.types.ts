import type { TableProps as AntdTableProps } from 'antd';
import type { ReactNode } from 'react';

export interface CommonTableProps<T extends object> extends Omit<AntdTableProps<T>, 'pagination'> {
    // Toolbar actions & search
    onAddNew?: () => void;
    addButtonText?: string;
    onSearch?: (value: string) => void;
    searchPlaceholder?: string;
    searchValue?: string;
    toolbarExtra?: ReactNode;

    // Pagination control
    currentPage?: number;
    pageSize?: number;
    total?: number;
    onPageChange?: (page: number, pageSize: number) => void;
    showPagination?: boolean;
    paginationAlign?: 'left' | 'center' | 'right';
}
