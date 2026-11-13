import type { ReactNode } from 'react';
import { Space, Typography } from 'antd';
import * as S from './ManagementLayout.styles';
export function PageHeader({ title, description, scope, actions }: {
    title: string;
    description: string;
    scope?: ReactNode;
    actions?: ReactNode;
}) {
    return <S.Header><S.HeaderCopy>{scope}<Typography.Title level={1}>{title}</Typography.Title><Typography.Paragraph type="secondary">{description}</Typography.Paragraph></S.HeaderCopy>{actions && <Space wrap>{actions}</Space>}</S.Header>;
}
