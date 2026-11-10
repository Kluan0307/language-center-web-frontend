import { useCallback, useEffect, useState } from "react";
import {
  Alert,
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
import { useNavigate } from "react-router-dom";
import { useRemoteResource } from "../../../hooks/useRemoteResource";
import { useAuth } from "../../../hooks/useAuth";
import { useFormLeaveGuard } from "../../../hooks/useFormLeaveGuard";
import { getErrorMessage } from "../../../utils/apiErrors";
import { displayDate } from "../../../utils/display";
import { placementGate } from "../../../services/enrollmentPlacementService";
import type {
  PlacementContext,
  PlacementException,
  PlacementPreview,
} from "../../../services/enrollmentPlacementService";
import { PolicyDescription } from "./AdmissionPanel";
export interface GateState {
  allowed: boolean;
  approvalId?: number;
}
const academic: Record<string, string> = {
  ELIGIBLE: "Phù hợp",
  REUSED_ACCEPTANCE: "Giữ căn cứ đã chấp nhận",
  UNVERIFIED_POLICY: "Điều kiện lớp chưa xác minh",
  MISSING_ASSESSMENT: "Thiếu đánh giá hiện hành",
  PROGRAM_MISMATCH: "Chưa có đánh giá đúng chương trình",
  LEVEL_MISMATCH: "Trình độ không thuộc tập đầu vào",
};
const states: Record<string, string> = {
  REQUESTED: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  INVALIDATED: "Hết hiệu lực",
  CONSUMED: "Đã sử dụng",
};
function ReasonDialog({
  title,
  onClose,
  save,
}: {
  title: string;
  onClose: () => void;
  save: (reason: string) => Promise<void>;
}) {
  const [form] = Form.useForm<{ reason: string }>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const leave = useFormLeaveGuard(busy, onClose);
  return (
    <Modal
      open
      title={title}
      okText="Xác nhận xử lý"
      cancelText="Hủy"
      onCancel={leave.cancel}
      onOk={() => form.submit()}
      confirmLoading={busy}
      closable={!busy}
      maskClosable={!busy}
      cancelButtonProps={{ disabled: busy }}
    >
      {error && <Alert type="error" title={error} />}
      <Form
        name="placementReason"
        form={form}
        layout="vertical"
        onValuesChange={leave.changed}
        disabled={busy}
        onFinish={async (v) => {
          setBusy(true);
          try {
            await save(v.reason.trim());
            onClose();
          } catch (e) {
            setError(getErrorMessage(e));
          } finally {
            setBusy(false);
          }
        }}
      >
        <Form.Item
          name="reason"
          label="Lý do và căn cứ"
          rules={[{ required: true, whitespace: true, min: 3, max: 500 }]}
        >
          <Input.TextArea rows={3} maxLength={500} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
export function ExceptionList({
  studentId,
  classId,
  context,
  onChanged,
}: {
  studentId?: number;
  classId?: number;
  context?: PlacementContext;
  onChanged?: () => void;
}) {
  const [page, setPage] = useState(0);
  const list = useRemoteResource(placementGate.list, {
    studentId,
    classId,
    page,
    size: 10,
  });
  const [decision, setDecision] = useState<{
    record: PlacementException;
    approve: boolean;
  } | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const manager = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const reload = () => {
    list.reload();
    onChanged?.();
  };
  return (
    <Space orientation="vertical" style={{ width: "100%" }}>
      <Button onClick={reload}>Tải lại đề nghị ngoại lệ</Button>
      {list.error && <Alert type="error" title={list.error} />}
      <Table<PlacementException>
        rowKey="id"
        size="small"
        loading={list.loading}
        dataSource={list.data?.content.filter(
          (a) =>
            !context ||
            (a.context.intent === context.intent &&
              a.context.sourceEnrollmentId === context.sourceEnrollmentId),
        )}
        scroll={{ x: 850 }}
        pagination={{
          current: page + 1,
          pageSize: 10,
          total: list.data?.totalElements,
          onChange: (p) => setPage(p - 1),
        }}
        columns={[
          { title: "Mã", dataIndex: "id" },
          {
            title: "Học viên / lớp",
            render: (_, a) =>
              a.studentName + " · " + a.classCode + " · " + a.context.intent,
          },
          {
            title: "Trạng thái",
            dataIndex: "status",
            render: (s) => (
              <Tag
                color={
                  s === "APPROVED"
                    ? "green"
                    : s === "INVALIDATED"
                      ? "orange"
                      : s === "REJECTED"
                        ? "red"
                        : "blue"
                }
              >
                {states[s] ?? s}
              </Tag>
            ),
          },
          { title: "Lý do đề nghị", dataIndex: "requestedReason" },
          { title: "Người đề nghị", dataIndex: "requestedByName" },
          {
            title: "Quyết định",
            render: (_, a) => (
              <>
                {a.decisionReason}
                <div>
                  {a.decidedByName} · {displayDate(a.decidedAt)}
                </div>
              </>
            ),
          },
          {
            title: "Xử lý",
            render: (_, a) => (
              <Space wrap>
                {manager && a.status === "REQUESTED" && (
                  <>
                    <Button
                      onClick={() => setDecision({ record: a, approve: true })}
                    >
                      Duyệt
                    </Button>
                    <Button
                      danger
                      onClick={() => setDecision({ record: a, approve: false })}
                    >
                      Từ chối
                    </Button>
                  </>
                )}
                {a.consumedEnrollmentId && (
                  <Button
                    onClick={() =>
                      navigate(
                        "/enrollment?enrollmentId=" + a.consumedEnrollmentId,
                      )
                    }
                  >
                    Mở đăng ký #{a.consumedEnrollmentId}
                  </Button>
                )}
              </Space>
            ),
          },
        ]}
        expandable={{
          expandedRowRender: (a) => (
            <Descriptions
              column={1}
              items={[
                {
                  key: "context",
                  label: "Căn cứ",
                  children: academic[a.academicStatus] ?? a.academicStatus,
                },
                {
                  key: "time",
                  label: "Đề nghị lúc",
                  children: displayDate(a.requestedAt),
                },
                {
                  key: "fingerprint",
                  label: "Kiểm soát thay đổi",
                  children:
                    "Căn cứ và phiên bản được kiểm tra lại khi duyệt và sử dụng.",
                },
              ]}
            />
          ),
        }}
      />
      {decision && (
        <ReasonDialog
          title={
            decision.approve ? "Duyệt ngoại lệ đầu vào" : "Từ chối ngoại lệ"
          }
          onClose={() => setDecision(null)}
          save={async (reason) => {
            await placementGate.decide(
              decision.record.id,
              decision.record.version,
              decision.approve,
              reason,
            );
            reload();
          }}
        />
      )}
    </Space>
  );
}
export default function EnrollmentPlacement({
  context,
  onState,
}: {
  context: PlacementContext;
  onState: (state: GateState) => void;
}) {
  const preview = useRemoteResource(placementGate.preview, { context });
  const list = useRemoteResource(placementGate.list, {
    studentId: context.studentId,
    classId: context.classId,
    page: 0,
    size: 200,
  });
  const [approvalId, setApprovalId] = useState<number>();
  const [request, setRequest] = useState(false);
  const p = preview.data;
  const valid =
    list.data?.content.filter(
      (a) =>
        a.status === "APPROVED" &&
        a.fingerprint === p?.fingerprint &&
        a.context.intent === context.intent &&
        a.context.sourceEnrollmentId === context.sourceEnrollmentId,
    ) ?? [];
  const selected = valid.some((a) => a.id === approvalId)
    ? approvalId
    : undefined;
  const allowed =
    !!p &&
    !preview.loading &&
    !preview.error &&
    (p.eligible ||
      (!p.blockers.length &&
        selected !== undefined &&
        !list.loading &&
        !list.error));
  useEffect(() => {
    onState({ allowed, approvalId: selected });
  }, [allowed, selected, onState]);
  const reloadPreview = preview.reload,
    reloadList = list.reload;
  const refresh = useCallback(() => {
    reloadPreview();
    reloadList();
  }, [reloadPreview, reloadList]);
  return (
    <Space
      orientation="vertical"
      size={12}
      style={{ width: "100%", marginTop: 16 }}
    >
      <Typography.Title level={5}>Kiểm tra phù hợp đầu vào</Typography.Title>
      <Button onClick={refresh} loading={preview.loading}>
        Kiểm tra lại điều kiện
      </Button>
      {preview.error && <Alert type="error" title={preview.error} />}{" "}
      {p && (
        <>
          <Alert
            showIcon
            type={
              p.eligible ? "success" : p.blockers.length ? "error" : "warning"
            }
            title={academic[p.academicStatus] ?? p.academicStatus}
            description={
              <>
                {p.blockers.map((b) => (
                  <div key={b.code}>{b.message}</div>
                ))}
                <div>
                  Sĩ số {p.currentSize}/{p.maxSize}. Kết quả xem trước không giữ
                  chỗ; hệ thống kiểm tra lại khi lưu.
                </div>
              </>
            }
          />
          <Descriptions
            size="small"
            column={1}
            items={[
              {
                key: "current",
                label: "Đánh giá hiện hành đúng chương trình",
                children: p.assessment
                  ? p.assessment.programName +
                    " · " +
                    p.assessment.levelName +
                    " · " +
                    displayDate(p.assessment.assessedOn, false)
                  : "Chưa có",
              },
              {
                key: "legacy",
                label: "Text cũ (tham khảo)",
                children: p.legacyLevel || "—",
              },
              {
                key: "reuse",
                label: "Căn cứ học lại",
                children: p.reusedDecisionId
                  ? "Giữ quyết định đã chấp nhận #" + p.reusedDecisionId
                  : "Xét theo điều kiện lớp hiện tại",
              },
            ]}
          />
          <PolicyDescription policy={p.policy} />
          {list.error && <Alert type="error" title={list.error} />}{" "}
          {p.canRequestException && (
            <>
              <Alert
                type="info"
                title="Chỉ quản lý duyệt ngoại lệ học thuật. Xác nhận không giữ chỗ và không bỏ qua lịch, sĩ số hoặc quyền."
              />
              <Select
                aria-label="Chọn xác nhận ngoại lệ"
                placeholder="Chọn xác nhận đã được quản lý duyệt"
                allowClear
                value={selected}
                onChange={setApprovalId}
                style={{ width: "100%" }}
                options={valid.map((a) => ({
                  value: a.id,
                  label: "#" + a.id + " · " + a.decisionReason,
                }))}
              />
              <Button onClick={() => setRequest(true)}>
                Đề nghị ngoại lệ đầu vào
              </Button>
            </>
          )}
          <ExceptionList
            studentId={context.studentId}
            classId={context.classId}
            context={context}
            onChanged={refresh}
          />
        </>
      )}
      {request && p && (
        <ReasonDialog
          title="Đề nghị ngoại lệ đầu vào"
          onClose={() => setRequest(false)}
          save={async (reason) => {
            await placementGate.request(context, p.fingerprint, reason);
            refresh();
          }}
        />
      )}
    </Space>
  );
}
export function PlacementSuggestions({
  studentId,
  onChoose,
}: {
  studentId: number;
  onChoose: (id: number) => void;
}) {
  const [page, setPage] = useState(0);
  const list = useRemoteResource(placementGate.suggestions, {
    studentId,
    page,
  });
  return (
    <>
      <Typography.Title level={5}>
        Lớp và mức phù hợp trong chi nhánh
      </Typography.Title>
      {list.error && <Alert type="error" title={list.error} />}
      <Table<PlacementPreview>
        size="small"
        rowKey={(p) => p.context.classId}
        loading={list.loading}
        dataSource={list.data?.content}
        scroll={{ x: 700 }}
        pagination={{
          current: page + 1,
          pageSize: 5,
          total: list.data?.totalElements,
          onChange: (p) => setPage(p - 1),
        }}
        columns={[
          { title: "Lớp", dataIndex: "classCode" },
          { title: "Sĩ số", render: (_, p) => p.currentSize + "/" + p.maxSize },
          {
            title: "Kết quả",
            render: (_, p) => (
              <>
                <Tag color={p.eligible ? "green" : "orange"}>
                  {academic[p.academicStatus]}
                </Tag>
                {p.blockers.map((b) => (
                  <div key={b.code}>{b.message}</div>
                ))}
              </>
            ),
          },
          {
            title: "",
            render: (_, p) => (
              <Button onClick={() => onChoose(p.context.classId)}>
                Xem điều kiện
              </Button>
            ),
          },
        ]}
      />
    </>
  );
}
export function EnrollmentAdmissionHistory({
  id,
  version,
}: {
  id: number;
  version: number;
}) {
  const history = useRemoteResource(placementGate.history, { id, version });
  return (
    <>
      <Typography.Title level={5}>Căn cứ chấp nhận đầu vào</Typography.Title>
      {history.error && <Alert type="error" title={history.error} />}
      <Table
        rowKey="id"
        size="small"
        loading={history.loading}
        dataSource={history.data}
        scroll={{ x: 650 }}
        locale={{
          emptyText: history.error
            ? "Chưa tải được căn cứ"
            : "LEGACY_UNVERIFIED — đăng ký cũ chưa có snapshot căn cứ",
        }}
        columns={[
          { title: "Thao tác", dataIndex: "intent" },
          { title: "Cách chấp nhận", dataIndex: "academicStatus" },
          { title: "Xác nhận ngoại lệ", dataIndex: "approvalId" },
          { title: "Người thực hiện", dataIndex: "actorName" },
          {
            title: "Thời điểm",
            dataIndex: "acceptedAt",
            render: (v) => displayDate(v),
          },
        ]}
        expandable={{
          expandedRowRender: (a) => (
            <>
              <Typography.Paragraph style={{ whiteSpace: "pre-wrap" }}>
                Điều kiện: {a.policySnapshot}
              </Typography.Paragraph>
              <Typography.Paragraph style={{ whiteSpace: "pre-wrap" }}>
                Đánh giá: {a.assessmentSnapshot}
              </Typography.Paragraph>
            </>
          ),
        }}
      />
    </>
  );
}
