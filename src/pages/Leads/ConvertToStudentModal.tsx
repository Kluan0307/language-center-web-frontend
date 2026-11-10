import { useState } from 'react';
import { Alert, Descriptions, Modal } from 'antd';
import { leadService } from '../../services/admissionsService';
import { getErrorMessage } from '../../utils/apiErrors';
import type { LeadDto } from '../../types/admissions';

export default function ConvertToStudentModal({ lead, onClose, onSaved }: { lead: LeadDto; onClose: () => void; onSaved: (lead: LeadDto) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  async function convert() {
    if (busy) return;
    setBusy(true); setError(undefined);
    try { onSaved(await leadService.convert(lead.id,lead.version)); }
    catch (e) { setError(getErrorMessage(e)); }
    finally { setBusy(false); }
  }
  return <Modal open title="Chuyển Lead thành học viên" okText="Chuyển thành học viên" cancelText="Hủy"
    confirmLoading={busy} onOk={() => void convert()} onCancel={() => { if (!busy) onClose(); }}
    closable={!busy} maskClosable={!busy} cancelButtonProps={{ disabled: busy }}>
    {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}
    <Alert type="info" showIcon title="Tạo hồ sơ học viên trong cùng chi nhánh"
      description="Mã học viên do hệ thống cấp. Ngày sinh, người giám hộ và thông tin còn thiếu được bổ sung ở hồ sơ học viên."
      style={{ marginBottom: 16 }} />
    <Descriptions column={1} items={[
      { key: 'name', label: 'Họ tên', children: lead.fullName }, { key: 'phone', label: 'Điện thoại', children: lead.phone },
      { key: 'email', label: 'Email', children: lead.email || '—' },
      { key: 'level', label: 'Trình độ mong muốn', children: lead.desiredLevel || '—' },
    ]} />
  </Modal>;
}
