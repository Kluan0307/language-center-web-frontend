import { useState } from "react";
import {
  Alert,
  App,
  Button,
  Descriptions,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { useRemoteResource } from "../../../hooks/useRemoteResource";
import { useFormLeaveGuard } from "../../../hooks/useFormLeaveGuard";
import {
  admissionService,
  programService,
} from "../../../services/placementService";
import { getErrorMessage, applyFormErrors } from "../../../utils/apiErrors";
import { displayDate } from "../../../utils/display";
import type {
  AdmissionPolicy,
  CourseAdmission,
  AdmissionConfirm,
  ClassAdmission,
} from "../../../types/placement";
export function PolicyDescription({ policy }: { policy: AdmissionPolicy }) {
  return policy.mode === "UNVERIFIED" ? (
    <Alert
      type="warning"
      showIcon
      title="Chưa xác minh điều kiện đầu vào"
      description="Vui lòng xác nhận chương trình và điều kiện đầu vào trước khi sử dụng."
    />
  ) : (
    <Descriptions
      bordered
      size="small"
      column={1}
      items={[
        {
          key: "revision",
          label: "Phiên bản điều kiện khóa",
          children: policy.revision,
        },
        {
          key: "program",
          label: "Chương trình",
          children: policy.programCode + " · " + policy.programName,
        },
        {
          key: "mode",
          label: "Đầu vào",
          children:
            policy.mode === "OPEN_ENTRY"
              ? "Không yêu cầu đánh giá đầu vào (đã xác nhận)"
              : "Cần đánh giá đầu vào",
        },
        {
          key: "levels",
          label: "Trình độ đầu vào được chấp nhận",
          children: policy.acceptedLevels.length
            ? policy.acceptedLevels
                .map((l) => l.code + " · " + l.name)
                .join("; ")
            : "Không yêu cầu",
        },
        {
          key: "output",
          label: "Mục tiêu đầu ra",
          children: policy.outputLevel
            ? policy.outputLevel.code + " · " + policy.outputLevel.name
            : "—",
        },
        {
          key: "actor",
          label: "Người xác nhận",
          children: policy.confirmedByName,
        },
        {
          key: "date",
          label: "Thời điểm",
          children: displayDate(policy.confirmedAt),
        },
        { key: "reason", label: "Lý do / căn cứ", children: policy.reason },
      ]}
    />
  );
}
function PolicyForm({
  id,
  view,
  onClose,
  onSaved,
}: {
  id: number;
  view: CourseAdmission;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form] = Form.useForm<AdmissionConfirm>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const leave = useFormLeaveGuard(busy, onClose);
  const programs = useRemoteResource(programService.list, {});
  const programId = Form.useWatch("programId", form) as number | undefined;
  const mode = Form.useWatch("mode", form);
  const levels = useRemoteResource(programService.levels, {
    id: programId ?? null,
  });
  async function save(v: AdmissionConfirm) {
    if (busy) return;
    setBusy(true);
    setError(undefined);
    try {
      await admissionService.confirm(id, {
        ...v,
        expectedRevision: view.policy.revision,
        acceptedLevelIds:
          v.mode === "OPEN_ENTRY" ? [] : (v.acceptedLevelIds ?? []),
        reason: v.reason.trim(),
      });
      onSaved();
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
      title="Xác minh đầu vào và đầu ra khóa học"
      width={760}
      okText="Xác nhận điều kiện"
      cancelText="Hủy"
      onCancel={leave.cancel}
      onOk={() => form.submit()}
      confirmLoading={busy}
      closable={!busy}
      maskClosable={!busy}
      cancelButtonProps={{ disabled: busy }}
    >
      <Alert
        showIcon
        type="info"
        title="Chọn riêng trình độ đầu vào được chấp nhận và trình độ đầu ra của khóa học."
        description="Điều kiện mới áp dụng cho các lớp mở sau khi xác nhận."
      />
      {error && <Alert type="error" showIcon title={error} />}{" "}
      {(programs.error || levels.error) && (
        <Alert
          type="error"
          title={programs.error ?? levels.error}
          action={
            <Button
              onClick={() => {
                programs.reload();
                levels.reload();
              }}
            >
              Thử lại
            </Button>
          }
        />
      )}
      <Form
        name="courseAdmission"
        form={form}
        layout="vertical"
        disabled={busy}
        initialValues={{
          programId: view.policy.programId ?? undefined,
          mode:
            view.policy.mode === "UNVERIFIED"
              ? "REQUIRES_ASSESSMENT"
              : view.policy.mode,
          outputLevelId: view.policy.outputLevel?.levelId,
          acceptedLevelIds: view.policy.acceptedLevels.map((l) => l.levelId),
        }}
        onValuesChange={(changed) => {
          leave.changed();
          if ("programId" in changed)
            form.setFieldsValue({
              outputLevelId: undefined,
              acceptedLevelIds: [],
            });
          if (changed.mode === "OPEN_ENTRY")
            form.setFieldValue("acceptedLevelIds", []);
        }}
        onFinish={save}
      >
        <Form.Item
          name="programId"
          label="Chương trình"
          rules={[{ required: true, message: "Chọn chương trình." }]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            loading={programs.loading}
            options={programs.data?.map((p) => ({
              value: p.id,
              label: p.code + " · " + p.name,
              disabled: !p.active,
            }))}
          />
        </Form.Item>
        <Form.Item
          name="mode"
          label="Yêu cầu đầu vào"
          rules={[{ required: true }]}
        >
          <Select
            options={[
              { value: "OPEN_ENTRY", label: "Không yêu cầu đánh giá đầu vào" },
              {
                value: "REQUIRES_ASSESSMENT",
                label: "Cần đánh giá và trình độ phù hợp",
              },
            ]}
          />
        </Form.Item>
        <Form.Item
          name="acceptedLevelIds"
          label="Các mức đầu vào được chấp nhận"
          rules={
            mode === "REQUIRES_ASSESSMENT"
              ? [
                  {
                    required: true,
                    type: "array",
                    min: 1,
                    message: "Chọn ít nhất một mức đầu vào.",
                  },
                ]
              : []
          }
        >
          <Select
            mode="multiple"
            disabled={!programId || mode === "OPEN_ENTRY"}
            showSearch
            optionFilterProp="label"
            loading={levels.loading}
            options={levels.data
              ?.filter((l) => l.active)
              .map((l) => ({ value: l.id, label: l.code + " · " + l.name }))}
          />
        </Form.Item>
        <Form.Item
          name="outputLevelId"
          label="Mục tiêu đầu ra"
          rules={[{ required: true, message: "Chọn đầu ra của khóa." }]}
        >
          <Select
            disabled={!programId}
            loading={levels.loading}
            showSearch
            optionFilterProp="label"
            options={levels.data
              ?.filter((l) => l.active)
              .map((l) => ({ value: l.id, label: l.code + " · " + l.name }))}
          />
        </Form.Item>
        <Form.Item
          name="reason"
          label="Lý do / nguồn đối chiếu"
          rules={[
            { required: true, whitespace: true },
            { min: 3, max: 500 },
          ]}
        >
          <Input.TextArea maxLength={500} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
export function CourseAdmissionPanel({ id }: { id: number }) {
  const view = useRemoteResource(admissionService.course, { id });
  const history = useRemoteResource(admissionService.courseHistory, {
    id,
    revision: view.data?.policy.revision,
  });
  const [editing, setEditing] = useState(false);
  const { message } = App.useApp();
  return (
    <Space orientation="vertical" style={{ width: "100%" }}>
      <Typography.Title level={5}>
        Điều kiện đầu vào và mục tiêu đầu ra
      </Typography.Title>
      {view.error && (
        <Alert
          type="error"
          title={view.error}
          action={<Button onClick={view.reload}>Thử lại</Button>}
        />
      )}{" "}
      {view.loading && <Typography.Text>Đang tải điều kiện…</Typography.Text>}
      {view.data && (
        <>
          <PolicyDescription policy={view.data.policy} />
          {view.data.policy.mode === "UNVERIFIED" && (
            <Typography.Paragraph type="secondary">
              Thông tin tham khảo: {view.data.legacyType || "—"} /{" "}
              {view.data.legacyLevel || "—"} /{" "}
              {view.data.legacyEntryRequirement || "—"}
            </Typography.Paragraph>
          )}
          {view.data.canManage && (
            <Button onClick={() => setEditing(true)}>
              Xác minh / cập nhật điều kiện
            </Button>
          )}
          {history.error && <Alert type="error" title={history.error} />}
          <Table<AdmissionPolicy>
            rowKey={(p) => p.id!}
            size="small"
            loading={history.loading}
            dataSource={history.data}
            scroll={{ x: 600 }}
            columns={[
              { title: "Phiên bản", dataIndex: "revision" },
              { title: "Chương trình", dataIndex: "programName" },
              { title: "Người xác nhận", dataIndex: "confirmedByName" },
              {
                title: "Thời điểm",
                dataIndex: "confirmedAt",
                render: (v) => displayDate(v),
              },
            ]}
            expandable={{
              expandedRowRender: (p) => <PolicyDescription policy={p} />,
            }}
          />
          {editing && (
            <PolicyForm
              key={view.data.policy.revision}
              id={id}
              view={view.data}
              onClose={() => setEditing(false)}
              onSaved={() => {
                setEditing(false);
                view.reload();
                history.reload();
                message.success(
                  "Đã cập nhật điều kiện đầu vào.",
                );
              }}
            />
          )}
        </>
      )}
    </Space>
  );
}
function ApplyForm({
  binding,
  courseRevision,
  onClose,
  onSaved,
}: {
  binding: ClassAdmission;
  courseRevision: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form] = Form.useForm<{ reason: string }>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const leave = useFormLeaveGuard(busy, onClose);
  return (
    <Modal
      open
      title="Áp dụng điều kiện khóa mới cho lớp"
      okText="Áp dụng cho lớp"
      cancelText="Hủy"
      onOk={() => form.submit()}
      onCancel={leave.cancel}
      confirmLoading={busy}
      closable={!busy}
      maskClosable={!busy}
    >
      <Alert
        type="warning"
        showIcon
        title="Thay điều kiện cho các quyết định phân lớp tiếp theo"
        description="Không ghi lại điều kiện của các đăng ký đã phát sinh. Kiểm tra lịch sử và lý do trước khi xác nhận."
      />
      {error && <Alert type="error" title={error} />}
      <Form
        name="classAdmission"
        form={form}
        layout="vertical"
        disabled={busy}
        onValuesChange={leave.changed}
        onFinish={async (v) => {
          if (busy) return;
          setBusy(true);
          try {
            await admissionService.applyClass(binding.classId, {
              expectedRevision: binding.revision,
              expectedCourseRevision: courseRevision,
              reason: v.reason.trim(),
            });
            onSaved();
          } catch (e) {
            setError(getErrorMessage(e));
          } finally {
            setBusy(false);
          }
        }}
      >
        <Form.Item
          name="reason"
          label="Lý do áp dụng"
          rules={[
            { required: true, whitespace: true },
            { min: 3, max: 500 },
          ]}
        >
          <Input.TextArea maxLength={500} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
export function ClassAdmissionPanel({
  id,
  courseId,
}: {
  id: number;
  courseId: number;
}) {
  const binding = useRemoteResource(admissionService.schoolClass, { id });
  const course = useRemoteResource(admissionService.course, { id: courseId });
  const history = useRemoteResource(admissionService.classHistory, {
    id,
    revision: binding.data?.revision ?? -1,
  });
  const [open, setOpen] = useState(false);
  return (
    <Space orientation="vertical" style={{ width: "100%" }}>
      <Alert
        type="info"
        title="Lớp giữ bản điều kiện tại lúc mở hoặc lúc quản lý áp dụng."
        description="Sửa khóa học không tự cập nhật lớp này."
      />
      {binding.error && (
        <Alert
          type="error"
          title={binding.error}
          action={<Button onClick={binding.reload}>Thử lại</Button>}
        />
      )}{" "}
      {binding.data && (
        <>
          <Tag>Phiên bản áp dụng cho lớp: {binding.data.revision}</Tag>
          <PolicyDescription policy={binding.data.policy} />
          {course.data && (
            <Typography.Paragraph>
              Phiên bản mới nhất của khóa: {course.data.policy.revision}{" "}
              {binding.data.policy.id !== course.data.policy.id
                ? "— khác bản lớp đang dùng"
                : ""}
            </Typography.Paragraph>
          )}
          {course.error && (
            <Alert
              type="error"
              title={course.error}
              action={<Button onClick={course.reload}>Thử lại</Button>}
            />
          )}{" "}
          {binding.data.canManage && (
            <Button
              disabled={
                !course.data?.policy.id ||
                course.data.policy.id === binding.data.policy.id
              }
              onClick={() => setOpen(true)}
            >
              Áp dụng điều kiện khóa mới
            </Button>
          )}
          <Table
            rowKey="id"
            size="small"
            loading={history.loading}
            dataSource={history.data}
            scroll={{ x: 600 }}
            columns={[
              { title: "Lần áp dụng", dataIndex: "revision" },
              { title: "Người thực hiện", dataIndex: "actorName" },
              { title: "Lý do", dataIndex: "reason" },
              {
                title: "Thời điểm",
                dataIndex: "occurredAt",
                render: (v) => displayDate(v),
              },
            ]}
          />
          {history.error && <Alert type="error" title={history.error} />}{" "}
          {open && course.data && (
            <ApplyForm
              binding={binding.data}
              courseRevision={course.data.policy.revision}
              onClose={() => setOpen(false)}
              onSaved={() => {
                setOpen(false);
                binding.reload();
                course.reload();
                history.reload();
              }}
            />
          )}
        </>
      )}
    </Space>
  );
}
