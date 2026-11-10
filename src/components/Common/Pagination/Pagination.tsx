import { Pagination as AntdPagination } from 'antd';
import type { PaginationProps } from './Pagination.types';
import * as S from './Pagination.styles';

export function Pagination({
    current = 1,
    pageSize = 10,
    total,
    onChange,
    align = 'right',
    showSizeChanger = false,
    ...restProps
}: PaginationProps) {
    if (!total || total <= 0) {
        return null;
    }

    return (
        <S.PaginationContainer $align={align}>
            <AntdPagination
                current={current}
                pageSize={pageSize}
                total={total}
                onChange={onChange}
                showSizeChanger={showSizeChanger}
                {...restProps}
            />
        </S.PaginationContainer>
    );
}

export default Pagination;
