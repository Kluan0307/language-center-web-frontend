import { useState } from 'react';
import { Alert, Col, DatePicker, Form, Input, Modal, Row, Select, Typography } from 'antd';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { BranchField, LoadError } from '../../components/Common/Academic';
import { useBranches } from '../../hooks/useBranches';
import { useAuth } from '../../hooks/useAuth';
import { studentService } from '../../services/admissionsService';
import { applyFormErrors, getErrorMessage } from '../../utils/apiErrors';
import { optionalText } from '../../utils/admissions';
import { businessDate } from '../../utils/academic';
import type { StudentDto, StudentRequest } from '../../types/admissions';

type Values = Omit<StudentRequest, 'dateOfBirth'> & { dateOfBirth?: Dayjs };
export default function StudentForm({ editing, defaultBranchId, onClose, onSaved }: {
  editing: StudentDto | null; defaultBranchId?: number; onClose: () => void; onSaved: (student: StudentDto) => void;
}) {
  const { user } = useAuth();
  const branches = useBranches();
  const [form] = Form.useForm<Values>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const initial = editing ? { ...editing, dateOfBirth: editing.dateOfBirth ? dayjs(editing.dateOfBirth) : undefined,
    gender: editing.gender ?? undefined } : { branchId: defaultBranchId };
  async function save(values: Values) {
    if (busy) return;
    setBusy(true); setError(undefined);
    try {
      const saved = await studentService.save(editing?.id ?? null, {
        fullName: values.fullName.trim(), phone: values.phone.trim(), email: optionalText(values.email),
        dateOfBirth: values.dateOfBirth?.format('YYYY-MM-DD'), gender: values.gender,
        address: optionalText(values.address), contactPerson: optionalText(values.contactPerson),
        currentLevel: optionalText(values.currentLevel), guardianName: optionalText(values.guardianName),
        guardianPhone: optionalText(values.guardianPhone),
        branchId: editing?.branchId ?? (user?.role === 'SUPER_ADMIN' ? values.branchId : undefined),
      });
      onSaved(saved);
    } catch (e) { applyFormErrors(form, e); setError(getErrorMessage(e)); }
    finally { setBusy(false); }
  }
  return <Modal open title={editing ? 'Cập nhật hồ sơ học viên' : 'Thêm học viên'} width={760}
    okText="Lưu học viên" cancelText="Hủy" onOk={() => form.submit()} confirmLoading={busy}
    onCancel={() => { if (!busy) onClose(); }} closable={!busy} maskClosable={!busy} cancelButtonProps={{ disabled: busy }}>
    <Form<Values> form={form} initialValues={initial} layout="vertical" onFinish={save} disabled={busy}>
      {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}
      <LoadError error={branches.error} reload={branches.reload} />
      <BranchField editing={!!editing} branches={branches.data} loading={branches.loading} />
      {editing && <Typography.Paragraph type="secondary">Mã học viên: {editing.studentCode}</Typography.Paragraph>}
      <Row gutter={16}>
        <Col xs={24} sm={12}><Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, whitespace: true, message: 'Nhập họ tên.' }, { max: 255 }]}><Input maxLength={255} /></Form.Item></Col>
        <Col xs={24} sm={12}><Form.Item name="phone" label="Điện thoại liên hệ" rules={[{ required: true, whitespace: true, message: 'Nhập số liên hệ.' }, { max: 255 }]}>
          <Input maxLength={255} /></Form.Item></Col>
        <Col xs={24} sm={12}><Form.Item name="dateOfBirth" label="Ngày sinh"><DatePicker format="DD/MM/YYYY" needConfirm={false}
          disabledDate={(date) => date.format('YYYY-MM-DD') > businessDate()} style={{ width: '100%' }} /></Form.Item></Col>
        <Col xs={24} sm={12}><Form.Item name="gender" label="Giới tính"><Select allowClear options={[
          { value: 'MALE', label: 'Nam' }, { value: 'FEMALE', label: 'Nữ' }, { value: 'OTHER', label: 'Khác' },
        ]} /></Form.Item></Col>
        <Col xs={24} sm={12}><Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email không hợp lệ.' }, { max: 255 }]}><Input maxLength={255} /></Form.Item></Col>
        <Col xs={24} sm={12}><Form.Item name="currentLevel" label="Trình độ text cũ (tham khảo)" rules={[{ max: 255 }]}><Input maxLength={255} /></Form.Item></Col>
        <Col xs={24} sm={12}><Form.Item name="guardianName" label="Người giám hộ" rules={[{ max: 255 }]}><Input maxLength={255} /></Form.Item></Col>
        <Col xs={24} sm={12}><Form.Item name="guardianPhone" label="Điện thoại người giám hộ" rules={[{ max: 30 }]}><Input maxLength={30} /></Form.Item></Col>
        <Col span={24}><Form.Item name="contactPerson" label="Liên hệ bổ sung" rules={[{ max: 255 }]}><Input maxLength={255} /></Form.Item></Col>
        <Col span={24}><Form.Item name="address" label="Địa chỉ" rules={[{ max: 255 }]}><Input.TextArea maxLength={255} rows={2} /></Form.Item></Col>
      </Row>
      <Typography.Paragraph type="secondary">Số điện thoại có thể dùng chung cho anh chị em. Mã học viên được hệ thống cấp, không dùng số điện thoại làm mã định danh.</Typography.Paragraph>
    </Form>
  </Modal>;
}
