import { Table as AntdTable } from 'antd';
import { Search, Plus } from 'lucide-react';
import type { CommonTableProps } from './Table.types';
import * as S from './Table.styles';
import { Input } from '../Input';
import { PrimaryButton } from '../Button';
import { Pagination } from '../Pagination';

export function CommonTable<T extends object>({
    columns,
    dataSource,
    loading,
    rowKey = 'id' as unknown as keyof T,
    onAddNew,
    addButtonText = 'Thêm mới',
    onSearch,
    searchPlaceholder = 'Tìm kiếm...',
    searchValue,
    currentPage = 1,
    pageSize = 10,
    total,
    onPageChange,
    showPagination = true,
    paginationAlign = 'right',
    toolbarExtra,
    ...restProps
}: CommonTableProps<T>) {
    const showToolbar = Boolean(onSearch || onAddNew || toolbarExtra);
    const hasPagination = Boolean(
        showPagination && 
        total !== undefined && 
        total > 0 && 
        onPageChange
    );

    return (
        <S.TableContainer>
            {showToolbar && (
                <S.Toolbar>
                    {onSearch ? (
                        <S.SearchWrapper>
                            <span className="search-icon">
                                <Search size={16} />
                            </span>
                            <Input
                                value={searchValue}
                                placeholder={searchPlaceholder}
                                onChange={(e) => onSearch(e.target.value)}
                            />
                        </S.SearchWrapper>
                    ) : <div />}

                    {(onAddNew || toolbarExtra) && (
                        <S.ActionsWrapper>
                            {toolbarExtra}
                            {onAddNew && (
                                <PrimaryButton type="button" onClick={onAddNew}>
                                    <Plus size={16} />
                                    <span>{addButtonText}</span>
                                </PrimaryButton>
                            )}
                        </S.ActionsWrapper>
                    )}
                </S.Toolbar>
            )}

            <S.StyledTableWrapper>
                <AntdTable<T>
                    columns={columns}
                    dataSource={dataSource}
                    loading={loading}
                    rowKey={rowKey}
                    pagination={false}
                    {...restProps}
                />
            </S.StyledTableWrapper>

            {hasPagination && (
                <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={total!}
                    onChange={onPageChange!}
                    align={paginationAlign}
                />
            )}
        </S.TableContainer>
    );
}

export default CommonTable;
