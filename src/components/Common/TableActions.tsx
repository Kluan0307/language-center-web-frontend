import type { ReactNode } from 'react';
import { App, Button, Dropdown, Space } from 'antd';
import type { ModalFuncProps } from 'antd';
import { MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { To } from 'react-router-dom';

export interface TableAction {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  danger?: boolean;
  onClick?: () => unknown;
  to?: To;
  confirm?: ModalFuncProps;
}

/** Keep the frequent action visible; secondary actions share an accessible menu. */
export default function TableActions({ children, items, label = 'Thao tác khác' }: {
  children?: ReactNode;
  items: TableAction[];
  label?: string;
}) {
  const { modal } = App.useApp();
  return <Space size={4} wrap={false} onClick={(event) => event.stopPropagation()}>
    {children}
    {items.length > 0 && <Dropdown trigger={['click']} placement="bottomRight" menu={{
      items: items.map((item) => ({
        key: item.key,
        label: item.to && !item.disabled && !item.loading ? <Link to={item.to}>{item.label}</Link> : item.label,
        icon: item.icon,
        danger: item.danger,
        disabled: item.disabled || item.loading,
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
          if (item.disabled || item.loading) return;
          if (item.confirm) modal.confirm(item.confirm);
          else item.onClick?.();
        },
      })),
    }}>
      <Button size="small" icon={<MoreHorizontal size={16} />} aria-label={label} />
    </Dropdown>}
  </Space>;
}
