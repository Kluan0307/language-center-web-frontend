import { useState } from "react";
import {
  Alert,
  Button,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { durationService } from "../../../services/durationService";
import type {
  CourseDuration,
  ClassDuration,
  DurationHistory,
} from "../../../services/durationService";
import { durationLabel } from "../../../utils/duration";
import { displayDate } from "../../../utils/display";
import { getErrorMessage } from "../../../utils/apiErrors";
import { useRemoteResource } from "../../../hooks/useRemoteResource";
import { useFormLeaveGuard } from "../../../hooks/useFormLeaveGuard";
function PlanForm({
  course,
  school,
  onClose,
  onSaved,
}: {
  course: CourseDuration;
  school?: ClassDuration;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form] = Form.useForm<{
    source: "COURSE" | "CUSTOM";
    expectedMinutes: number;
    reason: string;
  }>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const leave = useFormLeaveGuard(busy, onClose);
  const source = Form.useWatch("source", form);
  return (
    <Modal
      open
      title={
        school
          ? "Xác nhận kế hoạch thời lượng lớp"
          : "Xác minh thời lượng khóa học"
      }
      okText="Lưu kế hoạch thời lượng"
      cancelText="Hủy"
      onOk={() => form.submit()}
      onCancel={leave.cancel}
      confirmLoading={busy}
      closable={!busy}
      maskClosable={!busy}
      cancelButtonProps={{ disabled: busy }}
    >
      <Alert
        type="info"
        showIcon
        title="Nhập số phút đã đối chiếu với giáo trình/kế hoạch."
        description={
          school
            ? "Đổi kế hoạch của lớp này, lưu người/thời điểm/lý do. Không tự thay đổi lịch hoặc buổi đã học."
            : "Không suy ra đơn vị từ duration cũ hoặc lấy tổng lịch làm mục tiêu. Các lớp đã mở giữ kế hoạch riêng."
        }
      />
      {error && <Alert type="error" title={error} />}
      <Form
        name="durationPlan"
        form={form}
        layout="vertical"
        disabled={busy}
        onValuesChange={leave.changed}
        initialValues={{
          source: "CUSTOM",
          expectedMinutes: school
            ? (school.expectedMinutes ?? undefined)
            : (course.expectedMinutes ?? undefined),
        }}
        onFinish={async (v) => {
          if (busy) return;
          setBusy(true);
          setError(undefined);
          try {
            if (school)
              await durationService.saveClass(school.classId, {
                expectedRevision: school.revision,
                source: v.source,
                expectedMinutes:
                  v.source === "CUSTOM" ? v.expectedMinutes : undefined,
                expectedCourseRevision:
                  v.source === "COURSE" ? course.revision : undefined,
                reason: v.reason.trim(),
              });
            else
              await durationService.saveCourse(course.courseId, {
                expectedRevision: course.revision,
                expectedMinutes: v.expectedMinutes,
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
        {school && (
          <Form.Item
            name="source"
            label="Nguồn kế hoạch"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { value: "CUSTOM", label: "Xác nhận số phút riêng cho lớp" },
                {
                  value: "COURSE",
                  label:
                    "Áp dụng bản mới nhất của khóa: " +
                    durationLabel(course.expectedMinutes),
                  disabled: !course.verified,
                },
              ]}
            />
          </Form.Item>
        )}
        {(!school || source !== "COURSE") && (
          <Form.Item
            name="expectedMinutes"
            label="Thời lượng kế hoạch (phút)"
            rules={[
              { required: true, message: "Nhập số phút đã xác minh." },
              { type: "integer", min: 1, max: 600000 },
            ]}
            extra="Ví dụ: 90 phút = 1 giờ 30 phút; 180 phút = 3 giờ."
          >
            <InputNumber
              min={1}
              max={600000}
              precision={0}
              style={{ width: "100%" }}
            />
          </Form.Item>
        )}
        <Form.Item
          name="reason"
          label="Lý do / nguồn đối chiếu"
          rules={[{ required: true, whitespace: true, min: 3, max: 500 }]}
        >
          <Input.TextArea rows={3} maxLength={500} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
function History({
  data,
  loading,
}: {
  data?: DurationHistory[];
  loading: boolean;
}) {
  return (
    <Table<DurationHistory>
      rowKey="id"
      size="small"
      dataSource={data}
      loading={loading}
      scroll={{ x: 600 }}
      columns={[
        { title: "Phiên bản", dataIndex: "revision" },
        {
          title: "Kế hoạch",
          dataIndex: "expectedMinutes",
          render: durationLabel,
        },
        { title: "Người xác nhận", dataIndex: "actorName" },
        { title: "Lý do", dataIndex: "reason" },
        {
          title: "Thời điểm",
          dataIndex: "occurredAt",
          render: (v) => displayDate(v),
        },
      ]}
    />
  );
}
export function CourseDurationPanel({
  id,
  onChanged,
}: {
  id: number;
  onChanged?: () => void;
}) {
  const view = useRemoteResource(durationService.course, { id });
  const history = useRemoteResource(durationService.courseHistory, {
    id,
    revision: view.data?.revision ?? 0,
  });
  const [editing, setEditing] = useState(false);
  return (
    <Space orientation="vertical" style={{ width: "100%" }}>
      <Typography.Title level={5}>Kế hoạch thời lượng chuẩn</Typography.Title>
      <Button
        onClick={() => {
          view.reload();
          history.reload();
        }}
      >
        Tải lại thời lượng khóa
      </Button>
      {view.error && <Alert type="error" title={view.error} />}{" "}
      {view.data && (
        <>
          <Alert
            showIcon
            type={view.data.verified ? "success" : "warning"}
            title={"Kế hoạch: " + durationLabel(view.data.expectedMinutes)}
            description={
              view.data.verified
                ? undefined
                : "Chưa xác nhận tổng thời lượng. Vui lòng kiểm tra và cập nhật kế hoạch khóa học."
            }
          />
          {view.data.canManage && (
            <Button onClick={() => setEditing(true)}>
              Xác minh / chỉnh thời lượng khóa
            </Button>
          )}
          {history.error && <Alert type="error" title={history.error} />}
          <History data={history.data} loading={history.loading} />
          {editing && (
            <PlanForm
              course={view.data}
              onClose={() => setEditing(false)}
              onSaved={() => {
                setEditing(false);
                view.reload();
                history.reload();
                onChanged?.();
              }}
            />
          )}
        </>
      )}
    </Space>
  );
}
export function ClassTimeProgress({
  id,
  revision = 0,
}: {
  id: number;
  revision?: number;
}) {
  const progress = useRemoteResource(durationService.progress, {
    id,
    revision,
  });
  const p = progress.data;
  return (
    <Space orientation="vertical" style={{ width: "100%" }}>
      <Typography.Title level={5}>
        Thời lượng kế hoạch / đã xếp / đã học
      </Typography.Title>
      <Button onClick={progress.reload} loading={progress.loading}>
        Tải lại tổng thời lượng
      </Button>
      {progress.error && <Alert type="error" title={progress.error} />}{" "}
      {p && (
        <>
          <Descriptions
            bordered
            size="small"
            column={1}
            items={[
              {
                key: "plan",
                label: "Kế hoạch lớp",
                children: durationLabel(p.expectedMinutes),
              },
              {
                key: "scheduled",
                label: "Đã xếp (buổi chưa hủy)",
                children: durationLabel(p.scheduledMinutes),
              },
              {
                key: "taught",
                label: "Đã học (đã xác nhận điểm danh)",
                children: durationLabel(p.taughtMinutes),
              },
              {
                key: "known",
                label: "Phần thời lượng đã biết",
                children:
                  "Đã xếp " +
                  durationLabel(p.knownScheduledMinutes) +
                  "; đã học " +
                  durationLabel(p.knownTaughtMinutes),
              },
              {
                key: "sessions",
                label: "Trạng thái buổi",
                children:
                  p.completedSessions +
                  " hoàn tất · " +
                  p.unfinishedSessions +
                  " chưa xử lý · " +
                  p.cancelledSessions +
                  " đã hủy",
              },
              {
                key: "missing",
                label: "Buổi thiếu căn cứ thời lượng",
                children: p.unknownActiveSessions,
              },
              {
                key: "ready",
                label: "Điều kiện thời lượng đóng lớp",
                children: (
                  <Tag color={p.timeReadyForClosure ? "green" : "orange"}>
                    {p.timeReadyForClosure
                      ? "Đã đủ căn cứ thời lượng"
                      : "Chưa đủ điều kiện thời lượng"}
                  </Tag>
                ),
              },
            ]}
          />
          <Alert
            type="info"
            title="Đã đủ thời lượng chưa phải đã đạt hoặc đã chốt kết quả cuối khóa."
            description="Tổng của toàn bộ lớp, không giới hạn bởi bộ lọc ngày trên lịch. Ngày đã qua không tự tính là đã học. Buổi hủy không tính, buổi bù chỉ tính một lần theo buổi thực tế."
          />
          {p.warnings.map((w) => (
            <Alert key={w.code} type="warning" showIcon title={w.message} />
          ))}
        </>
      )}
    </Space>
  );
}
export function ClassDurationPanel({ id }: { id: number }) {
  const view = useRemoteResource(durationService.schoolClass, { id });
  const history = useRemoteResource(durationService.classHistory, {
    id,
    revision: view.data?.revision ?? 0,
  });
  const [editing, setEditing] = useState(false);
  return (
    <Space orientation="vertical" style={{ width: "100%" }}>
      {view.error && (
        <Alert
          type="error"
          title={view.error}
          action={<Button onClick={view.reload}>Thử lại</Button>}
        />
      )}{" "}
      {view.data && (
        <>
          <Alert
            type="info"
            title={
              "Kế hoạch lớp v" +
              view.data.revision +
              ": " +
              durationLabel(view.data.expectedMinutes)
            }
            description={
              "Khóa hiện tại v" +
              view.data.course.revision +
              ": " +
              durationLabel(view.data.course.expectedMinutes) +
              ". Sửa khóa không tự thay đổi lớp này."
            }
          />
          {view.data.canManage && (
            <Button onClick={() => setEditing(true)}>
              Xác minh / điều chỉnh kế hoạch lớp
            </Button>
          )}
          <ClassTimeProgress id={id} revision={view.data.revision} />
          {history.error && <Alert type="error" title={history.error} />}
          <History data={history.data} loading={history.loading} />
          {editing && (
            <PlanForm
              course={view.data.course}
              school={view.data}
              onClose={() => setEditing(false)}
              onSaved={() => {
                setEditing(false);
                view.reload();
                history.reload();
              }}
            />
          )}
        </>
      )}
    </Space>
  );
}
