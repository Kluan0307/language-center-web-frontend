import styled, { createGlobalStyle } from 'styled-components';

export const MessageGlobalStyle = createGlobalStyle`
    .ant-message {
        font-family: inherit;

        .ant-message-notice-content {
            padding: 10px 18px;
            border-radius: 10px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
            font-size: 14px;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            border: 1px solid #E2E8F0;
        }

        .ant-message-success .ant-message-notice-content {
            border-color: #A7F3D0;
            background-color: #FFFFFF;
        }

        .ant-message-error .ant-message-notice-content {
            border-color: #FECACA;
            background-color: #FFFFFF;
        }

        .ant-message-warning .ant-message-notice-content {
            border-color: #FDE68A;
            background-color: #FFFFFF;
        }

        .ant-message-info .ant-message-notice-content {
            border-color: #BFDBFE;
            background-color: #FFFFFF;
        }
    }
`;

export const MessageWrapper = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 8px;
`;
