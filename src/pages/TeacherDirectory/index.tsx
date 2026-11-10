import { useState } from 'react';
import { Alert, Button, Card, Input, Table, Typography } from 'antd';
import { RefreshCw } from 'lucide-react';
import { ManagementLayout, Filters } from '../../components/Layout/ManagementLayout';
import { useRemoteResource } from '../../hooks/useRemoteResource';
import { authService } from '../../services/authService';
import type { TeacherOption } from '../../types/auth';

export default function TeacherDirectory() {
  const resource = useRemoteResource(authService.teachers, {});
  const [keyword, setKeyword] = useState('');
  const rows = resource.data?.filter((t) => t.fullName.toLocaleLowerCase('vi').includes(keyword.trim().toLocaleLowerCase('vi'))) ?? [];
  return <ManagementLayout title="Giáo viên" description="Tra cứu giáo viên đang hoạt động, khả dụng trong chi nhánh của bạn."
    actions={<Button icon={<RefreshCw size={16} />} onClick={resource.reload} loading={resource.loading}>Tải lại</Button>}>
    {resource.error && <Alert showIcon type="error" title="Không tải được danh sách" description={resource.error}
      action={<Button onClick={resource.reload}>Thử lại</Button>} />}
    <Card>
      <Filters><Input className="search" placeholder="Tìm theo họ tên giáo viên" allowClear value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        <Typography.Text type="secondary">{rows.length} giáo viên</Typography.Text></Filters>
      <Table<TeacherOption> rowKey="profileId" dataSource={rows} loading={resource.loading}
        pagination={{ pageSize: 10, showSizeChanger: true }} locale={{ emptyText: 'Không có giáo viên phù hợp' }}
        columns={[{ title: 'Họ và tên', dataIndex: 'fullName' }, { title: 'Mã hồ sơ', dataIndex: 'profileId' },
          { title: 'Chi nhánh', dataIndex: 'branchId', render: (id) => `Chi nhánh #${id}` }]} />
    </Card>
  </ManagementLayout>;
}
