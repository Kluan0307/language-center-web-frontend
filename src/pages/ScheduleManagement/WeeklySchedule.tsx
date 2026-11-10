import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert, App, Button, Card, Form, Modal, Popconfirm, Select, Space, Table, TimePicker, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { ManagementLayout, Filters } from '../../components/Layout/ManagementLayout';
import { BranchFilter, ConflictResult, LoadError } from '../../components/Common/Academic';
import { useBranches } from '../../hooks/useBranches';
import { useAuth } from '../../hooks/useAuth';
import { useRemoteResource } from '../../hooks/useRemoteResource';
import { classService, scheduleService } from '../../services/academicService';
import { applyFormErrors, getErrorMessage } from '../../utils/apiErrors';
import { branchLabel, canPlan, DAYS, dayLabel, validateSlots } from '../../utils/academic';
import { displayDate } from '../../utils/display';
import type { ClassDto, ScheduleDto, ScheduleQuery, ScheduleConflict, Weekday, ScheduleRequest } from '../../types/academic';

interface Values { classId: number; dayOfWeek: Weekday; startTime: Dayjs; endTime: Dayjs }
function ScheduleForm({ editing, defaultClassId, classes, onClose, onSaved }: {
  editing: ScheduleDto | null; defaultClassId?: number; classes: ClassDto[];
  onClose: () => void; onSaved: () => void;
}) {
  const [form] = Form.useForm<Values>();
  const selected = Form.useWatch('classId', form);
  const c = classes.find((entry) => entry.id === selected);
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string>();
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>();
  const initial = editing ? { classId: editing.classId, dayOfWeek: editing.dayOfWeek,
    startTime: dayjs('2000-01-01T' + editing.startTime), endTime: dayjs('2000-01-01T' + editing.endTime) }
    : { classId: defaultClassId };
  function payload(values: Values): ScheduleRequest {
    const data = { classId: editing?.classId ?? values.classId, dayOfWeek: values.dayOfWeek,
      startTime: values.startTime.format('HH:mm'), endTime: values.endTime.format('HH:mm') };
    validateSlots([data]); return data;
  }
  async function preview(data: ScheduleRequest) {
    const result = await scheduleService.check({ ...data, excludeScheduleId: editing?.id });
    setConflicts(result); return result.length === 0;
  }
  async function check() {
    try {
      const values = await form.validateFields();
      setChecking(true); setError(undefined); await preview(payload(values));
    } catch (e) { if (e instanceof Error || !('errorFields' in Object(e))) setError(getErrorMessage(e)); }
    finally { setChecking(false); }
  }
  async function save(values: Values) {
    if (busy || checking) return;
    setBusy(true); setError(undefined);
    try {
      const data = payload(values);
      if (!await preview(data)) return;
      await scheduleService.save(editing?.id ?? null, data);
      onSaved();
    } catch (e) { setConflicts(undefined); applyFormErrors(form, e); setError(getErrorMessage(e)); }
    finally { setBusy(false); }
  }
  return <Modal open title={editing ? 'Chỉnh sửa lịch mẫu' : 'Thêm lịch mẫu'} width={680}
    onCancel={() => { if (!busy && !checking) onClose(); }} onOk={() => form.submit()}
    okText="Lưu lịch" cancelText="Hủy" confirmLoading={busy} okButtonProps={{ disabled: checking }}
    cancelButtonProps={{ disabled: busy || checking }} closable={!busy && !checking} maskClosable={!busy && !checking}>
    <Form<Values> form={form} initialValues={initial} layout="vertical" disabled={busy || checking}
      onFinish={save} onValuesChange={() => setConflicts(undefined)}>
      {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}
      <Form.Item name="classId" label="Lớp học" rules={[{ required: true, message: 'Chọn lớp học.' }]}>
        <Select disabled={!!editing} showSearch optionFilterProp="label" options={classes.map((entry) => ({
          value: entry.id, label: `${entry.code} · ${entry.name} — ${entry.teacherName} / ${entry.roomName}`,
          disabled: !editing && entry.status === 'FINISHED',
        }))} />
      </Form.Item>
      {c && <Alert type="info" showIcon title={`${displayDate(c.startDate, false)} — ${displayDate(c.endDate, false)}`}
        description={`Giáo viên: ${c.teacherName}. Phòng: ${c.roomName}.`} style={{ marginBottom: 16 }} />}
      <Form.Item name="dayOfWeek" label="Ngày trong tuần" rules={[{ required: true, message: 'Chọn ngày học.' }]}>
        <Select options={DAYS} /></Form.Item>
      <Space wrap align="start" style={{ width: '100%' }}>
        <Form.Item name="startTime" label="Giờ bắt đầu" rules={[{ required: true, message: 'Chọn giờ bắt đầu.' }]}>
          <TimePicker needConfirm={false} format="HH:mm" minuteStep={5} /></Form.Item>
        <Form.Item name="endTime" label="Giờ kết thúc" dependencies={['startTime']} rules={[
          { required: true, message: 'Chọn giờ kết thúc.' },
          ({ getFieldValue }) => ({ validator: (_, value: Dayjs) => !value || !getFieldValue('startTime') || value.format('HH:mm') > getFieldValue('startTime').format('HH:mm')
            ? Promise.resolve() : Promise.reject(new Error('Giờ kết thúc phải sau giờ bắt đầu.')) }),
        ]}><TimePicker needConfirm={false} format="HH:mm" minuteStep={5} /></Form.Item>
      </Space>
      <Typography.Paragraph type="secondary">Lịch lặp mỗi tuần trong thời gian của lớp. Mỗi lớp chỉ có một buổi trong cùng một ngày trong tuần.</Typography.Paragraph>
      <Button onClick={() => void check()} loading={checking} disabled={busy} style={{ marginBottom: 16 }}>Kiểm tra xung đột</Button>
      <ConflictResult conflicts={conflicts} />
    </Form>
  </Modal>;
}
export default function ScheduleManagement() {
  const { user } = useAuth();
  const { message } = App.useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const parsed = Number(searchParams.get('classId'));
  const classId = Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
  const [query, setQuery] = useState<ScheduleQuery>({ page: 0, size: 10 });
  const list = useRemoteResource(scheduleService.list, { ...query, classId });
  const classes = useRemoteResource(classService.all, { branchId: query.branchId });
  const branches = useBranches();
  const [formState, setFormState] = useState<{ editing: ScheduleDto | null } | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const manager = !!user && canPlan(user.role);
  const teacher = user?.role === 'TEACHER';
  const classById = new Map(classes.data?.map((c) => [c.id, c]));
  const teachers = Array.from(new Map(classes.data?.map((c) => [c.teacherId, { value: c.teacherId, label: c.teacherName }])).values());
  const rooms = Array.from(new Map(classes.data?.map((c) => [c.roomId, { value: c.roomId, label: c.roomName }])).values());
  async function remove(slot: ScheduleDto) {
    if (!manager || busyId !== null) return;
    setBusyId(slot.id);
    try { await scheduleService.remove(slot.id); list.reload(); message.success('Đã xóa buổi học.'); }
    catch (e) { message.error(getErrorMessage(e)); }
    finally { setBusyId(null); }
  }
  const columns: TableColumnsType<ScheduleDto> = [
    { title: 'Ngày / giờ', key: 'time', render: (_, s) => <div><strong>{dayLabel(s.dayOfWeek)}</strong><div>{s.startTime}–{s.endTime}</div></div> },
    { title: 'Lớp học', key: 'class', width: 250, render: (_, s) => <div>{s.className}<div><Typography.Text type="secondary">{s.classCode}</Typography.Text></div></div> },
    { title: 'Giáo viên', dataIndex: 'teacherName' }, { title: 'Phòng', dataIndex: 'roomName' },
    { title: 'Thời gian lớp', key: 'dates', render: (_, s) => { const c = classById.get(s.classId); return c
      ? <div>{displayDate(c.startDate, false)}<div><Typography.Text type="secondary">đến {displayDate(c.endDate, false)}</Typography.Text></div></div> : '—'; } },
    ...(user?.role === 'SUPER_ADMIN' ? [{ title: 'Chi nhánh', dataIndex: 'branchId', render: (id: number) => branchLabel(branches.data, id) }] : []),
    ...(manager ? [{ title: 'Thao tác', key: 'actions', fixed: 'right' as const, width: 150, render: (_: unknown, s: ScheduleDto) => <Space>
      <Button size="small" icon={<Pencil size={14} />} disabled={classes.loading || !!classes.error} onClick={() => setFormState({ editing: s })}>Sửa</Button>
      <Popconfirm title="Xóa lịch mẫu này?" okText="Xóa" cancelText="Hủy" onConfirm={() => remove(s)} disabled={busyId !== null}>
        <Button size="small" danger icon={<Trash2 size={14} />} disabled={busyId !== null} loading={busyId === s.id}>Xóa</Button>
      </Popconfirm>
    </Space> }] : []),
  ];
  return <ManagementLayout title={teacher ? 'Lịch dạy của tôi' : 'Lịch học'}
    description="Mẫu sinh lịch. Thay đổi chỉ đồng bộ các buổi tương lai chưa điều chỉnh/điểm danh; hôm nay và lịch sử được giữ nguyên."
    actions={<><Link to={'/schedule'+(classId?'?classId='+classId:'')}><Button>Buổi học thực tế</Button></Link><Button icon={<RefreshCw size={16} />} loading={list.loading} onClick={() => { list.reload(); classes.reload(); }}>Tải lại</Button>
      {manager && <Button type="primary" icon={<Plus size={16} />} disabled={classes.loading || !!classes.error || !classes.data?.some((c) => c.status !== 'FINISHED')}
        onClick={() => setFormState({ editing: null })}>Thêm lịch mẫu</Button>}</>}>
    {!manager && <Alert type="info" showIcon title={teacher ? 'Bạn chỉ xem lịch của các lớp được phân công.' : 'Bạn có quyền xem lịch; việc điều chỉnh lịch do quản trị viên thực hiện.'} />}
    <LoadError error={list.error} reload={list.reload} /><LoadError error={classes.error} reload={classes.reload} />
    <Card>
      <Filters>
        <BranchFilter branches={branches.data} loading={branches.loading} value={query.branchId} onChange={(branchId) => {
          setQuery((q) => ({ page: 0, size: q.size, branchId })); setSearchParams({view:'weekly'});
        }} />
        <Select className="filter" style={{ minWidth: 260 }} aria-label="Lọc lớp" placeholder="Tất cả lớp" allowClear showSearch optionFilterProp="label"
          loading={classes.loading} value={classId} options={classes.data?.map((c) => ({ value: c.id, label: `${c.code} · ${c.name}` }))}
          onChange={(id: number | undefined) => { setSearchParams(id ? {view:'weekly', classId: String(id) } : {view:'weekly'}); setQuery((q) => ({ ...q, page: 0 })); }} />
        <Select className="filter" aria-label="Ngày học" placeholder="Tất cả ngày" allowClear value={query.dayOfWeek} options={DAYS}
          onChange={(dayOfWeek) => setQuery((q) => ({ ...q, dayOfWeek, page: 0 }))} />
        {!teacher && <Select className="filter" aria-label="Lọc giáo viên" placeholder="Tất cả giáo viên" showSearch optionFilterProp="label"
          allowClear options={teachers} value={query.teacherId} onChange={(teacherId) => setQuery((q) => ({ ...q, teacherId, page: 0 }))} />}
        <Select className="filter" aria-label="Lọc phòng" placeholder="Tất cả phòng" allowClear showSearch optionFilterProp="label"
          options={rooms} value={query.roomId} onChange={(roomId) => setQuery((q) => ({ ...q, roomId, page: 0 }))} />
        <Typography.Text type="secondary">{list.data?.totalElements ?? 0} buổi/tuần</Typography.Text>
      </Filters>
      <Table<ScheduleDto> columns={columns} dataSource={list.data?.content ?? []} rowKey="id" loading={list.loading} scroll={{ x: 1100 }}
        locale={{ emptyText: list.error ? 'Chưa tải được dữ liệu' : 'Không có lịch phù hợp' }}
        pagination={{ current: query.page + 1, pageSize: query.size, total: list.data?.totalElements ?? 0, showSizeChanger: true,
          pageSizeOptions: [10, 20, 50], onChange: (page, size) => setQuery((q) => ({ ...q, page: size !== q.size ? 0 : page - 1, size })) }} />
    </Card>
    {formState && manager && <ScheduleForm editing={formState.editing} defaultClassId={classId} classes={classes.data ?? []}
      onClose={() => setFormState(null)} onSaved={() => { setFormState(null); list.reload(); message.success('Đã lưu lịch học.'); }} />}
  </ManagementLayout>;
}
