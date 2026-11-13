import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
export default function ClassWorkspaceTabs({ items, manager }: {
    items: NonNullable<TabsProps['items']>;
    manager: boolean;
}) { const order = ['info', 'students', 'schedule', 'duration', 'admission', 'closure']; return <Tabs defaultActiveKey="info" items={items.filter(i => i.key !== 'closure' || manager).sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key))}/>; }
