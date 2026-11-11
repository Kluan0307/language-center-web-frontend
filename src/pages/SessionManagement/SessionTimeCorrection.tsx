import { useState } from "react";
import { Alert, Button, Form, Input, Modal, TimePicker } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { api } from "../../api/axiosInstance";
import { useAuth } from "../../hooks/useAuth";
import { useFormLeaveGuard } from "../../hooks/useFormLeaveGuard";
import { getErrorMessage } from "../../utils/apiErrors";
import type { ClassSession } from "../../types/session";
function CorrectionForm({
  session,
  onClose,
  onSaved,
}: {
  session: ClassSession;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form] = Form.useForm<{ start: Dayjs; end: Dayjs; reason: string }>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const leave = useFormLeaveGuard(busy, onClose);
  return (
    <Modal
      open
      title="Đối soát giờ buổi đã hoàn tất"
      onCancel={leave.cancel}
      onOk={() => form.submit()}
      confirmLoading={busy}
      closable={!busy}
      maskClosable={false}
      cancelButtonProps={{ disabled: busy }}
    >
      <Alert
        showIcon
        type="warning"
        title="Thao tác thay đổi tổng phút đã học"
        description="Nhập lý do điều chỉnh thời lượng. Nếu lớp đã chốt kết quả, cần mở lại trước khi sửa."
      />
      {error && <Alert type="error" title={error} />}
      <Form
        form={form}
        layout="vertical"
        disabled={busy}
        initialValues={{
          start: session.startTime
            ? dayjs(session.sessionDate + "T" + session.startTime)
            : undefined,
          end: session.endTime
            ? dayjs(session.sessionDate + "T" + session.endTime)
            : undefined,
        }}
        onValuesChange={leave.changed}
        onFinish={async (v) => {
          if (busy) return;
          setBusy(true);
          setError(undefined);
          try {
            await api.post(
              "/academic/sessions/" + session.id + "/correct-time",
              {
                startTime: v.start.format("HH:mm"),
                endTime: v.end.format("HH:mm"),
                version: session.version,
                reason: v.reason.trim(),
              },
            );
            onSaved();
          } catch (e) {
            setError(getErrorMessage(e));
          } finally {
            setBusy(false);
          }
        }}
      >
        <Form.Item name="start" label="Bắt đầu" rules={[{ required: true }]}>
          <TimePicker format="HH:mm" />
        </Form.Item>
        <Form.Item name="end" label="Kết thúc" rules={[{ required: true }]}>
          <TimePicker format="HH:mm" />
        </Form.Item>
        <Form.Item
          name="reason"
          label="Lý do đối soát"
          rules={[{ required: true, min: 3, max: 500, whitespace: true }]}
        >
          <Input.TextArea maxLength={500} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
export default function SessionTimeCorrection({
  session,
  onSaved,
}: {
  session: ClassSession;
  onSaved: () => void;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  if (
    !["ADMIN", "SUPER_ADMIN"].includes(user?.role ?? "") ||
    session.status !== "COMPLETED"
  )
    return null;
  return (
    <>
      <Button onClick={() => setOpen(true)}>Đối soát giờ đã học</Button>
      {open && (
        <CorrectionForm
          session={session}
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            onSaved();
          }}
        />
      )}
    </>
  );
}
