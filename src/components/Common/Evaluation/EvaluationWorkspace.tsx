import { useState } from "react";
import {
  Alert,
  Button,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Modal,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from "antd";
import { useRemoteResource } from "../../../hooks/useRemoteResource";
import { useFormLeaveGuard } from "../../../hooks/useFormLeaveGuard";
import { evaluationService } from "../../../services/evaluationService";
import type {
  PolicyView,
  EvaluationPolicy,
  RuleInput,
  EvaluationReport,
} from "../../../services/evaluationService";
import { examService } from "../../../services/teachingService";
import { getErrorMessage } from "../../../utils/apiErrors";
import { displayDate } from "../../../utils/display";
import { durationLabel } from "../../../utils/duration";
const statusLabels = {
  PASS: "Đạt tạm",
  FAIL: "Chưa đạt tạm",
  INSUFFICIENT: "Chưa đủ dữ liệu",
};
const gradeLabels: Record<string, string> = {
  GRADED: "Đã chấm",
  MISSING: "Chưa chấm",
  NOT_YET_DUE: "Chưa đến ngày thi",
  INVALID: "Nguồn điểm chưa hợp lệ",
  NOT_APPLICABLE: "Không áp dụng",
  UNKNOWN_ROSTER: "Chưa rõ căn cứ dự thi",
};
function PolicyInfo({ policy }: { policy: EvaluationPolicy }) {
  return (
    <Space orientation="vertical" style={{ width: "100%" }}>
      <Descriptions
        size="small"
        column={1}
        items={[
          {
            key: "threshold",
            label: "Ngưỡng đạt",
            children: policy.passPercent + "%",
          },
          {
            key: "attendance",
            label: "Chuyên cần tối thiểu",
            children:
              policy.minAttendancePercent === null
                ? "Không yêu cầu"
                : policy.minAttendancePercent + "%",
          },
          {
            key: "required",
            label: "Bài bắt buộc",
            children:
              policy.rules
                .filter((e) => e.required)
                .map((e) => e.examName)
                .join(", ") ||
              "Không có; vẫn cần ít nhất một bài áp dụng có điểm",
          },
          { key: "actor", label: "Người xác nhận", children: policy.actorName },
          {
            key: "time",
            label: "Xác nhận lúc",
            children: displayDate(policy.confirmedAt),
          },
          { key: "reason", label: "Lý do", children: policy.reason },
        ]}
      />
      <Table
        rowKey="examId"
        size="small"
        pagination={false}
        dataSource={policy.rules}
        scroll={{ x: 650 }}
        columns={[
          { title: "Bài trong quy tắc", dataIndex: "examName" },
          {
            title: "Bắt buộc",
            dataIndex: "required",
            render: (v) => (v ? "Có" : "Không"),
          },
          { title: "Thang điểm", dataIndex: "maxScore" },
          { title: "Trọng số xác nhận", dataIndex: "weight" },
          {
            title: "Ngày",
            dataIndex: "examDate",
            render: (v) => displayDate(v, false),
          },
        ]}
      />
    </Space>
  );
}
function PolicyForm({
  classId,
  view,
  onClose,
  onSaved,
}: {
  classId: number;
  view: PolicyView;
  onClose: () => void;
  onSaved: () => void;
}) {
  const exams = useRemoteResource(examService.forClass, { classId });
  const [rows, setRows] = useState<RuleInput[]>(
    view.policy?.rules.map((e) => ({
      examId: e.examId,
      expectedExamVersion: e.examVersion,
      required: e.required,
      weight: e.weight,
    })) ?? [],
  );
  const [form] = Form.useForm<{
    passPercent: number;
    attendanceRequired: boolean;
    minAttendancePercent?: number;
    reason: string;
  }>();
  const required = Form.useWatch("attendanceRequired", form);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const leave = useFormLeaveGuard(busy, onClose);
  function update(id: number, values: Partial<RuleInput>) {
    leave.changed();
    setRows((old) =>
      old.map((e) => (e.examId === id ? { ...e, ...values } : e)),
    );
  }
  return (
    <Modal
      open
      width={1000}
      title="Xác nhận quy tắc đánh giá của lớp"
      okText="Xác nhận quy tắc"
      cancelText="Hủy"
      onCancel={leave.cancel}
      onOk={() => form.submit()}
      confirmLoading={busy}
      closable={!busy}
      maskClosable={!busy}
      cancelButtonProps={{ disabled: busy }}
      okButtonProps={{
        disabled: exams.loading || !!exams.error || rows.length === 0,
      }}
    >
      <Alert
        type="info"
        showIcon
        title="Quy tắc chỉ áp dụng cho lớp đang chọn, mỗi xác nhận lưu một phiên bản."
        description="Chọn bài áp dụng, đánh dấu bắt buộc và kiểm tra trọng số. Thang điểm lấy từ bài kiểm tra; không tự coi bài cũ là bắt buộc hoặc mặc định chuẩn50%."
      />
      {error && <Alert type="error" title={error} />}{" "}
      {exams.error && (
        <Alert
          type="error"
          title={exams.error}
          action={<Button onClick={exams.reload}>Thử lại</Button>}
        />
      )}
      <Form
        name="evaluationPolicy"
        form={form}
        layout="vertical"
        disabled={busy}
        initialValues={{
          passPercent: view.policy?.passPercent,
          attendanceRequired: view.policy?.minAttendancePercent != null,
          minAttendancePercent: view.policy?.minAttendancePercent ?? undefined,
        }}
        onValuesChange={leave.changed}
        onFinish={async (v) => {
          if (busy) return;
          setBusy(true);
          setError(undefined);
          try {
            const payload = rows.map((row) => {
              const exam = exams.data?.find((e) => e.id === row.examId);
              if (!exam) throw Error("Bài đã thay đổi; tải lại danh sách.");
              return { ...row, expectedExamVersion: exam.version };
            });
            await evaluationService.confirm(classId, {
              expectedRevision: view.revision,
              passPercent: v.passPercent,
              minAttendancePercent: v.attendanceRequired
                ? (v.minAttendancePercent ?? null)
                : null,
              exams: payload,
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
          name="passPercent"
          label="Ngưỡng đạt (%)"
          rules={[{ required: true }, { type: "number", min: 0, max: 100 }]}
        >
          <InputNumber min={0} max={100} precision={2} />
        </Form.Item>
        <Form.Item
          name="attendanceRequired"
          label="Có điều kiện chuyên cần"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        {required && (
          <Form.Item
            name="minAttendancePercent"
            label="Chuyên cần tối thiểu (%)"
            rules={[{ required: true }, { type: "number", min: 0, max: 100 }]}
          >
            <InputNumber min={0} max={100} precision={2} />
          </Form.Item>
        )}
        <Table
          rowKey="id"
          size="small"
          loading={exams.loading}
          dataSource={exams.data}
          scroll={{ x: 750 }}
          pagination={false}
          rowSelection={{
            selectedRowKeys: rows.map((e) => e.examId),
            onChange: (keys) => {
              leave.changed();
              setRows(
                keys.map((key) => {
                  const id = Number(key),
                    existing = rows.find((e) => e.examId === id),
                    exam = exams.data!.find((e) => e.id === id)!;
                  return (
                    existing ?? {
                      examId: id,
                      expectedExamVersion: exam.version,
                      required: false,
                      weight: exam.weight,
                    }
                  );
                }),
              );
            },
            getCheckboxProps: () => ({ disabled: busy }),
          }}
          columns={[
            { title: "Bài áp dụng", dataIndex: "name" },
            {
              title: "Ngày",
              dataIndex: "examDate",
              render: (v) => displayDate(v, false),
            },
            { title: "Thang điểm", dataIndex: "maxScore" },
            {
              title: "Bắt buộc",
              render: (_, exam) => {
                const row = rows.find((e) => e.examId === exam.id);
                return (
                  <Switch
                    aria-label={"Bắt buộc " + exam.name}
                    disabled={busy || !row}
                    checked={row?.required ?? false}
                    onChange={(value) => update(exam.id, { required: value })}
                  />
                );
              },
            },
            {
              title: "Trọng số trong quy tắc",
              render: (_, exam) => {
                const row = rows.find((e) => e.examId === exam.id);
                return (
                  <InputNumber
                    aria-label={"Trọng số " + exam.name}
                    disabled={busy || !row}
                    min={0.01}
                    max={100}
                    precision={2}
                    value={row?.weight ?? exam.weight}
                    onChange={(value) =>
                      update(exam.id, { weight: value ?? 0 })
                    }
                  />
                );
              },
            },
          ]}
        />
        <Form.Item
          name="reason"
          label="Lý do / căn cứ quy tắc"
          rules={[{ required: true, whitespace: true, min: 3, max: 500 }]}
        >
          <Input.TextArea rows={3} maxLength={500} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
export function EvaluationResults({
  report,
  loading,
}: {
  report: EvaluationReport | null | undefined;
  loading: boolean;
}) {
  return (
    <Space orientation="vertical" style={{ width: "100%" }}>
      <Alert
        type="info"
        showIcon
        title="Đánh giá tạm thời — chưa xác nhận kết quả cuối khóa"
        description={
          report
            ? "Đủ dữ liệu: " +
              report.assessableCount +
              " đăng ký; chưa đủ: " +
              report.insufficientCount +
              ". Tỷ lệ đạt tạm trên đăng ký đủ dữ liệu: " +
              (report.passRate === null
                ? "chưa xác định"
                : report.passRate + "%") +
              ". So sánh ngưỡng trước khi làm tròn số hiển thị."
            : "Đang tải căn cứ đánh giá."
        }
      />
      {report?.warnings.map((w) => (
        <Alert key={w.code} type="warning" title={w.message} />
      ))}
      {report?.duration && (
        <Typography.Paragraph type="secondary">
          Thời lượng lớp: đã học {durationLabel(report.duration.taughtMinutes)}{" "}
          / kế hoạch {durationLabel(report.duration.expectedMinutes)}. Đủ giờ
          chưa đồng nghĩa đạt học thuật.
        </Typography.Paragraph>
      )}
      <Table
        rowKey="enrollmentId"
        loading={loading}
        dataSource={report?.students}
        scroll={{ x: 1000 }}
        columns={[
          {
            title: "Đăng ký",
            dataIndex: "enrollmentId",
            render: (v) => "#" + v,
          },
          { title: "Học viên", dataIndex: "studentName" },
          {
            title: "Bài đã chấm / áp dụng",
            render: (_, r) => r.gradedExams + " / " + r.applicableExams,
          },
          {
            title: "Điểm tạm (%)",
            dataIndex: "averagePercent",
            render: (v) => (v === null ? "Chưa có điểm" : v + "%"),
          },
          { title: "Bài bắt buộc thiếu", dataIndex: "missingRequiredExams" },
          {
            title: "Chuyên cần",
            render: (_, r) =>
              r.attendance.status === "NOT_REQUIRED"
                ? "Không yêu cầu"
                : r.attendance.percent === null
                  ? "Chưa đủ dữ liệu"
                  : Number(r.attendance.percent.toFixed(2)) + "%",
          },
          {
            title: "Trạng thái tạm",
            dataIndex: "status",
            render: (s: keyof typeof statusLabels) => (
              <Tag
                color={s === "PASS" ? "green" : s === "FAIL" ? "red" : "orange"}
              >
                {statusLabels[s]}
              </Tag>
            ),
          },
        ]}
        expandable={{
          expandedRowRender: (r) => (
            <Space orientation="vertical" style={{ width: "100%" }}>
              {r.reasons.map((reason, i) => (
                <Alert key={i} type="warning" title={reason.message} />
              ))}
              <Typography.Paragraph>
                Đăng ký học: {r.studyStatus}. Chuyên cần:{" "}
                {r.attendance.attended}/{r.attendance.expected} buổi; vắng có
                phép {r.attendance.excusedAbsences}; thiếu bản ghi{" "}
                {r.attendance.missingRecords}. Điểm trước làm tròn:{" "}
                {r.unroundedAveragePercent ?? "chưa có"}.
              </Typography.Paragraph>
              <Table
                rowKey="examId"
                size="small"
                pagination={false}
                dataSource={r.exams}
                scroll={{ x: 800 }}
                columns={[
                  { title: "Bài", dataIndex: "examName" },
                  {
                    title: "Bắt buộc",
                    dataIndex: "required",
                    render: (v) => (v ? "Có" : "Không"),
                  },
                  {
                    title: "Áp dụng",
                    dataIndex: "applicability",
                    render: (v) =>
                      v === "APPLICABLE"
                        ? "Có"
                        : v === "NOT_APPLICABLE"
                          ? "Không áp dụng"
                          : "Chưa rõ",
                  },
                  {
                    title: "Điểm",
                    render: (_, e) =>
                      e.score === null
                        ? "Chưa có"
                        : e.score + " / " + e.maxScore,
                  },
                  { title: "Trọng số", dataIndex: "weight" },
                  {
                    title: "Nguồn",
                    dataIndex: "gradeStatus",
                    render: (v) => gradeLabels[v] ?? v,
                  },
                ]}
              />
            </Space>
          ),
        }}
      />
    </Space>
  );
}
export default function EvaluationWorkspace({
  classId,
  revision = 0,
  policyOnly = false,
  canConfigure = true,
}: {
  classId: number;
  revision?: number;
  policyOnly?: boolean;
  canConfigure?: boolean;
}) {
  const policy = useRemoteResource(evaluationService.policy, { classId });
  const report = useRemoteResource(evaluationService.preview, {
    classId,
    revision: revision + (policy.data?.revision ?? 0),
    enabled: !policyOnly,
  });
  const history = useRemoteResource(evaluationService.history, {
    classId,
    revision: policy.data?.revision ?? 0,
  });
  const [editing, setEditing] = useState(false);
  return (
    <Space orientation="vertical" style={{ width: "100%" }}>
      <Button
        onClick={() => {
          policy.reload();
          report.reload();
          history.reload();
        }}
      >
        Tải lại quy tắc và đánh giá
      </Button>
      {policy.error && <Alert type="error" title={policy.error} />}{" "}
      {policy.data && (
        <>
          <Tag>Quy tắc lớp v{policy.data.revision}</Tag>
          {policy.data.status !== "CONFIRMED" && (
            <Alert
              type="warning"
              title={
                policy.data.status === "STALE_CLASS_CONTEXT"
                  ? "Khóa của lớp đã đổi; cần xác nhận lại quy tắc"
                  : "Lớp chưa xác nhận quy tắc, chưa có chuẩn đánh giá"
              }
            />
          )}{" "}
          {policy.data.policy && <PolicyInfo policy={policy.data.policy} />}{" "}
          {policy.data.canManage && canConfigure && (
            <Button type="primary" onClick={() => setEditing(true)}>
              Xác nhận / thay đổi quy tắc lớp
            </Button>
          )}
          {canConfigure && (
            <Table
              rowKey="id"
              size="small"
              dataSource={history.data}
              loading={history.loading}
              scroll={{ x: 650 }}
              columns={[
                { title: "Phiên bản", dataIndex: "revision" },
                { title: "Ngưỡng (%)", dataIndex: "passPercent" },
                { title: "Người xác nhận", dataIndex: "actorName" },
                { title: "Lý do", dataIndex: "reason" },
              ]}
              expandable={{
                expandedRowRender: (p) => <PolicyInfo policy={p} />,
              }}
            />
          )}
          {history.error && <Alert type="error" title={history.error} />}{" "}
          {editing && (
            <PolicyForm
              classId={classId}
              view={policy.data}
              onClose={() => setEditing(false)}
              onSaved={() => {
                setEditing(false);
                policy.reload();
                report.reload();
                history.reload();
              }}
            />
          )}
        </>
      )}
      {report.error && (
        <Alert
          type="error"
          title={report.error}
          action={<Button onClick={report.reload}>Thử lại</Button>}
        />
      )}{" "}
      {!policyOnly && (
        <EvaluationResults report={report.data} loading={report.loading} />
      )}
    </Space>
  );
}
