import TableActions from '../TableActions';
import { useState } from "react";
import {
  Alert,
  App,
  Button,
  Descriptions,
  Drawer,
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
  assessmentService,
  programService,
} from "../../../services/placementService";
import { getErrorMessage } from "../../../utils/apiErrors";
import { displayDate } from "../../../utils/display";
import type { Assessment, AssessmentStatus } from "../../../types/placement";
import AssessmentForm from "./AssessmentForm";
const statusLabels: Record<AssessmentStatus, string> = {
  DRAFT: "Bản nháp",
  CONFIRMED: "Hiện hành đã xác nhận",
  SUPERSEDED: "Đã được thay thế",
  REVOKED: "Đã thu hồi",
};
function ActionForm({
  studentId,
  assessment,
  action,
  onClose,
  onSaved,
}: {
  studentId: number;
  assessment: Assessment;
  action: "confirm" | "revoke";
  onClose: () => void;
  onSaved: () => void;
}) {
  const current = useRemoteResource(assessmentService.current, {
    studentId,
    revision: assessment.version,
  });
  const previous = current.data?.find(
    (a) => a.programId === assessment.programId,
  );
  const [form] = Form.useForm<{ reason: string }>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const leave = useFormLeaveGuard(busy, onClose);
  return (
    <Modal
      open
      title={
        action === "confirm" ? "Xác nhận nguồn đánh giá" : "Thu hồi đánh giá"
      }
      okText={action === "confirm" ? "Xác nhận đánh giá" : "Thu hồi"}
      cancelText="Hủy"
      onOk={() => form.submit()}
      onCancel={leave.cancel}
      confirmLoading={busy}
      closable={!busy}
      maskClosable={!busy}
      okButtonProps={{ disabled: current.loading || !!current.error }}
      cancelButtonProps={{ disabled: busy }}
    >
      <Alert
        type={action === "confirm" ? "info" : "warning"}
        showIcon
        title={assessment.programCode + " · " + assessment.levelName}
        description={
          action === "confirm"
            ? previous
              ? "Sẽ thay thế kết quả hiện hành #" +
                previous.id +
                ". Bản cũ và chứng cứ được giữ nguyên."
              : "Chưa có kết quả hiện hành trong chương trình này."
            : "Thu hồi giữ nguyên lịch sử, không khôi phục bản đã được thay thế."
        }
      />
      {current.error && (
        <Alert
          type="error"
          title={current.error}
          action={<Button onClick={current.reload}>Thử lại</Button>}
        />
      )}{" "}
      {error && <Alert type="error" showIcon title={error} />}
      <Form
        name="assessmentDecision"
        form={form}
        layout="vertical"
        disabled={busy}
        onValuesChange={leave.changed}
        onFinish={async (v) => {
          if (busy) return;
          setBusy(true);
          try {
            await assessmentService.action(studentId, assessment.id, action, {
              version: assessment.version,
              reason: v.reason.trim(),
              expectedCurrentId: previous?.id ?? null,
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
          label="Lý do / nguồn đã xác minh"
          rules={[
            { required: true, whitespace: true },
            { min: 3, max: 500 },
          ]}
        >
          <Input.TextArea maxLength={500} rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
export default function StudentAssessments({
  studentId,
  legacyLevel,
}: {
  studentId: number;
  legacyLevel: string | null;
}) {
  const [query, setQuery] = useState<{
    page: number;
    size: number;
    programId?: number;
    status?: AssessmentStatus;
  }>({ page: 0, size: 10 });
  const [revision, setRevision] = useState(0);
  const list = useRemoteResource(assessmentService.list, {
    studentId,
    ...query,
  });
  const current = useRemoteResource(assessmentService.current, {
    studentId,
    revision,
  });
  const programs = useRemoteResource(programService.list, {});
  const [form, setForm] = useState<{
    editing: Assessment | null;
    copy?: Assessment;
  } | null>(null);
  const [decision, setDecision] = useState<{
    assessment: Assessment;
    action: "confirm" | "revoke";
  } | null>(null);
  const [historyId, setHistoryId] = useState<number | null>(null);
  const history = useRemoteResource(assessmentService.history, {
    studentId,
    id: historyId,
  });
  const [busy, setBusy] = useState(false);
  const { message } = App.useApp();
  function saved() {
    setForm(null);
    setDecision(null);
    list.reload();
    setRevision((v) => v + 1);
    message.success(
      "Đã lưu đánh giá; kiểm tra trạng thái hiện hành và lịch sử.",
    );
  }
  async function edit(
    a: Assessment,
    action: "edit" | "copy" | "confirm" | "revoke",
  ) {
    if (busy) return;
    setBusy(true);
    try {
      const fresh = await assessmentService.detail(studentId, a.id);
      if (action === "edit") setForm({ editing: fresh });
      else if (action === "copy") setForm({ editing: null, copy: fresh });
      else setDecision({ assessment: fresh, action });
    } catch (e) {
      message.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Space orientation="vertical" size={16} style={{ width: "100%" }}>
      <Alert
        showIcon
        type="info"
        title={
          "Trình độ text cũ (chưa xác minh): " + (legacyLevel || "chưa có")
        }
        description="Kết quả hiện hành được quản lý riêng theo từng chương trình. Bản nháp không có hiệu lực; không tự quy đổi điểm hoặc thay thông tin text cũ."
      />
      <Space wrap>
        <Button type="primary" onClick={() => setForm({ editing: null })}>
          Thêm đánh giá
        </Button>
        <Button
          onClick={() => {
            list.reload();
            setRevision((v) => v + 1);
          }}
        >
          Tải lại đánh giá
        </Button>
      </Space>
      {current.error && (
        <Alert
          type="error"
          title={current.error}
          action={<Button onClick={current.reload}>Thử lại</Button>}
        />
      )}
      <Typography.Title level={5}>Kết quả đầu vào hiện hành</Typography.Title>
      <Table<Assessment>
        size="small"
        rowKey="id"
        loading={current.loading}
        dataSource={current.data}
        pagination={false}
        scroll={{ x: 700 }}
        locale={{
          emptyText: current.error
            ? "Chưa tải được kết quả hiện hành"
            : "Chưa có đánh giá đã xác nhận",
        }}
        columns={[
          { title: "Chương trình", dataIndex: "programName" },
          { title: "Trình độ", dataIndex: "levelName" },
          {
            title: "Ngày đánh giá",
            dataIndex: "assessedOn",
            render: (v) => displayDate(v, false),
          },
          { title: "Người đánh giá", dataIndex: "assessorName" },
          { title: "Người xác nhận nguồn", dataIndex: "confirmedByName" },
        ]}
      />
      <Space wrap>
        <Select
          aria-label="Lọc chương trình đánh giá"
          placeholder="Tất cả chương trình"
          allowClear
          style={{ minWidth: 200 }}
          value={query.programId}
          options={programs.data?.map((p) => ({
            value: p.id,
            label: p.code + " · " + p.name,
          }))}
          onChange={(programId) =>
            setQuery((q) => ({ ...q, programId, page: 0 }))
          }
        />
        <Select
          aria-label="Lọc trạng thái đánh giá"
          placeholder="Tất cả trạng thái"
          allowClear
          style={{ minWidth: 200 }}
          value={query.status}
          options={Object.entries(statusLabels).map(([value, label]) => ({
            value,
            label,
          }))}
          onChange={(status) => setQuery((q) => ({ ...q, status, page: 0 }))}
        />
      </Space>
      {programs.error && <Alert type="error" title={programs.error} />}{" "}
      {list.error && (
        <Alert
          type="error"
          title={list.error}
          action={<Button onClick={list.reload}>Thử lại</Button>}
        />
      )}
      <Table<Assessment>
        rowKey="id"
        loading={list.loading}
        dataSource={list.data?.content}
        scroll={{ x: 1000 }}
        pagination={{
          current: query.page + 1,
          pageSize: query.size,
          total: list.data?.totalElements,
          showSizeChanger: true,
          onChange: (page, size) =>
            setQuery((q) => ({ ...q, page: page - 1, size })),
        }}
        columns={[
          { title: "Chương trình", dataIndex: "programCode" },
          { title: "Kết quả trình độ", dataIndex: "levelName" },
          {
            title: "Phương thức",
            dataIndex: "method",
            render: (m) =>
              ({
                TEST: "Bài kiểm tra",
                INTERVIEW: "Phỏng vấn",
                CERTIFICATE: "Chứng chỉ",
                OTHER: "Nguồn khác",
              })[m as string] ?? m,
          },
          {
            title: "Điểm",
            render: (_, a) =>
              a.score === null
                ? "Không dùng điểm"
                : a.score + " / " + a.maxScore,
          },
          {
            title: "Ngày đánh giá",
            dataIndex: "assessedOn",
            render: (v) => displayDate(v, false),
          },
          {
            title: "Trạng thái",
            dataIndex: "status",
            render: (s: AssessmentStatus) => (
              <Tag
                color={
                  s === "CONFIRMED"
                    ? "green"
                    : s === "REVOKED"
                      ? "red"
                      : s === "DRAFT"
                        ? "blue"
                        : "default"
                }
              >
                {statusLabels[s]}
              </Tag>
            ),
          },
          {
            title: "Thao tác",
            render: (_, a) => (
              <TableActions items={[
    ...((a.status === "DRAFT") ? ([
        {
            key: "action-1", label: "Sửa nháp", disabled: busy, onClick: () => void edit(a, "edit")
        },
        {
            key: "action-2", label: "Xác nhận", disabled: busy, onClick: () => void edit(a, "confirm")
        }
    ]) : []), ...((a.status === "CONFIRMED") ? ([
        {
            key: "action-3", label: "Tạo bản thay thế", disabled: busy, onClick: () => void edit(a, "copy")
        }
    ]) : []), ...(((a.status === "DRAFT" || a.status === "CONFIRMED")) ? ([
        {
            key: "action-4", label: "Thu hồi", disabled: busy, danger: true, onClick: () => void edit(a, "revoke")
        }
    ]) : [])
]}><Button onClick={() => setHistoryId(a.id)}>
                  Chi tiết / lịch sử
                </Button></TableActions>
            ),
          },
        ]}
        expandable={{
          expandedRowRender: (a) => (
            <Descriptions
              size="small"
              column={1}
              items={[
                { key: "source", label: "Căn cứ", children: a.source },
                {
                  key: "assessor",
                  label: "Người đánh giá",
                  children: a.assessorName,
                },
                {
                  key: "recorded",
                  label: "Người ghi nhận",
                  children: a.recordedByName,
                },
                {
                  key: "supersedes",
                  label: "Thay thế bản",
                  children: a.supersedesId ? "#" + a.supersedesId : "—",
                },
                {
                  key: "replacedBy",
                  label: "Được thay bởi",
                  children: a.supersededById ? "#" + a.supersededById : "—",
                },
              ]}
            />
          ),
        }}
      />
      <Drawer
        open={historyId !== null}
        width={900}
        title="Lịch sử đánh giá đầu vào"
        onClose={() => setHistoryId(null)}
      >
        {history.error && <Alert type="error" title={history.error} />}
        <Table
          rowKey="id"
          dataSource={history.data}
          loading={history.loading}
          scroll={{ x: 650 }}
          columns={[
            {
              title: "Thao tác",
              dataIndex: "action",
              render: (a: string) =>
                ({
                  DRAFT_CREATED: "Tạo nháp",
                  DRAFT_UPDATED: "Sửa nháp",
                  CONFIRMED: "Xác nhận",
                  SUPERSEDED: "Được thay thế",
                  REVOKED: "Thu hồi",
                })[a] ?? a,
            },
            { title: "Người thực hiện", dataIndex: "actorName" },
            { title: "Lý do", dataIndex: "reason" },
            {
              title: "Thời điểm",
              dataIndex: "occurredAt",
              render: (v) => displayDate(v),
            },
          ]}
          expandable={{
            expandedRowRender: (e) => (
              <>
                <Typography.Paragraph style={{ whiteSpace: "pre-wrap" }}>
                  Trước: {e.beforeState || "Chưa có"}
                </Typography.Paragraph>
                <Typography.Paragraph style={{ whiteSpace: "pre-wrap" }}>
                  Sau: {e.afterState}
                </Typography.Paragraph>
              </>
            ),
          }}
        />
      </Drawer>
      {form && (
        <AssessmentForm
          studentId={studentId}
          editing={form.editing}
          copy={form.copy}
          onClose={() => setForm(null)}
          onSaved={saved}
        />
      )}{" "}
      {decision && (
        <ActionForm
          studentId={studentId}
          assessment={decision.assessment}
          action={decision.action}
          onClose={() => setDecision(null)}
          onSaved={saved}
        />
      )}
    </Space>
  );
}
