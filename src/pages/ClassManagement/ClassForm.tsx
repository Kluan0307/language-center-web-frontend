import { useState } from 'react';
import { Alert, Button, Col, DatePicker, Divider, Form, Input, InputNumber, Modal, Row, Select, Space, TimePicker, Typography } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { MinusCircle, Plus } from 'lucide-react';
import { BranchField, ConflictResult, LoadError } from '../../components/Common/Academic';
import { useBranches } from '../../hooks/useBranches';
import { useAuth } from '../../hooks/useAuth';
import { useRemoteResource } from '../../hooks/useRemoteResource';
import { authService } from '../../services/authService';
import { courseService, roomService, classService, scheduleService } from '../../services/academicService';
import { applyFormErrors, getErrorMessage } from '../../utils/apiErrors';
import { canPlan, DAYS, validateSlots } from '../../utils/academic';
import type { ClassDto, ClassRequest, ScheduleConflict, Weekday } from '../../types/academic';

interface Values {
  branchId?: number; code: string; name: string; courseId: number; roomId: number; teacherId: number;
  startDate: Dayjs; endDate: Dayjs; maxSize: number;
  slots?: { dayOfWeek: Weekday; startTime: Dayjs; endTime: Dayjs }[];
}
async function loadOptions({ branchId, enabled }: { branchId: number | null; enabled: boolean }, signal?: AbortSignal) {
  if (!enabled || !branchId) return { courses: [], rooms: [], teachers: [] };
  const [courses, rooms, teachers] = await Promise.all([
    courseService.all({ branchId }, signal), roomService.all({ branchId }, signal), authService.teachers({ branchId }, signal),
  ]);
  return { courses, rooms, teachers };
}
export default function ClassForm({ editing, defaultBranchId, onClose, onSaved }: {
  editing: ClassDto | null; defaultBranchId?: number; onClose: () => void; onSaved: () => void;
}) {
  const { user } = useAuth();
  const branches = useBranches();
  const [form] = Form.useForm<Values>();
  const chosenBranch = Form.useWatch('branchId', form) as number | undefined;
  const chosenCourse = Form.useWatch('courseId', form) as number | undefined;
  const chosenRoom = Form.useWatch('roomId', form) as number | undefined;
  const manager = !!user && canPlan(user.role);
  const branchId = editing?.branchId ?? (user?.role === 'SUPER_ADMIN' ? chosenBranch : user?.branchId) ?? null;
  const options = useRemoteResource(loadOptions, { branchId, enabled: true });
  const course = options.data?.courses.find((c) => c.id === chosenCourse);
  const room = options.data?.rooms.find((r) => r.id === chosenRoom);
  const upperSize = course && room ? Math.min(course.maxStudents, room.capacity) : undefined;
  const locked = !!editing && !manager;
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string>();
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>();
  const missingTeacher = !!editing && !!options.data && !options.data.teachers.some((t) => t.profileId === editing.teacherId);
  const initial = editing ? { ...editing, startDate: dayjs(editing.startDate), endDate: dayjs(editing.endDate), slots: [] }
    : { branchId: defaultBranchId, maxSize: 20, slots: [] };
  function payload(values: Values): ClassRequest {
    const teacher = options.data?.teachers.find((t) => t.profileId === values.teacherId);
    const slots = (values.slots ?? []).map((slot) => ({
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime.format('HH:mm'), endTime: slot.endTime.format('HH:mm'),
    }));
    validateSlots(slots);
    return { code: values.code.trim(), name: values.name.trim(), maxSize: values.maxSize,
      courseId: locked ? editing!.courseId : values.courseId, roomId: locked ? editing!.roomId : values.roomId,
      teacherId: locked ? editing!.teacherId : values.teacherId,
      teacherName: locked ? editing!.teacherName : teacher?.fullName ?? editing?.teacherName ?? '',
      startDate: locked ? editing!.startDate : values.startDate.format('YYYY-MM-DD'),
      endDate: locked ? editing!.endDate : values.endDate.format('YYYY-MM-DD'),
      branchId: branchId ?? undefined, ...(!editing && manager ? { schedules: slots } : {}),
    };
  }
  async function preview(data: ClassRequest) {
    const lists = await Promise.all((data.schedules ?? []).map((slot) => scheduleService.check({
      ...slot, branchId: data.branchId, roomId: data.roomId, teacherId: data.teacherId,
      startDate: data.startDate, endDate: data.endDate,
    })));
    const found = lists.flat(); setConflicts(found); return found.length === 0;
  }
  async function check() {
    try {
      const values = await form.validateFields(); const data = payload(values);
      if (!data.schedules?.length) { setError('Thêm ít nhất một buổi để kiểm tra lịch.'); return; }
      setChecking(true); setError(undefined); await preview(data);
    } catch (e) { if (e instanceof Error || !('errorFields' in Object(e))) setError(getErrorMessage(e)); }
    finally { setChecking(false); }
  }
  async function save(values: Values) {
    if (busy || checking || options.loading) return;
    setBusy(true); setError(undefined);
    try {
      const data = payload(values);
      if (!editing && manager && data.schedules?.length && !await preview(data)) return;
      await classService.save(editing?.id ?? null, data);
      onSaved();
    } catch (e) { setConflicts(undefined); applyFormErrors(form, e); setError(getErrorMessage(e)); }
    finally { setBusy(false); }
  }
  const teacherOptions = options.data?.teachers.map((t) => ({ value: t.profileId, label: t.fullName })) ?? [];
  if (missingTeacher && editing) teacherOptions.push({ value: editing.teacherId, label: editing.teacherName + ' (không còn khả dụng)' });
  return <Modal open title={editing ? 'Chỉnh sửa lớp học' : 'Thêm lớp học'} width={860} onCancel={() => { if (!busy && !checking) onClose(); }}
    okText="Lưu lớp học" cancelText="Hủy" onOk={() => form.submit()} confirmLoading={busy}
    okButtonProps={{ disabled: checking || options.loading || !!options.error || !branchId }} cancelButtonProps={{ disabled: busy || checking }}
    closable={!busy && !checking} maskClosable={!busy && !checking}>
    <Form<Values> form={form} layout="vertical" initialValues={initial} onFinish={save} disabled={busy || checking}
      onValuesChange={(changed) => {
        setConflicts(undefined);
        if ('branchId' in changed && !editing) form.setFieldsValue({ courseId: undefined, roomId: undefined, teacherId: undefined });
      }}>
      {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}
      {locked && <Alert type="info" showIcon title="Bạn chỉ được sửa mã, tên và sĩ số tối đa của lớp đã có." style={{ marginBottom: 16 }} />}
      {missingTeacher && <Alert type="warning" showIcon title="Giáo viên hiện tại không còn khả dụng. Cần phân công giáo viên đang hoạt động trước khi lưu." style={{ marginBottom: 16 }} />}
      <LoadError error={branches.error} reload={branches.reload} /><LoadError error={options.error} reload={options.reload} />
      {branchId && !options.loading && options.data && !editing &&
        (!options.data.courses.some((c) => c.status === 'OPEN') || !options.data.rooms.some((r) => r.status === 'AVAILABLE') || !options.data.teachers.length) &&
        <Alert type="warning" showIcon title="Chưa đủ dữ liệu để mở lớp"
          description="Cần khóa học đang mở, phòng sẵn sàng và giáo viên khả dụng trong chi nhánh. Hãy bổ sung các thông tin này trước."
          style={{ marginBottom: 16 }} />}
      <BranchField branches={branches.data} loading={branches.loading} editing={!!editing} />
      <Row gutter={16}>
        <Col xs={24} sm={12}><Form.Item name="code" label="Mã lớp" rules={[{ required: true, whitespace: true, message: 'Nhập mã lớp.' }, { max: 255 }]}><Input maxLength={255} /></Form.Item></Col>
        <Col xs={24} sm={12}><Form.Item name="name" label="Tên lớp" rules={[{ required: true, whitespace: true, message: 'Nhập tên lớp.' }, { max: 255 }]}><Input maxLength={255} /></Form.Item></Col>
        <Col xs={24} sm={12}><Form.Item name="courseId" label="Khóa học" rules={[{ required: true, message: 'Chọn khóa học.' }]}>
          <Select disabled={locked || !branchId} loading={options.loading} showSearch optionFilterProp="label"
            options={options.data?.courses.map((c) => ({ value: c.id, label: `${c.code} · ${c.name}${c.branchId === null ? ' (Chung)' : ''}`,
              disabled: c.status === 'CLOSED' && c.id !== editing?.courseId }))} /></Form.Item></Col>
        <Col xs={24} sm={12}><Form.Item name="teacherId" label="Giáo viên" rules={[{ required: true, message: 'Chọn giáo viên.' }]}>
          <Select disabled={locked || !branchId} loading={options.loading} showSearch optionFilterProp="label" options={teacherOptions} /></Form.Item></Col>
        <Col xs={24} sm={12}><Form.Item name="roomId" label="Phòng học" rules={[{ required: true, message: 'Chọn phòng học.' }]}>
          <Select disabled={locked || !branchId} loading={options.loading} showSearch optionFilterProp="label"
            options={options.data?.rooms.map((r) => ({ value: r.id, label: `${r.code} · ${r.name} (${r.capacity} chỗ)${r.status === 'MAINTENANCE' ? ' — Bảo trì' : ''}`,
              disabled: r.status !== 'AVAILABLE' }))} /></Form.Item></Col>
        <Col xs={24} sm={12}><Form.Item name="maxSize" label="Sĩ số tối đa" extra={upperSize ? `Giới hạn khóa/phòng: ${upperSize}; hiện có ${editing?.currentSize ?? 0} học viên.` : undefined}
          rules={[{ required: true }, { type: 'number', min: Math.max(1, editing?.currentSize ?? 0), max: upperSize, message: 'Sĩ số phải phù hợp khóa, phòng và số học viên hiện tại.' }]}>
          <InputNumber min={Math.max(1, editing?.currentSize ?? 0)} max={upperSize} precision={0} style={{ width: '100%' }} /></Form.Item></Col>
        <Col xs={24} sm={12}><Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true, message: 'Chọn ngày bắt đầu.' }]}>
          <DatePicker disabled={locked} needConfirm={false} format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
        <Col xs={24} sm={12}><Form.Item name="endDate" label="Ngày kết thúc" dependencies={['startDate']} rules={[
          { required: true, message: 'Chọn ngày kết thúc.' },
          ({ getFieldValue }) => ({ validator: (_, value: Dayjs) => !value || !getFieldValue('startDate') || !value.isBefore(getFieldValue('startDate'), 'day')
            ? Promise.resolve() : Promise.reject(new Error('Ngày kết thúc không được trước ngày bắt đầu.')) }),
        ]}><DatePicker disabled={locked} needConfirm={false} format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
      </Row>
      {!editing && manager && <>
        <Divider>Lịch tuần ban đầu (tùy chọn)</Divider>
        <Typography.Paragraph type="secondary">Mỗi lớp tối đa một buổi cho mỗi ngày trong tuần. Có thể thêm lịch sau ở mục Lịch học.</Typography.Paragraph>
        <Form.List name="slots">{(fields, { add, remove }) => <>
          {fields.map((field) => <Row key={field.key} gutter={12} align="top">
            <Col xs={24} sm={6}><Form.Item name={[field.name, 'dayOfWeek']} label="Ngày học" rules={[{ required: true, message: 'Chọn ngày.' }]}><Select options={DAYS} /></Form.Item></Col>
            <Col xs={10} sm={8}><Form.Item name={[field.name, 'startTime']} label="Bắt đầu" rules={[{ required: true, message: 'Chọn giờ.' }]}><TimePicker needConfirm={false} format="HH:mm" minuteStep={5} style={{ width: '100%' }} /></Form.Item></Col>
            <Col xs={10} sm={8}><Form.Item name={[field.name, 'endTime']} label="Kết thúc" rules={[{ required: true, message: 'Chọn giờ.' }]}><TimePicker needConfirm={false} format="HH:mm" minuteStep={5} style={{ width: '100%' }} /></Form.Item></Col>
            <Col xs={4} sm={2}><Button style={{ marginTop: 30 }} type="text" aria-label="Xóa buổi" icon={<MinusCircle size={16} />} onClick={() => remove(field.name)} /></Col>
          </Row>)}
          <Space wrap style={{ marginBottom: 16 }}>
            <Button icon={<Plus size={16} />} onClick={() => add()}>Thêm buổi</Button>
            <Button onClick={() => void check()} loading={checking} disabled={busy || options.loading || !branchId}>Kiểm tra lịch</Button>
          </Space>
        </>}</Form.List>
        <ConflictResult conflicts={conflicts} />
      </>}
      {editing && <Typography.Paragraph type="secondary">Lịch được giữ nguyên khi sửa lớp. Quản trị viên điều chỉnh từng buổi ở mục Lịch học.</Typography.Paragraph>}
    </Form>
  </Modal>;
}
