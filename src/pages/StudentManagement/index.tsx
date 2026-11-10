import { useListQuery } from "../../hooks/useListQuery";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  App,
  Alert,
  Button,
  Card,
  Descriptions,
  Drawer,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  Typography,
} from "antd";
import type { TableColumnsType } from "antd";
import { Eye, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import {
  ManagementLayout,
  Filters,
} from "../../components/Layout/ManagementLayout";
import { BranchFilter, LoadError } from "../../components/Common/Academic";
import { StudentTag, StudyTag } from "../../components/Common/Admissions";
import { useAuth } from "../../hooks/useAuth";
import { useBranches } from "../../hooks/useBranches";
import { useRemoteResource } from "../../hooks/useRemoteResource";
import { studentService } from "../../services/admissionsService";
import { getErrorMessage } from "../../utils/apiErrors";
import { STUDENT_LABELS, positiveId } from "../../utils/admissions";
import { branchLabel } from "../../utils/academic";
import { displayDate } from "../../utils/display";
import StudentForm from "./StudentForm";
import LearningProfile from "../../components/Common/Evaluation/LearningProfile";
import StudentAssessments from "../../components/Common/Placement/StudentAssessments";
import { StudentLearningHistory } from "../../components/Common/LearningHistory";
import type {
  StudentDto,
  StudentQuery,
  StudentState,
} from "../../types/admissions";

function StudentStatusForm({
  student,
  onClose,
  onSaved,
}: {
  student: StudentDto;
  onClose: () => void;
  onSaved: (student: StudentDto) => void;
}) {
  const [form] = Form.useForm<{ status: StudentState; reason: string }>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  return (
    <Modal
      open
      title="Trạng thái hồ sơ học viên"
      okText="Lưu trạng thái"
      cancelText="Hủy"
      confirmLoading={busy}
      onCancel={() => {
        if (!busy) onClose();
      }}
      onOk={() => form.submit()}
      closable={!busy}
      maskClosable={!busy}
      cancelButtonProps={{ disabled: busy }}
    >
      <Alert
        type="info"
        showIcon
        title="Trạng thái hồ sơ không tự đổi các đăng ký lớp"
        description="Trước khi tạm ngừng hoặc hoàn thành hồ sơ, hãy bảo lưu/kết thúc các đăng ký đang học. Muốn ghi danh hoặc học lại, hồ sơ cần ở trạng thái Đang học."
        style={{ marginBottom: 16 }}
      />
      <Form
        form={form}
        initialValues={{ status: student.status }}
        layout="vertical"
        disabled={busy}
        onFinish={async ({ status, reason }) => {
          if (busy) return;
          setBusy(true);
          setError(undefined);
          try {
            onSaved(
              await studentService.status(
                student.id,
                status,
                reason,
                student.version,
              ),
            );
          } catch (e) {
            setError(getErrorMessage(e));
          } finally {
            setBusy(false);
          }
        }}
      >
        {error && (
          <Alert
            type="error"
            showIcon
            title={error}
            style={{ marginBottom: 16 }}
          />
        )}
        <Form.Item
          name="status"
          label="Trạng thái"
          rules={[{ required: true }]}
        >
          <Select
            options={Object.entries(STUDENT_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
          />
        </Form.Item>
        <Form.Item
          name="reason"
          label="Lý do"
          rules={[{ required: true, whitespace: true, min: 3, max: 500 }]}
        >
          <Input.TextArea
            aria-label="Lý do đổi trạng thái hồ sơ"
            rows={3}
            maxLength={500}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
export default function StudentManagement() {
  const { user } = useAuth();
  const { message } = App.useApp();
  const branches = useBranches();
  const [params, setParams] = useSearchParams();
  const id = positiveId(params.get("studentId")) ?? null;
  const [query, setQuery] = useListQuery<StudentQuery>(
    Object.keys(STUDENT_LABELS),
  );
  const focusStudent = (id: number | null) =>
    setParams((p) => {
      const n = new URLSearchParams(p);
      if (id === null) n.delete("studentId");
      else n.set("studentId", String(id));
      return n;
    });
  const list = useRemoteResource(studentService.list, query);
  const detail = useRemoteResource(studentService.detail, { id });
  const [search, setSearch] = useState(query.keyword ?? "");
  const [formState, setFormState] = useState<{
    editing: StudentDto | null;
  } | null>(null);
  const [statusTarget, setStatusTarget] = useState<StudentDto | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  function saved(student: StudentDto) {
    setFormState(null);
    setStatusTarget(null);
    list.reload();
    detail.reload();
    focusStudent(student.id);
    message.success("Đã lưu hồ sơ học viên.");
  }
  async function remove(student: StudentDto) {
    if (busyId !== null) return;
    setBusyId(student.id);
    try {
      await studentService.remove(student.id);
      if (id === student.id) focusStudent(null);
      list.reload();
      message.success("Đã xóa học viên.");
    } catch (e) {
      message.error(getErrorMessage(e));
    } finally {
      setBusyId(null);
    }
  }
  const actions = (student: StudentDto) => (
    <Space wrap>
      <Button
        size="small"
        icon={<Eye size={14} />}
        onClick={() => focusStudent(student.id)}
      >
        Xem
      </Button>
      <Button
        size="small"
        icon={<Pencil size={14} />}
        onClick={() => setFormState({ editing: student })}
      >
        Sửa
      </Button>
      <Button size="small" onClick={() => setStatusTarget(student)}>
        Trạng thái
      </Button>
      <Link to={`/enrollment?studentId=${student.id}`}>
        <Button size="small" type="primary">
          Đăng ký lớp
        </Button>
      </Link>
      <Popconfirm
        title="Xóa học viên?"
        description="Chỉ xóa được hồ sơ chưa có đăng ký và không được Lead chuyển đổi tham chiếu."
        okText="Xóa"
        cancelText="Hủy"
        onConfirm={() => remove(student)}
        disabled={busyId !== null}
      >
        <Button
          size="small"
          danger
          icon={<Trash2 size={14} />}
          disabled={busyId !== null}
          loading={busyId === student.id}
        >
          Xóa
        </Button>
      </Popconfirm>
    </Space>
  );
  const columns: TableColumnsType<StudentDto> = [
    {
      title: "Học viên",
      key: "name",
      width: 230,
      render: (_, s) => (
        <div>
          <Button
            type="link"
            style={{ padding: 0 }}
            onClick={() => focusStudent(s.id)}
          >
            {s.fullName}
          </Button>
          <div>
            <Typography.Text type="secondary">{s.studentCode}</Typography.Text>
          </div>
        </div>
      ),
    },
    {
      title: "Liên hệ",
      key: "phone",
      render: (_, s) => (
        <div>
          {s.phone}
          <div>
            <Typography.Text type="secondary">{s.email}</Typography.Text>
          </div>
        </div>
      ),
    },
    { title: "Trình độ", dataIndex: "currentLevel", render: (v) => v || "—" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (v) => <StudentTag value={v} />,
    },
    {
      title: "Ngày đăng ký",
      dataIndex: "registeredAt",
      render: (v) => displayDate(v, false),
    },
    ...(user?.role === "SUPER_ADMIN"
      ? [
          {
            title: "Chi nhánh",
            dataIndex: "branchId",
            render: (branchId: number) => branchLabel(branches.data, branchId),
          },
        ]
      : []),
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      width: 380,
      render: (_, s) => actions(s),
    },
  ];
  const s = detail.data?.student;
  return (
    <ManagementLayout
      title="Học viên"
      description="Quản lý hồ sơ, liên hệ gia đình và lịch sử đăng ký học."
      actions={
        <>
          <Button
            icon={<RefreshCw size={16} />}
            loading={list.loading}
            onClick={() => {
              list.reload();
              detail.reload();
            }}
          >
            Tải lại
          </Button>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={() => setFormState({ editing: null })}
          >
            Thêm học viên
          </Button>
        </>
      }
    >
      <LoadError error={list.error} reload={list.reload} />
      <Card>
        <Filters>
          <Input.Search
            className="search"
            value={search}
            allowClear
            enterButton
            placeholder="Tìm mã, tên, điện thoại hoặc email"
            onChange={(e) => {
              setSearch(e.target.value);
              if (!e.target.value)
                setQuery((q) => ({ ...q, keyword: undefined, page: 0 }));
            }}
            onSearch={(keyword) =>
              setQuery((q) => ({
                ...q,
                keyword: keyword.trim() || undefined,
                page: 0,
              }))
            }
          />
          <Select
            className="filter"
            aria-label="Trạng thái học viên"
            placeholder="Tất cả trạng thái"
            allowClear
            value={query.status}
            options={Object.entries(STUDENT_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
            onChange={(status) => setQuery((q) => ({ ...q, status, page: 0 }))}
          />
          <BranchFilter
            branches={branches.data}
            value={query.branchId}
            loading={branches.loading}
            onChange={(branchId) =>
              setQuery((q) => ({ ...q, branchId, page: 0 }))
            }
          />
          <Typography.Text type="secondary">
            {list.data?.totalElements ?? 0} học viên
          </Typography.Text>
        </Filters>
        <Table<StudentDto>
          columns={columns}
          rowKey="id"
          dataSource={list.data?.content ?? []}
          loading={list.loading}
          scroll={{ x: 1300 }}
          locale={{
            emptyText: list.error
              ? "Chưa tải được dữ liệu"
              : "Không có học viên phù hợp",
          }}
          pagination={{
            current: query.page + 1,
            pageSize: query.size,
            total: list.data?.totalElements ?? 0,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
            onChange: (page, size) =>
              setQuery((q) => ({
                ...q,
                page: size !== q.size ? 0 : page - 1,
                size,
              })),
          }}
        />
      </Card>
      <Drawer
        open={id !== null}
        onClose={() => focusStudent(null)}
        title="Hồ sơ học viên"
        size={900}
        loading={detail.loading}
      >
        <LoadError error={detail.error} reload={detail.reload} />
        {s && (
          <>
            <Space wrap style={{ marginBottom: 20 }}>
              {actions(s)}
            </Space>
            <Tabs
              items={[
                {
                  key: "profile",
                  label: "Thông tin hồ sơ",
                  children: (
                    <Descriptions
                      bordered
                      column={1}
                      items={[
                        {
                          key: "code",
                          label: "Mã học viên",
                          children: s.studentCode,
                        },
                        { key: "name", label: "Họ tên", children: s.fullName },
                        {
                          key: "birth",
                          label: "Ngày sinh",
                          children: displayDate(s.dateOfBirth, false),
                        },
                        {
                          key: "gender",
                          label: "Giới tính",
                          children:
                            s.gender === "MALE"
                              ? "Nam"
                              : s.gender === "FEMALE"
                                ? "Nữ"
                                : s.gender === "OTHER"
                                  ? "Khác"
                                  : "—",
                        },
                        {
                          key: "status",
                          label: "Trạng thái",
                          children: <StudentTag value={s.status} />,
                        },
                        {
                          key: "phone",
                          label: "Điện thoại",
                          children: s.phone,
                        },
                        {
                          key: "email",
                          label: "Email",
                          children: s.email || "—",
                        },
                        {
                          key: "level",
                          label: "Trình độ text cũ (tham khảo)",
                          children: s.currentLevel || "—",
                        },
                        {
                          key: "guardian",
                          label: "Người giám hộ",
                          children: s.guardianName || "—",
                        },
                        {
                          key: "guardianPhone",
                          label: "Điện thoại giám hộ",
                          children: s.guardianPhone || "—",
                        },
                        {
                          key: "contact",
                          label: "Liên hệ bổ sung",
                          children: s.contactPerson || "—",
                        },
                        {
                          key: "address",
                          label: "Địa chỉ",
                          children: s.address || "—",
                        },
                        {
                          key: "branch",
                          label: "Chi nhánh",
                          children: branchLabel(branches.data, s.branchId),
                        },
                        {
                          key: "date",
                          label: "Ngày tiếp nhận",
                          children: displayDate(s.registeredAt, false),
                        },
                      ]}
                    />
                  ),
                },
                {
                  key: "enrollments",
                  label: "Lịch sử đăng ký",
                  children: (
                    <Table
                      rowKey="id"
                      dataSource={detail.data?.enrollments ?? []}
                      locale={{ emptyText: "Chưa có đăng ký" }}
                      scroll={{ x: 650 }}
                      columns={[
                        { title: "Lớp", dataIndex: "className" },
                        { title: "Mã lớp", dataIndex: "classCode" },
                        {
                          title: "Trạng thái",
                          dataIndex: "studyStatus",
                          render: (v) => <StudyTag value={v} />,
                        },
                        {
                          title: "Ngày ghi danh",
                          dataIndex: "enrolledAt",
                          render: (v) => displayDate(v),
                        },
                        {
                          title: "Chi tiết",
                          render: (_, e) => (
                            <Link
                              to={`/enrollment?studentId=${s.id}&enrollmentId=${e.id}`}
                            >
                              Xem đăng ký
                            </Link>
                          ),
                        },
                      ]}
                    />
                  ),
                },
                {
                  key: "learning",
                  label: "Hồ sơ học tập",
                  children: <LearningProfile key={s.id} studentId={s.id} />,
                },
                {
                  key: "assessment",
                  label: "Đánh giá đầu vào",
                  children: (
                    <StudentAssessments
                      key={s.id}
                      studentId={s.id}
                      legacyLevel={s.currentLevel}
                    />
                  ),
                },
                {
                  key: "history",
                  label: "Lịch sử vòng đời",
                  children: (
                    <StudentLearningHistory
                      key={s.id + ":" + s.version}
                      id={s.id}
                    />
                  ),
                },
              ]}
            />
          </>
        )}
      </Drawer>
      {formState && (
        <StudentForm
          editing={formState.editing}
          defaultBranchId={query.branchId ?? user?.branchId ?? undefined}
          onClose={() => setFormState(null)}
          onSaved={saved}
        />
      )}
      {statusTarget && (
        <StudentStatusForm
          student={statusTarget}
          onClose={() => setStatusTarget(null)}
          onSaved={saved}
        />
      )}
    </ManagementLayout>
  );
}
