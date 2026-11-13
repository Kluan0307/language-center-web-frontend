import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
type Items = NonNullable<TabsProps['items']>;
export default function StudentProfileTabs({ activeKey, onChange, items }: {
    activeKey: string;
    onChange: (key: string) => void;
    items: Items;
}) {
    const overview = ['overview', 'profile', 'student-account'], learning = ['enrollments', 'learning', 'assessment'];
    const selected = items.some(item => item.key === activeKey) ? activeKey : 'overview';
    const group = overview.includes(selected) ? 'overview' : learning.includes(selected) ? 'learning' : selected;
    const subset = (keys: string[]) => items.filter(item => keys.includes(item.key));
    const nested = (keys: string[], fallback: string) => <Tabs size="small" activeKey={keys.includes(selected) ? selected : fallback} onChange={onChange} items={subset(keys).map(item => item.key === 'overview' ? { ...item, label: 'Thông tin nhanh' } : item)}/>;
    return <Tabs activeKey={group} onChange={onChange} items={[
            { key: 'overview', label: 'Tổng quan', children: nested(overview, 'overview') },
            { key: 'learning', label: 'Học tập', children: nested(learning, 'learning') },
            ...subset(['finance', 'support', 'history'])
        ]}/>;
}
