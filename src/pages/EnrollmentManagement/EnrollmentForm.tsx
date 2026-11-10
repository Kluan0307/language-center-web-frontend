import { useCallback, useState } from "react";
import EnrollmentPlacement, {
  PlacementSuggestions,
} from "../../components/Common/Placement/EnrollmentPlacement";
import type { GateState } from "../../components/Common/Placement/EnrollmentPlacement";
import { useFormLeaveGuard } from "../../hooks/useFormLeaveGuard";
import axios from "axios";
import {
  Alert,
  Button,
  Descriptions,
  Form,
  Modal,
  Select,
  Space,
  Table,
  Typography,
} from "antd";
import { BranchField, LoadError } from "../../components/Common/Academic";
import { useBranches } from "../../hooks/useBranches";
import { useAuth } from "../../hooks/useAuth";
import { useRemoteResource } from "../../hooks/useRemoteResource";
import {
  studentService,
  enrollmentService,
} from "../../services/admissionsService";
import { classService } from "../../services/academicService";
import { getErrorMessage } from "../../utils/apiErrors";
import {
  existingClassEnrollment,
  STUDENT_LABELS,
} from "../../utils/admissions";
import { dayLabel } from "../../utils/academic";
import { displayDate } from "../../utils/display";
import type { ClassDto } from "../../types/academic";
import type { EnrollmentDto, StudentDto } from "../../types/admissions";

