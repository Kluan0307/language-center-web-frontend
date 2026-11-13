import {scopeLabel as pageScopeLabel} from '../../utils/managementScope';
import {useListQuery} from '../../hooks/useListQuery';
import TableActions from '../../components/Common/TableActions';
import { CourseDurationPanel } from "../../components/Common/Placement/DurationPanel";
import { durationLabel } from "../../utils/duration";
import {useEffect,useState} from "react";
import { App, Alert, Button, Card, Col, Descriptions, Drawer, Form, Input, InputNumber, Modal, Row, Select, Table, Tag, Typography } from "antd";
import type { TableColumnsType } from "antd";
import { Eye, Pencil, Plus, RefreshCw } from "lucide-react";
import {
  ManagementLayout,
  Filters,
} from "../../components/Layout/ManagementLayout";
import {
  BranchField,
  BranchFilter,
  LoadError,
} from "../../components/Common/Academic";
import { useBranches } from "../../hooks/useBranches";
import { useAuth } from "../../hooks/useAuth";
import { useRemoteResource } from "../../hooks/useRemoteResource";
import { courseService } from "../../services/academicService";
import { applyFormErrors, getErrorMessage } from "../../utils/apiErrors";
import {
  branchLabel,
  canEditCourse,
  canPlan,
  money,
} from "../../utils/academic";
import { Link } from "react-router-dom";
import { CourseAdmissionPanel } from "../../components/Common/Placement/AdmissionPanel";
import type {
  CourseDto,
  CourseQuery,
  CourseRequest,
} from "../../types/academic";

