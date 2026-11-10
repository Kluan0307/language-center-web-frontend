import { useState } from "react";
import {
  Alert,
  Button,
  Descriptions,
  Drawer,
  Form,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useRemoteResource } from "../../../hooks/useRemoteResource";
import { useFormLeaveGuard } from "../../../hooks/useFormLeaveGuard";
import { finalResultService } from "../../../services/finalResultService";
import { evaluationService } from "../../../services/evaluationService";
import { LoadError } from "../Academic";
import { getErrorMessage } from "../../../utils/apiErrors";
import { displayDate } from "../../../utils/display";
const labels = { PASS: "Đạt", FAIL: "Chưa đạt" };
function SnapshotView({ snapshot }: { snapshot: string }) {
  let data: import("../../../services/finalResultService").FinalPreview;
  try {
    data = JSON.parse(snapshot);
  } catch {
    return (
      <Alert
        type="error"
        title="Không đọc được bằng chứng đã lưu; liên hệ quản lý để đối soát."
      />
    );
  }
  const r = data.evaluation;
  return (
    <Space orientation="vertical" style={{ width: "100%" }}>
      <Descriptions
        column={1}
        items={[
          { key: "student", label: "Học viên", children: r.studentName },
          {
            key: "policy",
            label: "Quy tắc đã dùng",
            children: data.policy
              ? "v" +
                data.policy.revision +
                " · Ngưỡng " +
                data.policy.passPercent +
                "%"
              : "Không có snapshot quy tắc trong phiên bản cũ",
          },
          {
            key: "score",
            label: "Điểm tổng hợp (%)",
            children: r.averagePercent ?? "Chưa xác định",
          },
          {
            key: "attendance",
            label: "Chuyên cần (%)",
            children: r.attendance.percent ?? "Không yêu cầu / chưa xác định",
          },
          {
            key: "minutes",
            label: "Phút đã học / kế hoạch",
            children:
              (data.duration?.taughtMinutes ?? "Chưa xác minh") +
              " / " +
              (data.duration?.expectedMinutes ?? "Chưa xác minh"),
          },
        ]}
      />
      <Table
        rowKey="examId"
        size="small"
        pagination={false}
        scroll={{ x: 550 }}
        dataSource={r.exams}
        columns={[
          { title: "Bài", dataIndex: "examName" },
          {
            title: "Điểm",
            render: (_, x) => (x.score ?? "Chưa chấm") + " / " + x.maxScore,
          },
          { title: "Trọng số", dataIndex: "weight" },
          {
            title: "Bắt buộc",
            dataIndex: "required",
            render: (v) => (v ? "Có" : "Không"),
          },
        ]}
      />
    </Space>
  );
}
function ConfirmResult({
  classId,
  enrollmentId,
  onClose,
  onSaved,
}: {
  classId: number;
  enrollmentId: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const preview = useRemoteResource(finalResultService.preview, {
    classId,
    enrollmentId,
  });
  const [form] = Form.useForm<{ reason: string }>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [intent] = useState(() => crypto.randomUUID());
  const leave = useFormLeaveGuard(busy, onClose);
  const p = preview.data;
  return (
    <Modal
      open
      title="Xem trước kết quả chính thức"
      okText="Chốt kết quả"
      cancelText="Đóng"
      onCancel={leave.cancel}
      confirmLoading={busy}
      closable={!busy}
      maskClosable={false}
      cancelButtonProps={{ disabled: busy }}
      okButtonProps={{ disabled: !p || p.blockers.length > 0 || busy }}
      onOk={() => form.submit()}
    >
      <LoadError error={preview.error} reload={preview.reload} />
      {error && <Alert type="error" title={error} showIcon />}
      {p && (
        <>
          <Descriptions
            column={1}
            items={[
              {
                key: "student",
                label: "Học viên",
                children: p.evaluation.studentName,
              },
              {
                key: "outcome",
                label: "Kết luận",
                children:
                  p.evaluation.status === "INSUFFICIENT"
                    ? "Chưa đủ dữ liệu"
                    : labels[p.evaluation.status as keyof typeof labels],
              },
              {
                key: "average",
                label: "Điểm tổng hợp (%)",
                children: p.evaluation.averagePercent ?? "Chưa xác định",
              },
              {
                key: "attendance",
                label: "Chuyên cần (%)",
                children: p.evaluation.attendance.percent ?? "Chưa xác định",
              },
            ]}
          />
          {p.blockers.map((v) => (
            <Alert key={v} type="warning" title={v} showIcon />
          ))}
          <Alert
            type="info"
            title="Chốt lưu ảnh chụp kết quả và khóa nguồn toàn lớp. Hoàn thành đăng ký là bước đồng bộ riêng, không tự thay đổi học phí."
            showIcon
          />
          <Form
            form={form}
            layout="vertical"
            disabled={busy}
            onValuesChange={leave.changed}
            onFinish={async (values) => {
              if (busy || !p) return;
              setBusy(true);
              setError(undefined);
              try {
                await finalResultService.confirm(classId, enrollmentId, {
                  requestId: intent,
                  fingerprint: p.fingerprint,
                  reason: values.reason.trim(),
                });
                onSaved();
              } catch (e) {
                try {
                  const recovered = await finalResultService.request(
                    classId,
                    intent,
                  );
                  if (recovered.enrollmentId === enrollmentId) {
                    onSaved();
                    return;
                  }
                } catch {
                  /* Original error remains visible if no intent was committed. */
                }
                setError(
                  getErrorMessage(e) +
                    " Có thể tải lại danh sách để kiểm tra kết quả; gửi lại giữ nguyên mã yêu cầu.",
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            <Form.Item
              name="reason"
              label="Lý do chốt"
              rules={[{ required: true, min: 3, max: 500, whitespace: true }]}
            >
              <Input.TextArea maxLength={500} />
            </Form.Item>
          </Form>
        </>
      )}
    </Modal>
  );
}
export function ResultReasonModal({
  title,
  onClose,
  onSubmit,
}: {
  title: string;
  onClose: () => void;
  onSubmit: (reason: string, requestId: string) => Promise<void>;
}) {
  const [form] = Form.useForm<{ reason: string }>();
  const [intent] = useState(() => crypto.randomUUID());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const leave = useFormLeaveGuard(busy, onClose);
  return (
    <Modal
      open
      title={title}
      okText="Xác nhận"
      cancelText="Hủy"
      onCancel={leave.cancel}
      onOk={() => form.submit()}
      confirmLoading={busy}
      closable={!busy}
      maskClosable={false}
      cancelButtonProps={{ disabled: busy }}
    >
      {error && <Alert type="error" title={error} showIcon />}
      <Form
        form={form}
        layout="vertical"
        onValuesChange={leave.changed}
        disabled={busy}
        onFinish={async (v) => {
          if (busy) return;
          setBusy(true);
          setError(undefined);
          try {
            await onSubmit(v.reason.trim(), intent);
          } catch (e) {
            setError(getErrorMessage(e));
          } finally {
            setBusy(false);
          }
        }}
      >
        <Form.Item
          name="reason"
          label="Lý do"
          rules={[{ required: true, min: 3, max: 500, whitespace: true }]}
        >
          <Input.TextArea maxLength={500} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
export default function FinalResultPanel({
  classId,
  revision = 0,
}: {
  classId: number;
  revision?: number;
}) {
  const { user } = useAuth();
  const manager = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const [params] = useSearchParams();
  const focused = Number(params.get("enrollmentId"));
  const report = useRemoteResource(evaluationService.preview, {
    classId,
    revision,
    enabled: true,
  });
  const finals = useRemoteResource(finalResultService.list, {
    classId,
    revision,
  });
  const [confirm, setConfirm] = useState<number | null>(null);
  const [historyId, setHistoryId] = useState<number | null>(null);
  const history = useRemoteResource(finalResultService.history, {
    classId,
    enrollmentId: historyId,
  });
  const [reopen, setReopen] = useState(false);
  const reload = () => {
    report.reload();
    finals.reload();
    history.reload();
  };
  const rows = (report.data?.students ?? []).filter(
    (r) => !focused || r.enrollmentId === focused,
  );
  return (
    <Space orientation="vertical" style={{ width: "100%" }}>
      <Alert
        type="info"
        showIcon
        title="Kết quả cuối khóa"
        description="Chưa chốt và kết quả tạm tính được hiển thị riêng. Kết quả cũ không có bằng chứng được giữ là chưa xác minh. Mở lại áp dụng toàn lớp vì điểm danh, quy tắc và thời lượng là nguồn dùng chung."
      />
      <Space wrap>
        <Button onClick={reload}>Tải lại kết quả</Button>
        {manager &&
          !!finals.data?.results.some((r) => r.state === "CONFIRMED") && (
            <Button danger onClick={() => setReopen(true)}>
              Mở lại kết quả toàn lớp
            </Button>
          )}
      </Space>
      <LoadError error={report.error} reload={report.reload} />
      <LoadError error={finals.error} reload={finals.reload} />
      <Table
        rowKey="enrollmentId"
        loading={report.loading || finals.loading}
        scroll={{ x: 850 }}
        dataSource={rows}
        pagination={{ pageSize: 10 }}
        columns={[
          {
            title: "Học viên / đăng ký",
            render: (_, r) => r.studentName + " · #" + r.enrollmentId,
          },
          {
            title: "Tạm tính",
            render: (_, r) =>
              r.status === "INSUFFICIENT"
                ? "Chưa đủ dữ liệu"
                : labels[r.status as keyof typeof labels],
          },
          {
            title: "Chính thức",
            render: (_, r) => {
              const f = finals.data?.results.find(
                (x) => x.enrollmentId === r.enrollmentId,
              );
              return f ? (
                <Space orientation="vertical">
                  <Tag color={f.state === "CONFIRMED" ? "green" : "orange"}>
                    {f.state === "CONFIRMED"
                      ? labels[f.outcome]
                      : "Đang xem xét lại"}{" "}
                    · v{f.revision}
                  </Tag>
                  <Typography.Text type="secondary">
                    {f.confirmedByName} · {displayDate(f.confirmedAt)}
                  </Typography.Text>
                </Space>
              ) : r.studyStatus === "COMPLETED" ? (
                "Lịch sử chưa xác minh"
              ) : (
                "Chưa chốt"
              );
            },
          },
          {
            title: "Thao tác",
            render: (_, r) => {
              const f = finals.data?.results.find(
                (x) => x.enrollmentId === r.enrollmentId,
              );
              return (
                <Space wrap>
                  {manager && f?.state !== "CONFIRMED" && (
                    <Button onClick={() => setConfirm(r.enrollmentId)}>
                      Xem trước / chốt
                    </Button>
                  )}
                  <Button
                    disabled={!f}
                    onClick={() => setHistoryId(r.enrollmentId)}
                  >
                    Lịch sử
                  </Button>
                  {manager && (
                    <Link
                      to={
                        "/enrollment?studentId=" +
                        r.studentId +
                        "&classId=" +
                        classId +
                        "&enrollmentId=" +
                        r.enrollmentId
                      }
                    >
                      Đồng bộ hoàn thành
                    </Link>
                  )}
                </Space>
              );
            },
          },
        ]}
      />
      {confirm !== null && (
        <ConfirmResult
          key={confirm}
          classId={classId}
          enrollmentId={confirm}
          onClose={() => setConfirm(null)}
          onSaved={() => {
            setConfirm(null);
            reload();
          }}
        />
      )}
      {reopen && finals.data && (
        <ResultReasonModal
          title="Mở lại toàn bộ kết quả hiện hành của lớp"
          onClose={() => setReopen(false)}
          onSubmit={async (reason, requestId) => {
            await finalResultService.reopen(classId, {
              reason,
              requestId,
              expectedRevision: finals.data!.resultRevision,
            });
            setReopen(false);
            reload();
          }}
        />
      )}
      <Drawer
        open={historyId !== null}
        title="Lịch sử kết quả chính thức"
        onClose={() => setHistoryId(null)}
        size={800}
      >
        <LoadError error={history.error} reload={history.reload} />
        <Table
          rowKey="id"
          loading={history.loading}
          dataSource={history.data ?? []}
          scroll={{ x: 600 }}
          columns={[
            { title: "Phiên bản", dataIndex: "revision" },
            {
              title: "Kết quả",
              dataIndex: "outcome",
              render: (v: keyof typeof labels) => labels[v],
            },
            {
              title: "Trạng thái",
              dataIndex: "state",
              render: (v) => (v === "CONFIRMED" ? "Đã chốt" : "Đã mở lại"),
            },
            { title: "Lý do", dataIndex: "reason" },
          ]}
          expandable={{
            expandedRowRender: (r) => (
              <>
                <Typography.Paragraph>
                  {r.reopenedByName} {r.reopenReason}
                </Typography.Paragraph>
                <SnapshotView snapshot={r.snapshot} />
              </>
            ),
          }}
        />
      </Drawer>
    </Space>
  );
}
