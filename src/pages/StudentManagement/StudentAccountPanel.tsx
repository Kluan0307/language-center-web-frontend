import { useState } from "react";
import {
  Alert,
  App,
  Button,
  Descriptions,
  Form,
  Input,
  Modal,
  Space,
  Spin,
  Tag,
} from "antd";
import { useRemoteResource } from "../../hooks/useRemoteResource";
import {
  studentAccountService,
  type StudentAccount,
  type ProvisionStudentAccount,
} from "../../services/studentAccountService";
import { getErrorMessage } from "../../utils/apiErrors";
function Editor({
  kind,
  account,
  onClose,
  onSaved,
}: {
  kind: "create" | "reset" | "status";
  account: StudentAccount;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form] = Form.useForm<{
    username: string;
    temporaryPassword: string;
    confirmPassword: string;
    reason: string;
  }>();
  const [intent] = useState(() => crypto.randomUUID());
  const [pending, setPending] = useState<ProvisionStudentAccount>();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState<string>();
  const { message } = App.useApp();
  async function submit(values: {
    username: string;
    temporaryPassword: string;
    confirmPassword: string;
    reason: string;
  }) {
    if (busy) return;
    setBusy(true);
    setError(undefined);
    try {
      if (kind === "create") {
        const body = pending ?? {
          requestId: intent,
          studentId: account.studentId,
          expectedStudentVersion: account.studentVersion,
          username: values.username.trim(),
          temporaryPassword: values.temporaryPassword,
          confirmPassword: values.confirmPassword,
        };
        setPending(body);
        await studentAccountService.create(body);
      } else if (account.accountId !== null && account.version !== null) {
        if (kind === "reset")
          await studentAccountService.reset(account.accountId, {
            temporaryPassword: values.temporaryPassword,
            confirmPassword: values.confirmPassword,
            version: account.version,
            reason: values.reason,
          });
        else
          await studentAccountService.status(account.accountId, {
            active: !account.active,
            version: account.version,
            reason: values.reason,
          });
      } else throw Error("Chưa có tài khoản để thao tác.");
      message.success(
        kind === "create"
          ? "Đã cấp tài khoản. Hãy bàn giao thông tin đăng nhập qua kênh xác minh."
          : "Đã cập nhật tài khoản.",
      );
      form.resetFields();
      onSaved();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      open
      title={
        kind === "create"
          ? "Cấp tài khoản học viên"
          : kind === "reset"
            ? "Cấp lại mật khẩu"
            : account.active
              ? "Khóa tài khoản"
              : "Mở khóa tài khoản"
      }
      okText={
        busy ? "Đang xử lý…" : pending ? "Gửi lại cùng yêu cầu" : "Xác nhận"
      }
      cancelText="Đóng"
      confirmLoading={busy}
      onCancel={() => {
        if (!busy) onClose();
      }}
      onOk={() => form.submit()}
      maskClosable={!busy}
      closable={!busy}
      cancelButtonProps={{ disabled: busy }}
    >
      <Alert
        type="info"
        showIcon
        title={
          kind === "create"
            ? "Học viên phải đổi mật khẩu trong lần đăng nhập đầu."
            : kind === "reset"
              ? "Cấp lại mật khẩu thu hồi mọi phiên, không tự mở khóa tài khoản."
              : "Khóa tài khoản không thay đổi hồ sơ học tập hoặc công nợ."
        }
        style={{ marginBottom: 16 }}
      />
      {error && (
        <Alert
          type="error"
          showIcon
          title={error}
          style={{ marginBottom: 16 }}
        />
      )}
      {pending && (
        <Alert
          type="warning"
          title="Thông tin yêu cầu đã được giữ nguyên để tránh cấp trùng."
          description={
            <Button
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await studentAccountService.recover(intent);
                  message.success("Đã tìm thấy tài khoản được cấp.");
                  onSaved();
                } catch (e) {
                  setError(getErrorMessage(e));
                } finally {
                  setBusy(false);
                }
              }}
            >
              Kiểm tra kết quả
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      )}
      <Form
        form={form}
        layout="vertical"
        disabled={busy || !!pending}
        onFinish={submit}
      >
        {kind === "create" && (
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[
              {
                required: true,
                pattern: /^[A-Za-z0-9._-]{3,50}$/,
                message:
                  "Dùng3–50ký tự chữ Latin, số, dấu chấm, gạch ngang hoặc gạch dưới.",
              },
            ]}
          >
            <Input autoComplete="off" />
          </Form.Item>
        )}
        {kind !== "status" && (
          <>
            <Form.Item
              name="temporaryPassword"
              label="Mật khẩu tạm"
              rules={[
                { required: true, min: 8 },
                {
                  validator: (_, value: string) =>
                    !value || new TextEncoder().encode(value).length <= 72
                      ? Promise.resolve()
                      : Promise.reject(Error("Mật khẩu tối đa72byte UTF-8.")),
                },
              ]}
            >
              <Input.Password autoComplete="new-password" />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="Xác nhận mật khẩu tạm"
              dependencies={["temporaryPassword"]}
              rules={[
                { required: true },
                ({ getFieldValue }) => ({
                  validator: (_, value) =>
                    value === getFieldValue("temporaryPassword")
                      ? Promise.resolve()
                      : Promise.reject(Error("Xác nhận chưa khớp.")),
                }),
              ]}
            >
              <Input.Password autoComplete="new-password" />
            </Form.Item>
          </>
        )}
        {kind !== "create" && (
          <Form.Item
            name="reason"
            label="Lý do đã xác minh"
            rules={[{ required: true, whitespace: true, min: 3, max: 255 }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
export default function StudentAccountPanel({
  studentId,
  onChanged,
}: {
  studentId: number;
  onChanged: () => void;
}) {
  const resource = useRemoteResource(studentAccountService.get, { studentId });
  const [kind, setKind] = useState<"create" | "reset" | "status">();
  const a = resource.data;
  return (
    <Space orientation="vertical" style={{ width: "100%" }}>
      <Alert
        type="info"
        showIcon
        title="Tài khoản dành cho ứng dụng học viên"
        description="Chỉ cấp sau khi xác minh đúng chủ hồ sơ. Không dùng email hoặc số điện thoại để tự ghép tài khoản."
      />
      {resource.loading && <Spin />}
      {resource.error && (
        <Alert
          type="error"
          title={resource.error}
          action={<Button onClick={resource.reload}>Thử lại</Button>}
        />
      )}
      <Button onClick={resource.reload}>Tải lại trạng thái</Button>
      {a && (
        <>
          {a.linked ? (
            <>
              <Descriptions
                bordered
                column={1}
                items={[
                  {
                    key: "username",
                    label: "Tên đăng nhập",
                    children: a.username,
                  },
                  {
                    key: "status",
                    label: "Truy cập",
                    children: (
                      <Tag color={a.active ? "green" : "red"}>
                        {a.active ? "Đang mở" : "Đã khóa"}
                      </Tag>
                    ),
                  },
                  {
                    key: "activation",
                    label: "Kích hoạt",
                    children: a.mustChangePassword
                      ? "Cần đổi mật khẩu"
                      : "Đã đổi mật khẩu",
                  },
                ]}
              />
              <Space wrap>
                <Button onClick={() => setKind("reset")}>
                  Cấp lại mật khẩu
                </Button>
                <Button danger={!!a.active} onClick={() => setKind("status")}>
                  {a.active ? "Khóa" : "Mở khóa"}
                </Button>
              </Space>
            </>
          ) : (
            <>
              <TypographyNote />
              <Button type="primary" onClick={() => setKind("create")}>
                Cấp tài khoản
              </Button>
            </>
          )}
          {kind && (
            <Editor
              key={kind + ":" + a.version}
              kind={kind}
              account={a}
              onClose={() => setKind(undefined)}
              onSaved={() => {
                setKind(undefined);
                resource.reload();
                onChanged();
              }}
            />
          )}
        </>
      )}
    </Space>
  );
}
function TypographyNote() {
  return <p>Hồ sơ này chưa được liên kết tài khoản học viên.</p>;
}
