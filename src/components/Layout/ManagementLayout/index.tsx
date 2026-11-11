import type { ReactNode } from 'react';
import { Space, Tag, Typography } from 'antd';
import Sidebar from '../Sidebar';
import { useAuth } from '../../../hooks/useAuth';
import { branchService } from '../../../services/branchService';
import { useRemoteResource } from '../../../hooks/useRemoteResource';
import * as S from './ManagementLayout.styles';

async function loadScope({ id }: { id: number | null }, signal?: AbortSignal) {
  return id ? branchService.get(id, signal) : null;
}
export function ManagementLayout({ title, description, actions, children }: {
  title: string; description: string; actions?: ReactNode; children: ReactNode;
}) {
  const { user } = useAuth();
  const branch = useRemoteResource(loadScope, { id: user?.branchId ?? null });
  return <S.Container>
    <Sidebar />
    <S.Main>
      <S.Header>
        <S.HeaderCopy>
          <Space size={8} wrap>
            <Tag>{user?.role === 'SUPER_ADMIN' ? 'Toàn hệ thống'
              : branch.data ? `${branch.data.code} · ${branch.data.name}`
              : `Chi nhánh #${user?.branchId ?? '—'}`}</Tag>
            {branch.data?.status === 'INACTIVE' && <Tag color="orange">Chi nhánh ngừng hoạt động</Tag>}
          </Space>
          <Typography.Title level={1}>{title}</Typography.Title>
          <Typography.Paragraph type="secondary">{description}</Typography.Paragraph>
        </S.HeaderCopy>
        {actions && <Space wrap>{actions}</Space>}
      </S.Header>
      {children}
    </S.Main>
  </S.Container>;
}
export { Filters } from './ManagementLayout.styles';