interface Values {
  branchId?: number;
  studentId: number;
  classId: number;
}
async function loadOptions(
  { branchId }: { branchId: number | null },
  signal?: AbortSignal,
) {
  if (!branchId) return { students: [], classes: [] };
  const [students, classes] = await Promise.all([
    studentService.all({ branchId }, signal),
    classService.all({ branchId }, signal),
  ]);
  return { students, classes };
}
export default function EnrollmentForm({
  initialStudent,
  initialClass,
  defaultBranchId,
  onClose,
  onSaved,
  onExisting,
}: {
  initialStudent?: StudentDto;
  initialClass?: ClassDto;
  defaultBranchId?: number;
  onClose: () => void;
  onSaved: (record: EnrollmentDto, recovered?: boolean) => void;
  onExisting: (record: EnrollmentDto) => void;
}) {
  const { user } = useAuth();
  const branches = useBranches();
  const [form] = Form.useForm<Values>();
  const chosenBranch = Form.useWatch("branchId", form) as number | undefined;
  const studentId = Form.useWatch("studentId", form) as number | undefined;
  const classId = Form.useWatch("classId", form) as number | undefined;
  const branchId =
    (user?.role === "SUPER_ADMIN" ? chosenBranch : user?.branchId) ?? null;
  const options = useRemoteResource(loadOptions, { branchId });
  const registrations = useRemoteResource(enrollmentService.forStudent, {
    studentId: studentId ?? null,
  });
  const classDetail = useRemoteResource(classService.detail, {
    id: classId ?? null,
  });
  const student = options.data?.students.find((s) => s.id === studentId);
  const c = options.data?.classes.find((entry) => entry.id === classId);
  const existing = existingClassEnrollment(registrations.data ?? [], classId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [uncertain, setUncertain] = useState(false);
  const [gate, setGate] = useState<GateState>({ allowed: false });
  const gateChanged = useCallback((value: GateState) => setGate(value), []);
  const leave = useFormLeaveGuard(busy || uncertain, onClose);
  const initialBranch =
    initialStudent?.branchId ?? initialClass?.branchId ?? defaultBranchId;
  const initial = {
    branchId: initialBranch,
    studentId: initialStudent?.id,
    classId:
      !initialClass || initialClass.branchId !== initialBranch
        ? undefined
        : initialClass.id,
  };
  async function save(values: Values) {
    if (busy || uncertain || existing || !gate.allowed) return;
    setBusy(true);
    setError(undefined);
    try {
      const record = await enrollmentService.create({
        studentId: values.studentId,
        classId: values.classId,
        approvalId: gate.approvalId,
      });
      onSaved(record);
    } catch (e) {
      setError(getErrorMessage(e));
      if (axios.isAxiosError(e) && !e.response) setUncertain(true);
      registrations.reload();
    } finally {
      setBusy(false);
    }
  }
  async function recover() {
    const values = form.getFieldsValue();
    if (!values.studentId || !values.classId || busy) return;
    setBusy(true);
    try {
      const found = await enrollmentService.list({
        page: 0,
        size: 20,
        studentId: values.studentId,
        classId: values.classId,
        studyStatus: "STUDYING",
      });
      if (found.content[0]) onSaved(found.content[0], true);
      else {
        setUncertain(false);
        setError(
          "Chưa tìm thấy đăng ký đang học. Kiểm tra lại danh sách trước khi gửi lại.",
        );
        registrations.reload();
      }
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  const unavailable =
    !student ||
    student.status !== "STUDYING" ||
    !c ||
    c.status === "FINISHED" ||
    c.full;
  return (
    <Modal
      open
      title="Ghi danh học viên"
      width={820}
      okText="Xác nhận ghi danh"
      cancelText="Hủy"
      onOk={() => form.submit()}
      confirmLoading={busy}
      okButtonProps={{
        disabled:
          !gate.allowed ||
          uncertain ||
          unavailable ||
          !!existing ||
          registrations.loading ||
          !!registrations.error ||
          options.loading ||
          !!options.error,
      }}
      onCancel={leave.cancel}
      closable={!busy}
      maskClosable={!busy}
      cancelButtonProps={{ disabled: busy }}
    >
      <Form<Values>
        name="enrollmentCreate"
        form={form}
        layout="vertical"
        initialValues={initial}
        onFinish={save}
        disabled={busy || uncertain}
        onValuesChange={(changed) => {
          leave.changed();
          setGate({ allowed: false });
          setError(undefined);
          if ("branchId" in changed)
            form.setFieldsValue({ studentId: undefined, classId: undefined });
        }}
      >
        {error && (
          <Alert
            type={uncertain ? "warning" : "error"}
            showIcon
            title={error}
            style={{ marginBottom: 16 }}
          />
        )}
        <LoadError error={branches.error} reload={branches.reload} />
        <LoadError error={options.error} reload={options.reload} />
        <BranchField branches={branches.data} loading={branches.loading} />
        <Form.Item
          name="studentId"
          label="Học viên"
          rules={[{ required: true, message: "Chọn học viên." }]}
        >
          <Select
            disabled={!branchId}
            showSearch
            optionFilterProp="label"
            loading={options.loading}
            options={options.data?.students.map((s) => ({
              value: s.id,
              disabled: s.status !== "STUDYING",
              label: `${s.studentCode} · ${s.fullName} · ${s.phone}${s.status !== "STUDYING" ? " — " + STUDENT_LABELS[s.status] : ""}`,
            }))}
          />
        </Form.Item>
        <Form.Item
          name="classId"
          label="Lớp học"
          rules={[{ required: true, message: "Chọn lớp học." }]}
        >
          <Select
            disabled={!branchId}
            showSearch
            optionFilterProp="label"
            loading={options.loading}
            options={options.data?.classes.map((entry) => ({
              value: entry.id,
              disabled: false,
              label: `${entry.code} · ${entry.name} (${entry.currentSize}/${entry.maxSize})${entry.status === "FINISHED" ? " — Đã kết thúc" : entry.full ? " — Đủ chỗ" : ""}`,
            }))}
          />
        </Form.Item>
      </Form>
      <LoadError error={registrations.error} reload={registrations.reload} />
      {existing && (
        <Alert
          type="warning"
          showIcon
          title={
            existing.studyStatus === "RESERVED"
              ? "Học viên đang bảo lưu lớp này"
              : "Học viên đã có đăng ký đang học"
          }
          description="Mở đăng ký hiện có để xử lý, không ghi danh thêm."
          style={{ marginBottom: 16 }}
          action={
            <Button onClick={() => onExisting(existing as EnrollmentDto)}>
              Mở đăng ký
            </Button>
          }
        />
      )}
      {uncertain && (
        <Space style={{ marginBottom: 16 }}>
          <Button loading={busy} onClick={() => void recover()}>
            Kiểm tra đăng ký đã lưu
          </Button>
        </Space>
      )}
      {student && student.status !== "STUDYING" && (
        <Alert
          showIcon
          type="warning"
          title="Cần đưa hồ sơ học viên về Đang học trước khi ghi danh."
        />
      )}
      {studentId && (
        <PlacementSuggestions
          studentId={studentId}
          onChoose={(id) => {
            form.setFieldValue("classId", id);
            setGate({ allowed: false });
            leave.changed();
          }}
        />
      )}
      {studentId && classId && (
        <EnrollmentPlacement
          key={studentId + ":" + classId}
          context={{
            studentId,
            classId,
            intent: "ENROLL",
            sourceEnrollmentId: null,
          }}
          onState={gateChanged}
        />
      )}
      {c && (
        <Descriptions
          bordered
          size="small"
          column={2}
          style={{ marginBottom: 16 }}
          items={[
            { key: "course", label: "Khóa", children: c.courseName },
            { key: "teacher", label: "Giáo viên", children: c.teacherName },
            { key: "room", label: "Phòng", children: c.roomName },
            {
              key: "size",
              label: "Sĩ số",
              children: `${c.currentSize}/${c.maxSize}`,
            },
            {
              key: "start",
              label: "Bắt đầu",
              children: displayDate(c.startDate, false),
            },
            {
              key: "end",
              label: "Kết thúc",
              children: displayDate(c.endDate, false),
            },
          ]}
        />
      )}
      <LoadError error={classDetail.error} reload={classDetail.reload} />
      {classDetail.data && (
        <Table
          rowKey="id"
          size="small"
          pagination={false}
          dataSource={classDetail.data.schedules}
          locale={{
            emptyText:
              "Lớp chưa có lịch. Cần theo dõi lịch được xếp sau khi ghi danh.",
          }}
          columns={[
            { title: "Ngày", dataIndex: "dayOfWeek", render: dayLabel },
            { title: "Bắt đầu", dataIndex: "startTime" },
            { title: "Kết thúc", dataIndex: "endTime" },
          ]}
        />
      )}
      <Typography.Paragraph
        type="secondary"
        style={{ marginTop: 16, marginBottom: 0 }}
      >
        Hệ thống kiểm tra sĩ số và trùng lịch tại lúc lưu. Giá học phí được chốt
        từ khóa học; nếu tạo học phí lỗi, đăng ký vẫn được giữ và có thể thử tạo
        học phí lại.
      </Typography.Paragraph>
    </Modal>
  );
}
