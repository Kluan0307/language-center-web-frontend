import styled from 'styled-components';
import { theme } from '../theme';

export const PaginationContainer = styled.div<{ $align?: 'left' | 'center' | 'right' }>`
    display: flex;
    justify-content: ${({ $align = 'right' }) =>
        $align === 'left' ? 'flex-start' : $align === 'center' ? 'center' : 'flex-end'};
    align-items: center;
    width: 100%;
    padding: 12px 0;
    box-sizing: border-box;

    .ant-pagination {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
        font-family: inherit;
 
        .ant-pagination-total-text {
            color: ${theme.colors.textSecondary};
            font-size: 13.5px;
            margin-right: 8px;
        }

        .ant-pagination-item {
            border-radius: ${theme.borderRadius.md};
            border: 1px solid ${theme.colors.borderLight};
            background-color: ${theme.colors.white};
            transition: ${theme.transitions.default};
            min-width: 34px;
            height: 34px;
            line-height: 32px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin: 0;

            a {
                color: ${theme.colors.text};
                font-weight: 500;
                font-size: 13.5px;
                display: block;
                padding: 0 4px;
            }

            &:hover {
                border-color: ${theme.colors.border};
                background-color: ${theme.colors.lightBg};
                a {
                    color: ${theme.colors.primary};
                }
            }

            &.ant-pagination-item-active {
                background-color: ${theme.colors.primary};
                border-color: ${theme.colors.primary};

                a {
                    color: ${theme.colors.white};
                    font-weight: 600;
                }

                &:hover {
                    background-color: ${theme.colors.primaryHover};
                    border-color: ${theme.colors.primaryHover};
                    a {
                        color: ${theme.colors.white};
                    }
                }
            }
        }

        .ant-pagination-prev,
        .ant-pagination-next {
            border-radius: ${theme.borderRadius.md};
            min-width: 34px;
            height: 34px;
            line-height: 32px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 1px solid ${theme.colors.borderLight};
            background-color: ${theme.colors.white};
            transition: ${theme.transitions.default};
            margin: 0;

            .ant-pagination-item-link {
                border: none;
                background-color: transparent;
                border-radius: ${theme.borderRadius.md};
                display: flex;
                align-items: center;
                justify-content: center;
                color: ${theme.colors.textSecondary};
            }

            &:hover:not(.ant-pagination-disabled) {
                border-color: ${theme.colors.border};
                background-color: ${theme.colors.lightBg};

                .ant-pagination-item-link {
                    color: ${theme.colors.primary};
                }
            }

            &.ant-pagination-disabled {
                border-color: ${theme.colors.borderLight};
                background-color: ${theme.colors.rowHover};

                .ant-pagination-item-link {
                    color: ${theme.colors.disabled};
                    cursor: not-allowed;
                }
            }
        }

        .ant-pagination-jump-prev,
        .ant-pagination-jump-next {
            margin: 0;
            min-width: 34px;
            height: 34px;
            line-height: 32px;
            display: inline-flex;
            align-items: center;
            justify-content: center;

            .ant-pagination-item-container {
                .ant-pagination-item-ellipsis {
                    color: ${theme.colors.textSecondary};
                }

                .ant-pagination-item-link-icon {
                    color: ${theme.colors.primary};
                }
            }
        }

        .ant-pagination-options {
            margin-left: 12px;
            display: inline-flex;
            align-items: center;
            gap: 8px;

            .ant-select {
                .ant-select-selector {
                    border-radius: ${theme.borderRadius.md};
                    border: 1px solid ${theme.colors.borderLight};
                    height: 34px;
                    display: flex;
                    align-items: center;

                    &:hover {
                        border-color: ${theme.colors.primary};
                    }
                }

                &.ant-select-focused .ant-select-selector {
                    border-color: ${theme.colors.primary};
                    box-shadow: 0 0 0 2px ${theme.colors.shadow};
                }
            }

            .ant-pagination-options-quick-jumper {
                color: ${theme.colors.textSecondary};
                font-size: 13.5px;
                height: 34px;
                display: inline-flex;
                align-items: center;

                input {
                    border-radius: ${theme.borderRadius.md};
                    border: 1px solid ${theme.colors.borderLight};
                    height: 34px;
                    padding: 4px 8px;
                    margin: 0 6px;

                    &:focus {
                        border-color: ${theme.colors.primary};
                        box-shadow: 0 0 0 2px ${theme.colors.shadow};
                    }
                }
            }
        }
    }
`;
