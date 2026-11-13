import {useListQuery} from '../../hooks/useListQuery';

import { Alert, Button, Card, Input, Table, Typography } from 'antd';
import { RefreshCw } from 'lucide-react';
import { ManagementLayout, Filters } from '../../components/Layout/ManagementLayout';
import { useRemoteResource } from '../../hooks/useRemoteResource';
import { authService } from '../../services/authService';
import type { TeacherOption } from '../../types/auth';

export default function TeacherDirectory() {
  const resource = useRemoteResource(authService.teachers, {});
  const [query,setQuery]=useListQuery<{page:number;size:number;keyword?:string}>([]);const keyword=query.keyword??'';const setKeyword=(keyword:string)=>setQuery(q=>({...q,keyword,page:0}));
  const rows = resource.data?.filter((t) => t.fullName.toLocaleLowerCase('vi').includes(keyword.trim().toLocaleLowerCase('vi'))) ?? [];
  return <ManagementLayout title="Giáo viên" description="Tra cứu giáo viên đang hoạt động, khả dụng trong chi nhánh của bạn."
    actions={<Button icon={<RefreshCw size={16} />} onClick={resource.reload} loading={resource.loading}>Tải lại</Button>}>
    {resource.error && <Alert showIcon type="error" title="Không tải được danh sách" description={resource.error}
      action={<Button onClick={resource.reload}>Thử lại</Button>} />}
    <Card>
      <Filters><Input className="search" placeholder="Tìm theo họ tên giáo viên" allowClear value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        <Typography.Text type="secondary">{resource.loading?'Đang tải…':resource.error?'—':rows.length} giáo viên</Typography.Text></Filters>
      {!resource.error&&<Table<TeacherOption> rowKey="profileId" dataSource={rows} loading={resource.loading}
        pagination={{current:query.page+1,pageSize:query.size,total:rows.length,showSizeChanger:true,pageSizeOptions:[10,20,50],onChange:(page,size)=>setQuery(q=>({...q,page:page-1,size}))}} locale={{ emptyText: 'Không có giáo viên phù hợp' }}
        columns={[{ title: 'Họ và tên', dataIndex: 'fullName' }, { title: 'Mã hồ sơ', dataIndex: 'profileId' },
          { title: 'Chi nhánh', dataIndex: 'branchId', render: (id) => `Chi nhánh #${id}` }]} />}
    </Card>
  </ManagementLayout>;
}
