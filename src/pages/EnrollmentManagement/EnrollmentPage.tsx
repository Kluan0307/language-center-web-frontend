import {scopeLabel as pageScopeLabel} from '../../utils/managementScope';
import TableActions from '../../components/Common/TableActions';
import {
  ExceptionList,
  EnrollmentAdmissionHistory,
} from "../../components/Common/Placement/EnrollmentPlacement";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Alert,
  App,
  Button,
  Card,
  Descriptions,
  Drawer,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type { TableColumnsType } from "antd";
import { ArrowRightLeft, Eye, Plus, RefreshCw } from "lucide-react";
import {
  ManagementLayout,
  Filters,
} from "../../components/Layout/ManagementLayout";
import { BranchFilter, LoadError } from "../../components/Common/Academic";
import { DeliveryTag, StudyTag } from "../../components/Common/Admissions";
import { useAuth } from "../../hooks/useAuth";
import { useBranches } from "../../hooks/useBranches";
import { useRemoteResource } from "../../hooks/useRemoteResource";
import { classService } from "../../services/academicService";
import {
  enrollmentService,
  studentService,
} from "../../services/admissionsService";
import { branchLabel, money, businessDate } from "../../utils/academic";
import {
  nextStudyStates,
  positiveId,
  STUDY_LABELS,
} from "../../utils/admissions";
import { getErrorMessage } from "../../utils/apiErrors";
import { displayDate } from "../../utils/display";
import EnrollmentForm from "./EnrollmentForm";
import { useListQuery } from "../../hooks/useListQuery";
import CompletionPanel from "../../components/Common/Evaluation/CompletionPanel";
import EnrollmentActions from "./EnrollmentActions";
import { EnrollmentLearningHistory } from "../../components/Common/LearningHistory";
import type { EnrollmentDto, EnrollmentQuery } from "../../types/admissions";

