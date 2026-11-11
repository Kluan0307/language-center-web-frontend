import { Alert, Space, Table, Typography } from 'antd';
import { AUDIT_LABELS, auditValue, readAuditRecord } from '../../utils/auditDisplay';

export default function AuditComparison({ before, after, single = false }: {
  before?: string | null; after?: string | null; single?: boolean;
}) {
  const previous = readAuditRecord(before), next = readAuditRecord(after);
  const unreadable = previous.state === 'unsupported' || next.state === 'unsupported';
  const rows = Object.entries(AUDIT_LABELS)
    .filter(([key]) => Object.hasOwn(previous.fields, key) || Object.hasOwn(next.fields, key))
    .map(([key, label]) => ({ key, label,
      before: previous.state === 'unsupported' ? 'Không đọc được bản ghi' : auditValue(previous.fields[key]),
      after: next.state === 'unsupported' ? 'Không đọc được bản ghi' : auditValue(next.fields[key]),
      changed: previous.state !== 'unsupported' && next.state !== 'unsupported' &&
        JSON.stringify(previous.fields[key] ?? null) !== JSON.stringify(next.fields[key] ?? null),
    }));
  return <Space orientation="vertical" style={{ width: '100%' }}>
    {unreadable && <Alert type="warning" showIcon title="Một phần thông tin lịch sử chưa thể hiển thị"
      description="Bản ghi gốc vẫn được lưu. Vui lòng liên hệ quản lý để kiểm tra chi tiết." />}
    <Table rowKey="key" size="small" pagination={false} dataSource={rows} scroll={{ x: single ? 420 : 600 }}
      locale={{ emptyText: unreadable ? 'Chưa đọc được chi tiết bản ghi này' : 'Không có thông tin chi tiết' }}
      columns={[
        { title: 'Thông tin', dataIndex: 'label', width: 190 },
        ...(!single ? [{ title: 'Trước thay đổi', dataIndex: 'before' }] : []),
        { title: single ? 'Nội dung' : 'Sau thay đổi', dataIndex: 'after', render: (value: string, row) =>
          <Typography.Text strong={!single && row.changed} style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{value}</Typography.Text> },
      ]} />
  </Space>;
}
