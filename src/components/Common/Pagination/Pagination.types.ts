import type { PaginationProps as AntdPaginationProps } from 'antd';

export interface PaginationProps extends Omit<AntdPaginationProps, 'onChange' | 'align'> {
    current?: number;
    pageSize?: number;
    total: number;
    onChange?: (page: number, pageSize: number) => void;
    align?: 'left' | 'center' | 'right';
}

