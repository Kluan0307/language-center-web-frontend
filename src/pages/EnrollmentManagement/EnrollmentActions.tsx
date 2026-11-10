import { useCallback, useState } from "react";
import axios from "axios";
import { Button } from "antd";
import EnrollmentPlacement from "../../components/Common/Placement/EnrollmentPlacement";
import type { GateState } from "../../components/Common/Placement/EnrollmentPlacement";
import { useFormLeaveGuard } from "../../hooks/useFormLeaveGuard";
import { placementGate } from "../../services/enrollmentPlacementService";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { businessDate } from "../../utils/academic";
import {
  Alert,
  DatePicker,
  Descriptions,
  Form,
  Input,
  Modal,
  Select,
  Typography,
} from "antd";
import { useRemoteResource } from "../../hooks/useRemoteResource";
import { classService } from "../../services/academicService";
import { enrollmentService } from "../../services/admissionsService";
import { LoadError } from "../../components/Common/Academic";
import { getErrorMessage } from "../../utils/apiErrors";
import {
  nextStudyStates,
  STUDY_LABELS,
  existingClassEnrollment,
} from "../../utils/admissions";
import { displayDate } from "../../utils/display";
import { money } from "../../utils/academic";
import type { EnrollmentDto, StudyState } from "../../types/admissions";
async function loadTargets(
  { branchId, enabled }: { branchId: number; enabled: boolean },
  signal?: AbortSignal,
) {
  return enabled ? classService.all({ branchId }, signal) : [];
}
function EnrollmentActionForm({
  record,
  mode,
  onClose,
  onSaved,
}: {
  record: EnrollmentDto;
  mode: "status" | "transfer";
  onClose: () => void;
  onSaved: (record: EnrollmentDto) => void;
}) {
  const [form] = Form.useForm<{
    studyStatus: Exclude<StudyState, "TRANSFERRED">;
    newClassId?: number;
    reason: string;
    expectedReturnDate?: Dayjs;
  }>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const source = useRemoteResource(classService.detail, {
    id: mode === "transfer" ? record.classId : null,
  });
  const targets = useRemoteResource(loadTargets, {
    branchId: record.branchId,
    enabled: mode === "transfer",
  });
  const history = useRemoteResource(enrollmentService.forStudent, {
    studentId: mode === "transfer" ? record.studentId : null,
  });
  const billing = useRemoteResource(enrollmentService.billing, {
    id: mode === "transfer" ? record.id : null,
  });
  const studyStatus = Form.useWatch("studyStatus", form);
  const chosen = Form.useWatch("newClassId", form) as number | undefined;
  const [gate, setGate] = useState<GateState>({ allowed: false });
  const gateChanged = useCallback((s: GateState) => setGate(s), []);
  const [uncertain, setUncertain] = useState(false);
  const [attemptedStatus, setAttemptedStatus] = useState<string>();
  const leave = useFormLeaveGuard(busy || uncertain, onClose);
  const needsGate = mode === "transfer" || studyStatus === "STUDYING";
  const targetId = mode === "transfer" ? chosen : record.classId;
  async function recover() {
    setBusy(true);
    try {
      if (mode === "status" && attemptedStatus) {
        const e = await enrollmentService.detail({ id: record.id });
        if (
          e &&
          e.studyStatus === attemptedStatus &&
          e.version > record.version
        ) {
          onSaved(e);
          return;
        }
      }
      if (gate.approvalId) {
        const a = await placementGate.get(gate.approvalId);
        if (a.consumedEnrollmentId) {
          const e = await enrollmentService.detail({
            id: a.consumedEnrollmentId,
          });
          if (e) {
            onSaved(e);
            return;
          }
        }
      }
      const list = await enrollmentService.list({
        page: 0,
        size: 20,
        studentId: record.studentId,
        classId: targetId,
        studyStatus: "STUDYING",
      });
      if (list.content[0]) {
        onSaved(list.content[0]);
        return;
      }
      setUncertain(false);
      setError(
        "Chưa tìm thấy kết quả đã lưu. Tải lại đề nghị và kiểm tra trước khi gửi lại.",
      );
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  const target = targets.data?.find((c) => c.id === chosen);
  async function save(values: {
    studyStatus: Exclude<StudyState, "TRANSFERRED">;
    newClassId?: number;
    reason: string;
    expectedReturnDate?: Dayjs;
  }) {
    if (busy || uncertain || (needsGate && !gate.allowed)) return;
    setBusy(true);
    setAttemptedStatus(values.studyStatus);
    setError(undefined);
    try {
      const saved =
        mode === "transfer"
          ? await enrollmentService.transfer(
              record.id,
              values.newClassId!,
              values.reason,
              record.version,
              gate.approvalId,
            )
          : await enrollmentService.status(
              record.id,
              values.studyStatus,
              values.reason,
              record.version,
              values.expectedReturnDate?.format("YYYY-MM-DD"),
              needsGate ? gate.approvalId : undefined,
            );
      onSaved(saved);
    } catch (e) {
      setError(getErrorMessage(e));
      if (axios.isAxiosError(e) && !e.response) setUncertain(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      open
      title={mode === "transfer" ? "Chuyển lớp" : "Cập nhật trạng thái học"}
      width={680}
      okText={mode === "transfer" ? "Xác nhận chuyển lớp" : "Lưu trạng thái"}
      cancelText="Hủy"
      onOk={() => form.submit()}
      confirmLoading={busy}
      okButtonProps={{
        disabled:
          uncertain ||
          (needsGate && !gate.allowed) ||
          (mode === "transfer" &&
            (source.loading ||
              targets.loading ||
              history.loading ||
              !!source.error ||
              !!targets.error ||
              !!history.error)),
      }}
      onCancel={leave.cancel}
      closable={!busy}
      maskClosable={!busy}
      cancelButtonProps={{ disabled: busy }}
    >
      {error && (
        <Alert
          type="error"
          showIcon
          title={error}
          style={{ marginBottom: 16 }}
        />
      )}
      <Typography.Paragraph>
        <strong>{record.studentName}</strong> · {record.classCode} ·{" "}
        {record.className}
      </Typography.Paragraph>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        title={
          mode === "transfer"
            ? "Giữ học phí gốc khi chuyển lớp"
            : "Trạng thái học và tài chính được xử lý riêng"
        }
        description={
          mode === "transfer"
            ? "Chỉ chuyển sang lớp khác cùng khóa và cùng chi nhánh. Không tạo học phí lần hai."
            : "Bảo lưu, hoàn thành hoặc ngừng học không tự hoàn tiền hay hủy học phí. Hồ sơ phải Đang học để học lại."
        }
      />
      <Form
        name="enrollmentAction"
        onValuesChange={() => {
          leave.changed();
        }}
        form={form}
        layout="vertical"
        initialValues={{
          studyStatus: nextStudyStates(record.studyStatus).filter(s=>s!=="COMPLETED")[0],
          expectedReturnDate: record.expectedReturnDate
            ? dayjs(record.expectedReturnDate)
            : undefined,
        }}
        disabled={busy}
        onFinish={save}
      >
        {mode === "status" ? (
          <Form.Item
            name="studyStatus"
            label="Trạng thái mới"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                ...nextStudyStates(record.studyStatus).filter(s=>s!=="COMPLETED"),
                ...(record.studyStatus === "RESERVED"
                  ? ["RESERVED" as const]
                  : []),
              ].map((value) => ({
                value,
                label:
                  value === "STUDYING"
                    ? "Học lại"
                    : value === "RESERVED" && record.studyStatus === "RESERVED"
                      ? "Cập nhật ngày dự kiến"
                      : STUDY_LABELS[value],
              }))}
            />
          </Form.Item>
        ) : (
          <>
            <LoadError error={source.error} reload={source.reload} />
            <LoadError error={targets.error} reload={targets.reload} />
            <LoadError error={history.error} reload={history.reload} />
            <Form.Item
              name="newClassId"
              label="Lớp đích"
              rules={[{ required: true, message: "Chọn lớp đích." }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                loading={targets.loading}
                options={targets.data
                  ?.filter(
                    (c) =>
                      c.id !== record.classId &&
                      c.branchId === record.branchId &&
                      c.courseId === source.data?.schoolClass.courseId,
                  )
                  .map((c) => ({
                    value: c.id,
                    disabled:
                      c.status === "FINISHED" ||
                      c.full ||
                      !!existingClassEnrollment(history.data ?? [], c.id),
                    label: `${c.code} · ${c.name} (${c.currentSize}/${c.maxSize})${c.status === "FINISHED" ? " — Đã kết thúc" : c.full ? " — Đủ chỗ" : existingClassEnrollment(history.data ?? [], c.id) ? " — Đã có đăng ký" : ""}`,
                  }))}
              />
            </Form.Item>
            {target && (
              <Descriptions
                column={1}
                size="small"
                items={[
                  {
                    key: "teacher",
                    label: "Giáo viên",
                    children: target.teacherName,
                  },
                  { key: "room", label: "Phòng", children: target.roomName },
                  {
                    key: "date",
                    label: "Thời gian",
                    children: `${displayDate(target.startDate, false)} — ${displayDate(target.endDate, false)}`,
                  },
                ]}
              />
            )}
            {billing.data && (
              <Typography.Paragraph>
                Giá ghi danh gốc:{" "}
                <strong>{money(billing.data.tuitionFee)}</strong> · Đăng ký tính
                phí #{billing.data.enrollmentId}
              </Typography.Paragraph>
            )}
          </>
        )}
        {mode === "status" && studyStatus === "RESERVED" && (
          <Form.Item
            name="expectedReturnDate"
            label="Dự kiến học lại"
            rules={[{ required: true, message: "Chọn ngày dự kiến học lại." }]}
          >
            <DatePicker
              aria-label="Dự kiến học lại"
              format="DD/MM/YYYY"
              minDate={dayjs(businessDate()).add(1, "day")}
            />
          </Form.Item>
        )}
        <Form.Item
          name="reason"
          label="Lý do thay đổi"
          rules={[
            {
              required: true,
              whitespace: true,
              min: 3,
              max: 500,
              message: "Nhập lý do từ 3 đến 500 ký tự.",
            },
          ]}
        >
          <Input.TextArea
            aria-label="Lý do thay đổi đăng ký"
            maxLength={500}
            showCount
            rows={3}
          />
        </Form.Item>
      </Form>
      {needsGate && targetId && (
        <EnrollmentPlacement
          key={record.id + ":" + record.version + ":" + targetId + ":" + mode}
          context={{
            studentId: record.studentId,
            classId: targetId,
            intent: mode === "transfer" ? "TRANSFER" : "RESUME",
            sourceEnrollmentId: record.id,
          }}
          onState={gateChanged}
        />
      )}
      {uncertain && (
        <Alert
          type="warning"
          title="Chưa rõ kết quả lưu. Kiểm tra đăng ký và đề nghị trước khi gửi lại."
          action={
            <Button loading={busy} onClick={() => void recover()}>
              Kiểm tra kết quả đã lưu
            </Button>
          }
        />
      )}
    </Modal>
  );
}

export default function EnrollmentActions(props: {
  record: EnrollmentDto;
  mode: "status" | "transfer";
  onClose: () => void;
  onSaved: (record: EnrollmentDto) => void;
}) {
  const r = useRemoteResource(enrollmentService.detail, {
    id: props.record.id,
  });
  return r.data ? (
    <EnrollmentActionForm {...props} record={r.data} />
  ) : (
    <Modal
      open
      title="Tải đăng ký mới nhất"
      footer={null}
      onCancel={props.onClose}
    >
      <LoadError error={r.error} reload={r.reload} />
      {r.loading && "Đang tải…"}
    </Modal>
  );
}
