import type { ReactNode } from 'react';
import { Collapse, Empty, Space, Typography } from 'antd';
/** A list empty state; errors keep using LoadError with its retry action. */
export function StateView({ title, description }: {
    title: string;
    description?: string;
}) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<Space orientation="vertical" size={4}><Typography.Text>{title}</Typography.Text>{description && <Typography.Text type="secondary">{description}</Typography.Text>}</Space>}/>;
}
/** Business details stay visible; optional technical evidence can be collapsed. */
export function DetailSection({ title, children, collapsible = false }: {
    title: string;
    children: ReactNode;
    collapsible?: boolean;
}) {
    if (collapsible)
        return <Collapse ghost items={[{ key: 'details', label: title, children }]}/>;
    return <section aria-label={title}><Typography.Title level={4}>{title}</Typography.Title>{children}</section>;
}