export default function CourseManagement() {
  const { user } = useAuth();
  const { message } = App.useApp();
  const branches = useBranches();
  const [query, setQuery] = useListQuery<CourseQuery>(['OPEN','CLOSED']);
  const list = useRemoteResource(courseService.list, query);
  const [search, setSearch] = useState(query.keyword??'');
 useEffect(()=>setSearch(query.keyword??''),[query.keyword]);
  const [form] = Form.useForm<CourseRequest>();
  const [editing, setEditing] = useState<CourseDto | null>(null);
  const [detail, setDetail] = useState<CourseDto | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string>();
  if (!user) return null;
  const manager = canPlan(user.role);
  function openForm(course: CourseDto | null) {
    form.resetFields();
    setEditing(course);
    setError(undefined);
    form.setFieldsValue(
      course
        ? {
            ...course,
            expectedMinutes: course.expectedMinutes ?? undefined,
            branchId: course.branchId ?? 0,
            type: course.type ?? "",
            level: course.level ?? "",
            content: course.content ?? "",
            entryRequirement: course.entryRequirement ?? "",
          }
        : { branchId: query.branchId ?? 0, maxStudents: 20 },
    );
    setOpen(true);
  }
  async function save(values: CourseRequest) {
    if (
      !user ||
      busy ||
      (editing ? !canEditCourse(user.role, editing) : !canPlan(user.role))
    )
      return;
    setBusy(true);
    setError(undefined);
    const payload: CourseRequest = {
      ...values,
      code: values.code.trim(),
      name: values.name.trim(),
      type: values.type?.trim() || undefined,
      level: values.level?.trim() || undefined,
      content: values.content?.trim() || undefined,
      entryRequirement: values.entryRequirement?.trim() || undefined,
      duration: editing?.duration ?? undefined,
      expectedMinutes: editing ? undefined : values.expectedMinutes,
      tuitionFee:
        user.role === "STAFF" && editing
          ? editing.tuitionFee
          : values.tuitionFee,
      branchId: editing
        ? editing.branchId
        : user.role === "SUPER_ADMIN"
          ? values.branchId === 0
            ? null
            : values.branchId
          : undefined,
    };
    try {
      const saved = await courseService.save(editing?.id ?? null, payload);
      if (detail?.id === saved.id) setDetail(saved);
      message.success(editing ? "Đã cập nhật khóa học." : "Đã tạo khóa học.");
      setOpen(false);
      list.reload();
    } catch (e) {
      applyFormErrors(form, e);
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function toggle(course: CourseDto) {
    if (!user || !canEditCourse(user.role, course) || busyId !== null) return;
    setBusyId(course.id);
    try {
      const saved = await courseService.status(
        course.id,
        course.status === "OPEN" ? "CLOSED" : "OPEN",
      );
      if (detail?.id === saved.id) setDetail(saved);
      message.success("Đã cập nhật trạng thái khóa học.");
      list.reload();
    } catch (e) {
      message.error(getErrorMessage(e));
    } finally {
      setBusyId(null);
    }
  }
  const columns: TableColumnsType<CourseDto> = [
    {
      title: "Khóa học",
      key: "name",
      width: 260,
      render: (_, c) => (
        <div>
          <Button
            type="link"
            style={{ padding: 0 }}
            onClick={() => setDetail(c)}
          >
            {c.name}
          </Button>
          <div>
            <Typography.Text type="secondary">{c.code}</Typography.Text>
          </div>
        </div>
      ),
    },
    {
      title: "Phạm vi",
      dataIndex: "branchId",
      render: (id: number | null) =>
        id === null ? (
          <Tag color="purple">Khóa chung</Tag>
        ) : (
          branchLabel(branches.data, id)
        ),
    },
    {
      title: "Phân loại",
      key: "type",
      render: (_, c) => (
        <div>
          {c.type || "—"}
          <div>
            <Typography.Text type="secondary">{c.level}</Typography.Text>
          </div>
        </div>
      ),
    },
    {
      title: "Kế hoạch thời lượng",
      key: "duration",
      render: (_, c) => (
        <>
          {durationLabel(c.expectedMinutes)}
          {c.expectedMinutes === null && (
            <div>Giá trị cũ chưa rõ đơn vị: {c.duration ?? "—"}</div>
          )}
        </>
      ),
    },
    { title: "Học phí", dataIndex: "tuitionFee", render: money },
    { title: "Giới hạn sĩ số", dataIndex: "maxStudents" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status === "OPEN" ? "green" : "default"}>
          {status === "OPEN" ? "Đang mở" : "Đã đóng"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right" as const,
      width: 160,
      render: (_, c) => (
        <TableActions items={[
    ...((canEditCourse(user.role, c)) ? ([
        {
            key: "action-1", label: "Sửa", icon: <Pencil size={14}/>, onClick: () => openForm(c)
        },
        {
            key: "action-2", label: c.status === "OPEN" ? "Đóng" : "Mở", loading: busyId === c.id, disabled: busyId !== null, confirm: {
                title: c.status === "OPEN" ? "Đóng khóa học?" : "Mở khóa học?", okText: "Xác nhận", cancelText: "Hủy", content: "Lịch sử lớp và học phí đã chốt vẫn được giữ.", okButtonProps: {
                    danger: false
                }, onOk: () => toggle(c)
            }
        }
    ]) : [])
]}><Button size="small" icon={<Eye size={14}/>} onClick={() => setDetail(c)}>
            Xem
          </Button></TableActions>
      ),
    },
  ];
  return (
    <ManagementLayout scopeLabel={pageScopeLabel(user,branches.data,query.branchId,false)}
      title="Khóa học"
      description="Quản lý nội dung đào tạo, học phí và giới hạn sĩ số."
      actions={
        <>
          {user.role === "SUPER_ADMIN" && (
            <Link to="/programs"><Button>Chương trình và trình độ</Button></Link>
          )}
          <Button
            icon={<RefreshCw size={16} />}
            loading={list.loading}
            onClick={list.reload}
          >
            Tải lại
          </Button>
          {manager && (
            <Button
              type="primary"
              icon={<Plus size={16} />}
              onClick={() => openForm(null)}
            >
              Thêm khóa học
            </Button>
          )}
        </>
      }
    >
      {user.role === "STAFF" && (
        <Alert
          type="info"
          showIcon
          title="Bạn có thể cập nhật thông tin khóa của chi nhánh; học phí và khóa chung do quản trị viên quản lý."
        />
      )}
      <LoadError error={list.error} reload={list.reload} />
      <Card>
        <Filters>
          <Input.Search
            className="search"
            allowClear
            enterButton
            value={search}
            placeholder="Tìm mã hoặc tên khóa học"
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
            aria-label="Trạng thái khóa"
            placeholder="Tất cả trạng thái"
            allowClear
            value={query.status}
            options={[
              { value: "OPEN", label: "Đang mở" },
              { value: "CLOSED", label: "Đã đóng" },
            ]}
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
            {list.loading?'Đang tải…':list.error?'—':list.data?.totalElements??'—'} khóa học
          </Typography.Text>
        </Filters>
        {!list.error&&<Table<CourseDto>
          rowKey="id"
          columns={columns}
          dataSource={list.data?.content ?? []}
          loading={list.loading}
          scroll={{ x: 1150 }}
          locale={{
            emptyText: list.error
              ? "Chưa tải được dữ liệu"
              : "Không có khóa học phù hợp",
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
        />}
      </Card>
      <Modal
        open={open}
        title={editing ? "Chỉnh sửa khóa học" : "Thêm khóa học"}
        width={760}
        forceRender
        okText="Lưu khóa học"
        cancelText="Hủy"
        onOk={() => form.submit()}
        onCancel={() => {
          if (!busy) setOpen(false);
        }}
        confirmLoading={busy}
        closable={!busy}
        maskClosable={!busy}
        cancelButtonProps={{ disabled: busy }}
      >
        <Form
          name="courseBasic"
          form={form}
          layout="vertical"
          onFinish={save}
          disabled={busy}
        >
          {error && (
            <Alert
              type="error"
              showIcon
              title={error}
              style={{ marginBottom: 16 }}
            />
          )}
          <LoadError error={branches.error} reload={branches.reload} />
          <BranchField
            shared
            editing={!!editing}
            branches={branches.data}
            loading={branches.loading}
          />
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="code"
                label="Mã khóa học"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: "Nhập mã khóa học.",
                  },
                  { max: 255 },
                ]}
              >
                <Input maxLength={255} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label="Tên khóa học"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: "Nhập tên khóa học.",
                  },
                  { max: 255 },
                ]}
              >
                <Input maxLength={255} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="type" label="Loại khóa" rules={[{ max: 255 }]}>
                <Input
                  maxLength={255}
                  placeholder="Ví dụ: IELTS, TOEIC, Giao tiếp"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="level"
                label="Trình độ ghi nhận ban đầu"
                rules={[{ max: 255 }]}
              >
                <Input maxLength={255} placeholder="Ví dụ: A1, B1, IELTS 5.5" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="expectedMinutes"
                label="Kế hoạch (phút)"
                rules={
                  editing
                    ? []
                    : [
                        {
                          required: true,
                          message: "Nhập số phút đã xác minh.",
                        },
                        { type: "integer", min: 1, max: 600000 },
                      ]
                }
                extra={
                  editing
                    ? "Đổi kế hoạch trong phần Chi tiết → Thời lượng."
                    : "90 phút = 1 giờ 30 phút."
                }
              >
                <InputNumber
                  min={1}
                  max={600000}
                  precision={0}
                  disabled={!!editing}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="maxStudents"
                label="Giới hạn sĩ số"
                rules={[{ required: true }, { type: "number", min: 1 }]}
              >
                <InputNumber
                  min={1}
                  max={2147483647}
                  precision={0}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="tuitionFee"
                label="Học phí (VND)"
                rules={[
                  { required: true, message: "Nhập học phí." },
                  { type: "number", min: 0.01, max: 9999999999999.99 },
                ]}
              >
                <InputNumber
                  min={0.01}
                  max={9999999999999.99}
                  precision={2}
                  disabled={user.role === "STAFF"}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="entryRequirement"
            label="Yêu cầu đầu vào tham khảo"
          >
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="content" label="Nội dung đào tạo">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
      <Drawer
        open={!!detail}
        title="Thông tin khóa học"
        onClose={() => setDetail(null)}
        size={540}
      >
        {detail && (
          <>
            <CourseDurationPanel
              key={"time" + detail.id}
              id={detail.id}
              onChanged={() => {
                list.reload();
                void courseService.detail({ id: detail.id }).then((fresh) => {
                  if (fresh) setDetail(current=>current?.id===fresh.id?fresh:current);
                });
              }}
            />
            <CourseAdmissionPanel key={detail.id} id={detail.id} />
            <Descriptions
              column={1}
              bordered
              items={[
                { key: "code", label: "Mã", children: detail.code },
                { key: "name", label: "Tên", children: detail.name },
                {
                  key: "branch",
                  label: "Phạm vi",
                  children: branchLabel(branches.data, detail.branchId),
                },
                {
                  key: "type",
                  label: "Loại khóa",
                  children: detail.type || "—",
                },
                {
                  key: "level",
                  label: "Trình độ",
                  children: detail.level || "—",
                },
                {
                  key: "duration",
                  label: "Kế hoạch thời lượng",
                  children: durationLabel(detail.expectedMinutes),
                },
                {
                  key: "legacyDuration",
                  label: "Giá trị cũ chưa rõ đơn vị",
                  children: detail.duration ?? "—",
                },
                {
                  key: "fee",
                  label: "Học phí",
                  children: money(detail.tuitionFee),
                },
                {
                  key: "capacity",
                  label: "Giới hạn sĩ số",
                  children: detail.maxStudents,
                },
                {
                  key: "status",
                  label: "Trạng thái",
                  children: detail.status === "OPEN" ? "Đang mở" : "Đã đóng",
                },
                {
                  key: "entry",
                  label: "Điều kiện đầu vào",
                  children: detail.entryRequirement || "—",
                },
                {
                  key: "content",
                  label: "Nội dung",
                  children: (
                    <Typography.Paragraph
                      style={{ whiteSpace: "pre-wrap", margin: 0 }}
                    >
                      {detail.content || "—"}
                    </Typography.Paragraph>
                  ),
                },
              ]}
            />
          </>
        )}
      </Drawer>
    </ManagementLayout>
  );
}
