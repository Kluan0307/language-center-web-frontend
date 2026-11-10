import { useState } from 'react';
import {useFormLeaveGuard} from '../../hooks/useFormLeaveGuard';
import { Alert, Col, Form, Input, Modal, Row, Select, Typography } from 'antd';
import { BranchField, LoadError } from '../../components/Common/Academic';
import { useBranches } from '../../hooks/useBranches';
import { useAuth } from '../../hooks/useAuth';
import { useRemoteResource } from '../../hooks/useRemoteResource';
import { courseService } from '../../services/academicService';
import { leadService } from '../../services/admissionsService';
import { optionalText } from '../../utils/admissions';
import { applyFormErrors, getErrorMessage } from '../../utils/apiErrors';
import type { LeadDto, LeadRequest } from '../../types/admissions';
async function coursesForLead({ branchId }: { branchId: number | null }, signal?: AbortSignal) {
  return branchId ? courseService.all({ branchId }, signal) : [];
}
export default function LeadForm({ editing, defaultBranchId, onClose, onSaved }: {
  editing: LeadDto | null; defaultBranchId?: number; onClose: () => void; onSaved: (lead: LeadDto) => void;
}) {
  const { user } = useAuth();
  const branches = useBranches();
  const [form] = Form.useForm<LeadRequest>();
  const chosenBranch = Form.useWatch('branchId', form) as number | undefined;
  const branchId = editing?.branchId ?? (user?.role === 'SUPER_ADMIN' ? chosenBranch : user?.branchId) ?? null;
  const courses = useRemoteResource(coursesForLead, { branchId });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const guard=useFormLeaveGuard(busy,onClose);
  const initial = editing ? { ...editing, email: editing.email ?? '', source: editing.source ?? '',
    desiredLevel: editing.desiredLevel ?? '', interestedCourseId: editing.interestedCourseId ?? undefined, note: '' } : { branchId: defaultBranchId };
  async function save(values: LeadRequest) {
    if (busy) return;
    setBusy(true); setError(undefined);
    try {
      const saved = await leadService.save(editing?.id ?? null, {
        fullName: values.fullName.trim(), phone: values.phone.trim(), email: optionalText(values.email),
        source: optionalText(values.source), interestedCourseId: values.interestedCourseId,
        desiredLevel: optionalText(values.desiredLevel), note: optionalText(values.note), branchId: branchId ?? undefined,version:editing?.version,
      });
      onSaved(saved);
    } catch (e) { applyFormErrors(form, e); setError(getErrorMessage(e)); }
    finally { setBusy(false); }
  }
  return <Modal open title={editing ? 'Chỉnh sửa Lead' : 'Thêm khách hàng tiềm năng'} width={720}
    okText="Lưu Lead" cancelText="Hủy" confirmLoading={busy} okButtonProps={{ disabled: !branchId }}
    onOk={() => form.submit()} onCancel={guard.cancel} closable={!busy} maskClosable={!busy} cancelButtonProps={{ disabled: busy }}>
    <Form<LeadRequest> form={form} layout="vertical" initialValues={initial} onFinish={save} disabled={busy}
      onValuesChange={(changed) => { guard.changed();if ('branchId' in changed) form.setFieldsValue({ interestedCourseId: undefined }); }}>
      {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}
      <LoadError error={branches.error} reload={branches.reload} />
      <BranchField editing={!!editing} branches={branches.data} loading={branches.loading} />
      <Row gutter={16}>
        <Col xs={24} sm={12}><Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, whitespace: true, message: 'Nhập họ tên.' }, { max: 255 }]}><Input maxLength={255} /></Form.Item></Col>
        <Col xs={24} sm={12}><Form.Item name="phone" label="Điện thoại" rules={[{ required: true, whitespace: true, message: 'Nhập số liên hệ.' }, { max: 255 }]}><Input maxLength={255} /></Form.Item></Col>
        <Col xs={24} sm={12}><Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email không hợp lệ.' }, { max: 255 }]}><Input maxLength={255} /></Form.Item></Col>
        <Col xs={24} sm={12}><Form.Item name="source" label="Nguồn tiếp nhận" rules={[{ max: 255 }]}><Input maxLength={255} placeholder="Ví dụ: Facebook, giới thiệu, tại quầy" /></Form.Item></Col>
        <Col xs={24} sm={12}><Form.Item name="interestedCourseId" label="Khóa quan tâm">
          <Select allowClear disabled={!branchId || !!courses.error} loading={courses.loading} showSearch optionFilterProp="label"
            options={courses.data?.map((c) => ({ value: c.id, label: `${c.code} · ${c.name}${c.status === 'CLOSED' ? ' (Đã đóng)' : ''}` }))} /></Form.Item></Col>
        <Col xs={24} sm={12}><Form.Item name="desiredLevel" label="Trình độ mong muốn" rules={[{ max: 255 }]}><Input maxLength={255} /></Form.Item></Col>
      </Row>
      <LoadError error={courses.error} reload={courses.reload} />
      <Form.Item name="note" label={editing ? 'Ghi chú bổ sung' : 'Ghi chú'} extra={editing ? 'Nội dung mới được nối vào lịch sử; để trống nếu không bổ sung.' : undefined}><Input.TextArea rows={3} /></Form.Item>
      <Typography.Paragraph type="secondary">Người phụ trách: {editing?.assignedToName ?? user?.username}. Không thay đổi người phụ trách qua màn này.</Typography.Paragraph>
    </Form>
  </Modal>;
}
