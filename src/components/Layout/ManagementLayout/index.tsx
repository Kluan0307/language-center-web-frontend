import AssignedScopeBanner from '../../Common/AssignedScopeBanner';
import {ReturnLink} from '../../Common/ContextLink';
import type { ReactNode } from 'react';
import { Space, Tag, Typography } from 'antd';
import Sidebar from '../Sidebar';
import { useAuth } from '../../../hooks/useAuth';
import { branchService } from '../../../services/branchService';
import { useRemoteResource } from '../../../hooks/useRemoteResource';
import { PageHeader } from './PageHeader';
import * as S from './ManagementLayout.styles';

async function loadScope({ id }: { id: number | null }, signal?: AbortSignal) {
  return id ? branchService.get(id, signal) : null;
}
export function ManagementLayout({ title, description, actions, children, scopeLabel, backNavigation=true }: {
  title: string; description: string; actions?: ReactNode; children: ReactNode; scopeLabel?: string;backNavigation?:boolean;
}) {
  const { user } = useAuth();
  const branch = useRemoteResource(loadScope, { id: user?.branchId ?? null });
  return <S.Container>
    <Sidebar />
    <S.Main>
      <PageHeader title={title} description={description} actions={actions} scope={
          <Space size={8} wrap>
            <Typography.Text type="secondary" style={{fontSize:12}}>{scopeLabel?'Phạm vi danh sách':'Phạm vi tài khoản'}</Typography.Text>
            <Tag>{scopeLabel ?? (user?.role === 'SUPER_ADMIN' ? 'Toàn hệ thống'
              : branch.data ? `${branch.data.code} · ${branch.data.name}`
              : `Chi nhánh #${user?.branchId ?? '—'}`)}</Tag>
            {branch.data?.status === 'INACTIVE' && <Tag color="orange">Chi nhánh ngừng hoạt động</Tag>}
          </Space>
      } />
      {backNavigation&&<ReturnLink/>}
      <AssignedScopeBanner/>
      {children}
    </S.Main>
  </S.Container>;
}
export { Filters } from './ManagementLayout.styles';
