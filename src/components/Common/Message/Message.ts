import { message as antdMessage } from 'antd';
import type { ReactNode } from 'react';
import type { MessageArgsProps } from 'antd';
import type { MessageConfig } from './Message.types';

// Default configuration presets for Ant Design Message
antdMessage.config({
    top: 24,
    duration: 3,
    maxCount: 3,
});

export const message = {
    /**
     * Hiển thị thông báo thành công (Success)
     */
    success: (content: ReactNode, duration: number = 3, onClose?: () => void) => {
        return antdMessage.success(content as string, duration, onClose);
    },

    /**
     * Hiển thị thông báo lỗi (Error)
     */
    error: (content: ReactNode, duration: number = 3, onClose?: () => void) => {
        return antdMessage.error(content as string, duration, onClose);
    },

    /**
     * Hiển thị thông tin (Info)
     */
    info: (content: ReactNode, duration: number = 3, onClose?: () => void) => {
        return antdMessage.info(content as string, duration, onClose);
    },

    /**
     * Hiển thị cảnh báo (Warning)
     */
    warning: (content: ReactNode, duration: number = 3, onClose?: () => void) => {
        return antdMessage.warning(content as string, duration, onClose);
    },

    /**
     * Hiển thị trạng thái đang tải (Loading)
     */
    loading: (content: ReactNode, duration: number = 3, onClose?: () => void) => {
        return antdMessage.loading(content as string, duration, onClose);
    },

    /**
     * Tùy biến thông báo với các thuộc tính nâng cao
     */
    open: (args: MessageArgsProps) => {
        return antdMessage.open(args);
    },

    /**
     * Xóa thông báo theo key hoặc xóa tất cả
     */
    destroy: (key?: React.Key) => {
        return antdMessage.destroy(key);
    },

    /**
     * Cấu hình toàn cục cho message
     */
    config: (options: MessageConfig) => {
        return antdMessage.config(options);
    },

    /**
     * Hook useMessage từ antd nếu cần dùng trong context
     */
    useMessage: antdMessage.useMessage,
};

export default message;
