import type { ReactNode } from 'react';
import type { MessageArgsProps as AntdMessageArgsProps } from 'antd';

export type MessageType = 'info' | 'success' | 'error' | 'warning' | 'loading';

export type JointContent = ReactNode | AntdMessageArgsProps;

export interface MessageConfig {
    top?: number;
    duration?: number;
    prefixCls?: string;
    getContainer?: () => HTMLElement;
    maxCount?: number;
    rtl?: boolean;
}

export interface CustomMessageOptions {
    content: ReactNode;
    duration?: number;
    key?: string | number;
    onClose?: () => void;
    icon?: ReactNode;
}