export default function EnrollmentPage() {
  const { user } = useAuth();
  const { message } = App.useApp();
  const branches = useBranches();
  const [params, setParams] = useSearchParams();
  const studentId = positiveId(params.get("studentId"));
  const classId = positiveId(params.get("classId"));
  const selectedId = positiveId(params.get("enrollmentId")) ?? null;
  const [query, setQuery] = useListQuery<EnrollmentQuery>([
    "STUDYING",
    "RESERVED",
    "COMPLETED",
    "DROPPED",
    "TRANSFERRED",
  ]);
  const list = useRemoteResource(enrollmentService.list, {
    ...query,
    studentId,
    classId,
  });
  const classes = useRemoteResource(classService.all, {
    branchId: query.branchId,
  });
  const selectedStudent = useRemoteResource(studentService.detail, {
    id: studentId ?? null,
  });
  const selectedClass = useRemoteResource(classService.detail, {
    id: classId ?? null,
  });
  const detail = useRemoteResource(enrollmentService.detail, {
    id: selectedId,
  });
  const billing = useRemoteResource(enrollmentService.billing, {
    id: selectedId,
  });
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [action, setAction] = useState<{
    record: EnrollmentDto;
    mode: "status" | "transfer";
  } | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  function refresh() {
    list.reload();
    detail.reload();
    billing.reload();
    classes.reload();
    selectedStudent.reload();
  }
  function focus(record: EnrollmentDto) {
    setParams({
      studentId: String(record.studentId),
      enrollmentId: String(record.id),
    });
    setQuery((q) => ({
      ...q,
      page: 0,
      keyword: undefined,
      studyStatus: undefined,
      branchId: user?.role === "SUPER_ADMIN" ? record.branchId : undefined,
    }));
    setSearch("");
    refresh();
  }
  function created(record: EnrollmentDto, recovered = false) {
    setCreateOpen(false);
    focus(record);
    message.success(
      recovered
        ? "Đã tìm thấy đăng ký đã lưu."
        : "Đã ghi danh. Kiểm tra kết quả tạo học phí trong chi tiết.",
    );
  }
  async function retry(record: EnrollmentDto) {
    if (busyId !== null) return;
    setBusyId(record.id);
    try {
      const result = await enrollmentService.retry(record.id);
      if (result.status === "CREATED")
        message.success("Đã xác nhận học phí được tạo.");
      else
        message.warning(
          "Đăng ký vẫn được giữ. Chưa tạo được học phí; hãy kiểm tra Finance rồi thử lại.",
        );
      refresh();
    } catch (e) {
      message.error(getErrorMessage(e));
    } finally {
      setBusyId(null);
    }
  }
  const actions = (record: EnrollmentDto, includeView = true) => (
    <TableActions items={[
        ...((nextStudyStates(record.studyStatus).length > 0) ? ([
            {
                key: "action-1", label: record.studyStatus === "RESERVED" ? "Học lại / ngừng" : "Trạng thái", onClick: () => setAction({
                    record, mode: "status"
                })
            }
        ]) : []), ...(((record.studyStatus === "STUDYING" ||
            record.studyStatus === "RESERVED")) ? ([
            {
                key: "action-2", label: "Chuyển lớp", icon: <ArrowRightLeft size={14}/>, onClick: () => setAction({
                    record, mode: "transfer"
                })
            }
        ]) : []), ...((record.tuitionDelivery !== "CREATED") ? ([
            {
                key: "action-3", label: "Thử tạo học phí", disabled: busyId !== null, loading: busyId === record.id, onClick: () => void retry(record)
            }
        ]) : [])
    ]}>{includeView && (<Button size="small" icon={<Eye size={14}/>} onClick={() => setParams((p) => {
            const next = new URLSearchParams(p);
            next.set("enrollmentId", String(record.id));
            return next;
        })}>
          Xem
        </Button>)}</TableActions>
  );
  const columns: TableColumnsType<EnrollmentDto> = [
    { title: "Học viên", dataIndex: "studentName", width: 200 },
    {
      title: "Lớp",
      key: "class",
      width: 220,
      render: (_, e) => (
        <div>
          {e.className}
          <div>
            <Typography.Text type="secondary">{e.classCode}</Typography.Text>
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái học",
      dataIndex: "studyStatus",
      render: (v) => <StudyTag value={v} />,
    },
    {
      title: "Dự kiến học lại",
      dataIndex: "expectedReturnDate",
      render: (v: string | null, e: EnrollmentDto) => (
        <>
          {displayDate(v, false)}
          {e.studyStatus === "RESERVED" && v && v < businessDate() && (
            <Tag color="orange">Quá ngày dự kiến</Tag>
          )}
        </>
      ),
    },
    {
      title: "Tạo học phí",
      dataIndex: "tuitionDelivery",
      render: (v) => <DeliveryTag value={v} />,
    },
    {
      title: "Ngày ghi danh",
      dataIndex: "enrolledAt",
      render: (v) => displayDate(v),
    },
    ...(user?.role === "SUPER_ADMIN"
      ? [
          {
            title: "Chi nhánh",
            dataIndex: "branchId",
            render: (id: number) => branchLabel(branches.data, id),
          },
        ]
      : []),
    {
      title: "Thao tác",
      key: "actions",
      width: 160,
      fixed: "right",
      render: (_, e) => actions(e),
    },
  ];
  const record = detail.data;
  return (
    <ManagementLayout scopeLabel={pageScopeLabel(user,branches.data,query.branchId,false)}
      title="Đăng ký & xếp lớp"
      description="Ghi danh, theo dõi trạng thái học và giữ đúng học phí khi bảo lưu hoặc chuyển lớp."
      actions={
        <>
          <Button
            icon={<RefreshCw size={16} />}
            loading={list.loading}
            onClick={refresh}
          >
            Tải lại
          </Button>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            disabled={
              selectedStudent.loading ||
              selectedClass.loading ||
              !!selectedStudent.error ||
              !!selectedClass.error
            }
            onClick={() => setCreateOpen(true)}
          >
            Ghi danh
          </Button>
        </>
      }
    >
      <LoadError error={list.error} reload={list.reload} />
      <LoadError
        error={selectedStudent.error}
        reload={selectedStudent.reload}
      />
      <LoadError error={selectedClass.error} reload={selectedClass.reload} />
      {selectedStudent.data && (
        <Alert
          type="info"
          showIcon
          title={`Đang xem đăng ký của ${selectedStudent.data.student.fullName} · ${selectedStudent.data.student.studentCode}`}
          action={
            <Button
              onClick={() =>
                setParams((p) => {
                  const next = new URLSearchParams(p);
                  next.delete("studentId");
                  return next;
                })
              }
            >
              Bỏ lọc học viên
            </Button>
          }
        />
      )}
      <Card>
        <Filters>
          <Input.Search
            className="search"
            placeholder="Tên, điện thoại hoặc mã/tên lớp"
            value={search}
            allowClear
            enterButton
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
            placeholder="Tất cả trạng thái học"
            allowClear
            value={query.studyStatus}
            aria-label="Trạng thái đăng ký"
            options={Object.entries(STUDY_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
            onChange={(studyStatus) =>
              setQuery((q) => ({ ...q, studyStatus, page: 0 }))
            }
          />
          <Select
            className="filter"
            style={{ minWidth: 240 }}
            placeholder="Tất cả lớp"
            allowClear
            showSearch
            optionFilterProp="label"
            value={classId}
            loading={classes.loading}
            options={classes.data?.map((c) => ({
              value: c.id,
              label: `${c.code} · ${c.name}`,
            }))}
            onChange={(id: number | undefined) => {
              setParams((p) => {
                const next = new URLSearchParams(p);
                if (id) next.set("classId", String(id));
                else next.delete("classId");
                return next;
              });
              setQuery((q) => ({ ...q, page: 0 }));
            }}
          />
          <BranchFilter
            branches={branches.data}
            value={query.branchId}
            loading={branches.loading}
            onChange={(branchId) => {
              setQuery((q) => ({ ...q, branchId, page: 0 }));
              setParams(p=>{const n=new URLSearchParams(p);for(const k of ["classId","enrollmentId","studentId"])n.delete(k);return n;});
            }}
          />
          <Typography.Text type="secondary">
            {list.loading?'Đang tải…':list.error?'—':list.data?.totalElements??'—'} đăng ký
          </Typography.Text>
        </Filters>
        <LoadError error={classes.error} reload={classes.reload} />
        {!list.error&&<Table<EnrollmentDto>
          columns={columns}
          rowKey="id"
          dataSource={list.data?.content ?? []}
          loading={list.loading}
          scroll={{ x: 1450 }}
          locale={{
            emptyText: list.error
              ? "Chưa tải được dữ liệu"
              : "Không có đăng ký phù hợp",
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
      <Card title="Đề nghị ngoại lệ phân lớp">
        <ExceptionList studentId={studentId} classId={classId} />
      </Card>
      <Drawer
        open={selectedId !== null}
        title="Chi tiết đăng ký"
        onClose={() =>
          setParams((p) => {
            const next = new URLSearchParams(p);
            next.delete("enrollmentId");
            return next;
          })
        }
        size={780}
        loading={detail.loading}
      >
        <LoadError error={detail.error} reload={detail.reload} />
        {record && (
          <>
            <Space wrap style={{ marginBottom: 16 }}>
              {actions(record, false)}
            </Space>
            {record.tuitionDelivery !== "CREATED" && (
              <Alert
                showIcon
                type={record.tuitionDelivery === "FAILED" ? "warning" : "info"}
                style={{ marginBottom: 16 }}
                title="Đăng ký đã được lưu, học phí chưa được xác nhận tạo thành công"
                description="Không ghi danh lại. Hãy tải lại để kiểm tra hoặc thử tạo học phí sau khi Finance hoạt động."
              />
            )}
            <CompletionPanel
              key={record.id + ":" + record.version}
              record={record}
              onSaved={() => {
                detail.reload();
                list.reload();
              }}
            />
            <Descriptions
              bordered
              column={1}
              items={[
                { key: "id", label: "Đăng ký", children: `#${record.id}` },
                {
                  key: "student",
                  label: "Học viên",
                  children: record.studentName,
                },
                {
                  key: "class",
                  label: "Lớp hiện tại",
                  children: `${record.classCode} · ${record.className}`,
                },
                {
                  key: "status",
                  label: "Trạng thái học",
                  children: <StudyTag value={record.studyStatus} />,
                },
                {
                  key: "return",
                  label: "Bảo lưu / dự kiến học lại",
                  children:
                    record.studyStatus === "RESERVED"
                      ? displayDate(record.reservedSince, false) +
                        " → " +
                        displayDate(record.expectedReturnDate, false)
                      : "—",
                },
                {
                  key: "delivery",
                  label: "Tạo học phí",
                  children: <DeliveryTag value={record.tuitionDelivery} />,
                },
                {
                  key: "root",
                  label: "Đăng ký tính phí gốc",
                  children:
                    record.billingEnrollmentId &&
                    record.billingEnrollmentId !== record.id ? (
                      <Button
                        type="link"
                        style={{ padding: 0 }}
                        onClick={() =>
                          setParams((p) => {
                            const next = new URLSearchParams(p);
                            next.set(
                              "enrollmentId",
                              String(record.billingEnrollmentId),
                            );
                            return next;
                          })
                        }
                      >
                        #{record.billingEnrollmentId}
                      </Button>
                    ) : (
                      `#${record.billingEnrollmentId ?? record.id}`
                    ),
                },
                {
                  key: "date",
                  label: "Ghi danh lúc",
                  children: displayDate(record.enrolledAt),
                },
                {
                  key: "by",
                  label: "Người ghi danh",
                  children: record.registeredByName || "—",
                },
              ]}
            />
            {record.tuitionDelivery === "CREATED" && (
              <Link
                to={`/tuition?studentId=${record.studentId}&enrollmentId=${record.billingEnrollmentId ?? record.id}`}
              >
                <Button style={{ marginTop: 16 }}>
                  Xem học phí & thu tiền
                </Button>
              </Link>
            )}
            <Typography.Title level={5}>Thông tin học phí gốc</Typography.Title>
            <LoadError error={billing.error} reload={billing.reload} />
            {billing.data && (
              <Descriptions
                bordered
                column={1}
                items={[
                  {
                    key: "course",
                    label: "Khóa học",
                    children: billing.data.courseName,
                  },
                  {
                    key: "class",
                    label: "Lớp ghi danh gốc",
                    children: billing.data.className,
                  },
                  {
                    key: "fee",
                    label: "Giá đã chốt",
                    children: money(billing.data.tuitionFee),
                  },
                  {
                    key: "due",
                    label: "Hạn đóng gốc",
                    children: displayDate(billing.data.dueDate, false),
                  },
                ]}
              />
            )}
            <EnrollmentAdmissionHistory
              id={record.id}
              version={record.version}
            />
            <EnrollmentLearningHistory
              key={record.id}
              id={record.id}
              revision={record.version}
            />
            <Typography.Paragraph type="secondary" style={{ marginTop: 16 }}>
              Trạng thái “Đã tạo học phí” không có nghĩa học viên đã thanh toán.
              Số thu và công nợ được quản lý ở phần Tài chính.
            </Typography.Paragraph>
          </>
        )}
      </Drawer>
      {createOpen && (
        <EnrollmentForm
          initialStudent={selectedStudent.data?.student}
          initialClass={selectedClass.data?.schoolClass}
          defaultBranchId={query.branchId ?? user?.branchId ?? undefined}
          onClose={() => setCreateOpen(false)}
          onSaved={created}
          onExisting={(existing) => {
            setCreateOpen(false);
            focus(existing);
          }}
        />
      )}
      {action && (
        <EnrollmentActions
          record={action.record}
          mode={action.mode}
          onClose={() => setAction(null)}
          onSaved={(saved) => {
            setAction(null);
            focus(saved);
            message.success("Đã cập nhật đăng ký học.");
          }}
        />
      )}
    </ManagementLayout>
  );
}
