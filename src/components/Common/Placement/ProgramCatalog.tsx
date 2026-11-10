import { useState } from "react";
import {
  Alert,
  App,
  Button,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Space,
  Switch,
  Table,
  Typography,
} from "antd";
import { useRemoteResource } from "../../../hooks/useRemoteResource";
import { useFormLeaveGuard } from "../../../hooks/useFormLeaveGuard";
import { programService } from "../../../services/placementService";
import { getErrorMessage, applyFormErrors } from "../../../utils/apiErrors";
import type {
  Program,
  ProgramLevel,
  LevelRequest,
} from "../../../types/placement";
function CatalogForm({
  programId,
  editing,
  level,
  onClose,
  onSaved,
}: {
  programId: number | null;
  editing: Program | ProgramLevel | null;
  level: boolean;
  onClose: () => void;
  onSaved: (id: number) => void;
}) {
  const [form] = Form.useForm<LevelRequest>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const leave = useFormLeaveGuard(busy, onClose);
  async function save(v: LevelRequest) {
    if (busy) return;
    setBusy(true);
    setError(undefined);
    try {
      const r = level
        ? await programService.saveLevel(programId!, editing?.id ?? null, {
            ...v,
            version: editing?.version,
          })
        : await programService.save(editing?.id ?? null, {
            code: v.code,
            name: v.name,
            active: v.active,
            version: editing?.version,
          });
      onSaved(r.id);
    } catch (e) {
      applyFormErrors(form, e);
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      open
      title={
        (editing ? "Cập nhật " : "Thêm ") +
        (level ? "trình độ" : "chương trình")
      }
      okText="Lưu danh mục"
      cancelText="Hủy"
      onOk={() => form.submit()}
      onCancel={leave.cancel}
      confirmLoading={busy}
      closable={!busy}
      maskClosable={!busy}
      cancelButtonProps={{ disabled: busy }}
    >
      {error && <Alert showIcon type="error" title={error} />}
      <Form<LevelRequest>
        name="programCatalog"
        form={form}
        layout="vertical"
        initialValues={editing ?? { active: true, rank: 0 }}
        onValuesChange={leave.changed}
        onFinish={save}
        disabled={busy}
      >
        <Form.Item
          name="code"
          label="Mã (không đổi sau khi tạo)"
          rules={[
            { required: true },
            {
              pattern: /^[A-Za-z0-9][A-Za-z0-9._-]{0,49}$/,
              message: "Dùng chữ, số, dấu chấm/gạch; tối đa 50 ký tự.",
            },
          ]}
        >
          <Input disabled={!!editing} maxLength={50} />
        </Form.Item>
        <Form.Item
          name="name"
          label="Tên hiển thị"
          rules={[{ required: true, whitespace: true }, { max: 255 }]}
        >
          <Input maxLength={255} />
        </Form.Item>
        {level && (
          <Form.Item
            name="rank"
            label="Thứ tự hiển thị (không tự suy ra điều kiện đầu vào)"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} max={2147483647} precision={0} />
          </Form.Item>
        )}
        <Form.Item
          name="active"
          label="Cho dùng trong cấu hình mới"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
export default function ProgramCatalog({
  onClose,
  onChanged,
}: {
  onClose: () => void;
  onChanged: () => void;
}) {
  const programs = useRemoteResource(programService.list, {});
  const [id, setId] = useState<number | null>(null);
  const levels = useRemoteResource(programService.levels, { id });
  const [form, setForm] = useState<{
    level: boolean;
    editing: Program | ProgramLevel | null;
  } | null>(null);
  const { message } = App.useApp();
  function saved(value: number) {
    if (!form?.level) setId(value);
    setForm(null);
    programs.reload();
    levels.reload();
    onChanged();
    message.success(
      "Đã lưu danh mục. Điều kiện và đánh giá đã xác nhận giữ nguyên snapshot.",
    );
  }
  return (
    <Drawer
      open
      width={960}
      title="Chương trình và thang trình độ"
      onClose={onClose}
    >
      <Alert
        showIcon
        type="info"
        title="Danh mục do quản trị toàn hệ thống quản lý."
        description="Mã là định danh trong chương trình. Không tự quy đổi giữa IELTS, TOEIC hoặc các thang khác; đổi tên/đóng danh mục không viết lại dữ liệu đã xác nhận."
      />
      <Space orientation="vertical" style={{ width: "100%" }}>
        <Button
          type="primary"
          onClick={() => setForm({ level: false, editing: null })}
        >
          Thêm chương trình
        </Button>
        {programs.error && (
          <Alert
            type="error"
            title={programs.error}
            action={<Button onClick={programs.reload}>Thử lại</Button>}
          />
        )}
        <Table<Program>
          rowKey="id"
          size="small"
          loading={programs.loading}
          dataSource={programs.data}
          columns={[
            { title: "Mã", dataIndex: "code" },
            { title: "Tên", dataIndex: "name" },
            {
              title: "Trạng thái",
              dataIndex: "active",
              render: (v) => (v ? "Đang dùng" : "Ngừng dùng mới"),
            },
            {
              title: "Thao tác",
              render: (_, p) => (
                <Space>
                  <Button onClick={() => setId(p.id)}>Trình độ</Button>
                  <Button onClick={() => setForm({ level: false, editing: p })}>
                    Sửa
                  </Button>
                </Space>
              ),
            },
          ]}
          scroll={{ x: 600 }}
        />
        {id !== null && (
          <>
            <Typography.Title level={5}>
              Trình độ: {programs.data?.find((p) => p.id === id)?.name}
            </Typography.Title>
            <Button
              onClick={() => setForm({ level: true, editing: null })}
              disabled={!programs.data?.find((p) => p.id === id)?.active}
            >
              Thêm trình độ
            </Button>
            {levels.error && (
              <Alert
                type="error"
                title={levels.error}
                action={<Button onClick={levels.reload}>Thử lại</Button>}
              />
            )}
            <Table<ProgramLevel>
              rowKey="id"
              size="small"
              loading={levels.loading}
              dataSource={levels.data}
              columns={[
                { title: "Mã", dataIndex: "code" },
                { title: "Tên", dataIndex: "name" },
                { title: "Thứ tự", dataIndex: "rank" },
                {
                  title: "Đang dùng",
                  dataIndex: "active",
                  render: (v) => (v ? "Có" : "Không"),
                },
                {
                  title: "",
                  render: (_, l) => (
                    <Button
                      onClick={() => setForm({ level: true, editing: l })}
                    >
                      Sửa trình độ
                    </Button>
                  ),
                },
              ]}
              scroll={{ x: 600 }}
            />
          </>
        )}
      </Space>
      {form && (
        <CatalogForm
          key={(form.level ? "L" : "P") + String(form.editing?.id ?? "new")}
          level={form.level}
          editing={form.editing}
          programId={id}
          onClose={() => setForm(null)}
          onSaved={saved}
        />
      )}
    </Drawer>
  );
}
