import { Alert, Button, Form, List, Select, Typography } from 'antd';
import type { Branch } from '../../../types/branch';
import type { ScheduleConflict } from '../../../types/academic';
import { useAuth } from '../../../hooks/useAuth';
import { branchLabel, conflictReason, dayLabel } from '../../../utils/academic';

export function BranchFilter({ branches, value, onChange, loading }: {
  branches?: Branch[]; value?: number; onChange: (id?: number) => void; loading?: boolean;
}) {
  const { user } = useAuth();
  if (user?.role !== 'SUPER_ADMIN') return null;
  return <Select className="filter" aria-label="Lọc chi nhánh" placeholder="Tất cả chi nhánh" allowClear
    showSearch optionFilterProp="label" loading={loading} value={value} onChange={onChange}
    options={branches?.map((b) => ({ value: b.id, label: branchLabel(branches, b.id) }))} />;
}
export function BranchField({ branches, editing = false, shared = false, loading }: {
  branches?: Branch[]; editing?: boolean; shared?: boolean; loading?: boolean;
}) {
  const { user } = useAuth();
  if (user?.role !== 'SUPER_ADMIN') return null;
  return <Form.Item name="branchId" label={shared ? 'Phạm vi khóa học' : 'Chi nhánh'}
    rules={[{ required: true, message: 'Chọn chi nhánh.' }]}>
    <Select disabled={editing} loading={loading} showSearch optionFilterProp="label" placeholder="Chọn chi nhánh"
      options={[...(shared ? [{ value: 0, label: 'Khóa chung toàn hệ thống' }] : []),
        ...(branches?.map((b) => ({ value: b.id, label: branchLabel(branches, b.id), disabled: !editing && b.status !== 'ACTIVE' })) ?? [])]} />
  </Form.Item>;
}
export function LoadError({ error, reload }: { error?: string; reload: () => void }) {
  return error ? <Alert type="error" showIcon title="Không tải được dữ liệu" description={error}
    action={<Button onClick={reload}>Thử lại</Button>} /> : null;
}
export function ConflictResult({ conflicts }: { conflicts?: ScheduleConflict[] }) {
  if (!conflicts) return null;
  if (conflicts.length === 0) return <Alert type="success" showIcon title="Chưa phát hiện xung đột"
    description="Hệ thống sẽ kiểm tra lại tại thời điểm lưu." style={{ marginBottom: 16 }} />;
  return <Alert type="error" showIcon title="Lịch đang bị xung đột" style={{ marginBottom: 16 }}
    description={<List size="small" dataSource={conflicts} renderItem={(c) => <List.Item>
      <Typography.Text>{c.classCode} · {c.className}: {conflictReason(c.reason)} — {dayLabel(c.dayOfWeek)} {c.startTime}–{c.endTime}</Typography.Text>
    </List.Item>} />} />;
}
