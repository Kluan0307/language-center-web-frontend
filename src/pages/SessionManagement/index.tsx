import TableActions from '../../components/Common/TableActions';
import { ClassTimeProgress } from "../../components/Common/Placement/DurationPanel";
import { durationLabel, sessionMinutes } from "../../utils/duration";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Alert, App, Button, Card, DatePicker, Select, Table, Tag, Typography } from "antd";
import dayjs from "dayjs";
import {
  ManagementLayout,
  Filters,
} from "../../components/Layout/ManagementLayout";
import { BranchFilter, LoadError } from "../../components/Common/Academic";
import { useAuth } from "../../hooks/useAuth";
import { useBranches } from "../../hooks/useBranches";
import { useRemoteResource } from "../../hooks/useRemoteResource";
import { sessionService } from "../../services/sessionService";
import { classService } from "../../services/academicService";
import { businessDate, branchLabel } from "../../utils/academic";
import { positiveId } from "../../utils/admissions";
import { displayDate } from "../../utils/display";
import { getErrorMessage } from "../../utils/apiErrors";
import {
  SESSION_LABELS,
  isSubstitute,
  attendanceLink,
} from "../../utils/sessions";
import SessionEditor from "./SessionEditor";
import type { EditMode } from "./SessionEditor";
import GenerateSessions from "./GenerateSessions";
import SessionDetails from "./SessionDetails";
import type { ClassSession, SessionQuery } from "../../types/session";
export default function SessionManagement() {
  const { user } = useAuth();
  const { message } = App.useApp();
  const [params, setParams] = useSearchParams();
  const classId = positiveId(params.get("classId"));
  const manager = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";
  const teacher = user?.role === "TEACHER";
  const today = businessDate();
  const [query, setQuery] = useState<SessionQuery>({
    page: 0,
    size: 10,
    from: dayjs(today).subtract(7, "day").format("YYYY-MM-DD"),
    to: dayjs(today).add(30, "day").format("YYYY-MM-DD"),
  });
  const valid = !query.from || !query.to || query.from <= query.to;
  const list = useRemoteResource(sessionService.list, { ...query, classId });
  const classes = useRemoteResource(classService.all, {
    branchId: query.branchId,
  });
  const branches = useBranches();
  const [timeRevision, setTimeRevision] = useState(0);
  const [editing, setEditing] = useState<{
    session: ClassSession;
    mode: EditMode;
  } | null>(null);
  const [generate, setGenerate] = useState(false);
  const [detail, setDetail] = useState<number | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const classOptions = new Map(
    classes.data?.map((c) => [
      c.id,
      { value: c.id, label: c.code + " · " + c.name },
    ]),
  );
  list.data?.content.forEach((s) =>
    classOptions.set(s.classId, {
      value: s.classId,
      label: s.classCode + " · " + s.className,
    }),
  );
  async function edit(s: ClassSession, mode: EditMode) {
    if (busy) return;
    setBusy(s.id);
    try {
      const fresh = await sessionService.detail({ id: s.id });
      if (fresh) setEditing({ session: fresh, mode });
    } catch (e) {
      message.error(getErrorMessage(e));
    } finally {
      setBusy(null);
    }
  }
  return (
    <ManagementLayout
      title={teacher ? "Lịch dạy thực tế" : "Buổi học thực tế"}
      description="Ngày, giờ, phòng và giáo viên thực tế của từng buổi; bao gồm học bù và dạy thay."
      actions={
        <>
          <Button
            onClick={() => {
              list.reload();
              classes.reload();
            }}
            loading={list.loading}
          >
            Tải lại
          </Button>
          {manager && (
            <>
              <Link
                to={
                  "/schedule?view=weekly" +
                  (classId ? "&classId=" + classId : "")
                }
              >
                <Button>Lịch mẫu tuần</Button>
              </Link>
              <Button
                type="primary"
                onClick={() => setGenerate(true)}
                disabled={classes.loading || !!classes.error}
              >
                Sinh buổi từ lịch tuần
              </Button>
            </>
          )}
        </>
      }
    >
      <Alert
        showIcon
        type="info"
        title={
          teacher
            ? "Bạn chỉ thấy các buổi thực tế được giao, kể cả dạy thay."
            : "Lịch mẫu và buổi thực tế được quản lý riêng."
        }
        description={
          teacher
            ? "Dạy thay chỉ cấp quyền xem và điểm danh buổi đó; điểm và tài liệu của lớp vẫn theo giáo viên phụ trách."
            : "Thay đổi lịch mẫu chỉ tác động các buổi từ ngày mai chưa chỉnh riêng hoặc điểm danh. Buổi đã lưu chỉ Admin sửa điểm danh với lý do."
        }
      />
      {classId && (!teacher || classes.data?.some((c) => c.id === classId)) && (
        <Card>
          <ClassTimeProgress id={classId} revision={timeRevision} />
        </Card>
      )}
      <LoadError error={list.error} reload={list.reload} />
      <LoadError error={classes.error} reload={classes.reload} />
      <Card>
        <Filters>
          <BranchFilter
            branches={branches.data}
            value={query.branchId}
            onChange={(branchId) => {
              setQuery((q) => ({ ...q, branchId, page: 0 }));
              setParams({});
            }}
          />
          <Select
            className="filter"
            style={{ minWidth: 280 }}
            aria-label="Lọc lớp buổi học"
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="Tất cả lớp"
            value={classId}
            options={[...classOptions.values()]}
            onChange={(id: number | undefined) => {
              setParams(id ? { classId: String(id) } : {});
              setQuery((q) => ({ ...q, page: 0 }));
            }}
          />
          <DatePicker
            aria-label="Buổi từ ngày"
            placeholder="Từ ngày"
            format="DD/MM/YYYY"
            value={query.from ? dayjs(query.from) : null}
            needConfirm={false}
            onChange={(d) =>
              setQuery((q) => ({
                ...q,
                from: d?.format("YYYY-MM-DD"),
                page: 0,
              }))
            }
          />
          <DatePicker
            aria-label="Buổi đến ngày"
            placeholder="Đến ngày"
            format="DD/MM/YYYY"
            value={query.to ? dayjs(query.to) : null}
            needConfirm={false}
            onChange={(d) =>
              setQuery((q) => ({ ...q, to: d?.format("YYYY-MM-DD"), page: 0 }))
            }
          />
          <Select
            className="filter"
            aria-label="Trạng thái buổi"
            placeholder="Tất cả trạng thái"
            allowClear
            value={query.status}
            options={Object.entries(SESSION_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
            onChange={(status) => setQuery((q) => ({ ...q, status, page: 0 }))}
          />
          <Typography.Text type="secondary">
            {list.data?.totalElements ?? 0} buổi
          </Typography.Text>
        </Filters>
        {!valid && (
          <Alert type="warning" title="Từ ngày không được sau đến ngày" />
        )}
        <Table<ClassSession>
          rowKey="id"
          loading={list.loading}
          dataSource={valid ? (list.data?.content ?? []) : []}
          scroll={{ x: 1250 }}
          columns={[
            {
              title: "Ngày / giờ",
              key: "date",
              render: (_, s) => (
                <>
                  <strong>{displayDate(s.sessionDate, false)}</strong>
                  <div>
                    {s.startTime
                      ? s.startTime + " – " + s.endTime
                      : "Giờ chưa xác minh"}
                  </div>
                </>
              ),
            },
            {
              title: "Thời lượng buổi",
              key: "minutes",
              render: (_, s) =>
                durationLabel(sessionMinutes(s.startTime, s.endTime)),
            },
            {
              title: "Lớp",
              key: "class",
              render: (_, s) => (
                <>
                  {s.className}
                  <div>
                    <Typography.Text type="secondary">
                      {s.classCode}
                    </Typography.Text>
                  </div>
                </>
              ),
            },
            {
              title: "Giáo viên thực tế",
              key: "teacher",
              render: (_, s) => (
                <>
                  {s.teacherName ?? "Chưa xác minh"}
                  {isSubstitute(s) && (
                    <div>
                      <Tag color="orange">Dạy thay</Tag>
                      <Typography.Text type="secondary">
                        Kế hoạch: {s.plannedTeacherName}
                      </Typography.Text>
                    </div>
                  )}
                </>
              ),
            },
            {
              title: "Phòng",
              dataIndex: "roomName",
              render: (v) => v ?? "Chưa xác minh",
            },
            {
              title: "Trạng thái",
              key: "status",
              render: (_, s) => (
                <>
                  <Tag
                    color={
                      s.status === "COMPLETED"
                        ? "green"
                        : s.status === "CANCELLED"
                          ? "default"
                          : "blue"
                    }
                  >
                    {SESSION_LABELS[s.status]}
                  </Tag>
                  {s.kind === "MAKEUP" && (
                    <Tag color="cyan">Học bù #{s.makeupForId}</Tag>
                  )}
                  {s.kind === "LEGACY" && <Tag>Lịch sử chuyển đổi</Tag>}
                </>
              ),
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
              width: 230,
              render: (_, s) => (
                <TableActions items={[
    ...((manager && !s.classClosed && s.status === "SCHEDULED") ? ([
        {
            key: "action-1", label: "Đổi lịch / dạy thay", disabled: busy !== null, onClick: () => void edit(s, "edit")
        },
        {
            key: "action-2", label: "Hủy buổi", disabled: busy !== null, danger: true, onClick: () => void edit(s, "cancel")
        }
    ]) : []), ...((manager && !s.classClosed && s.status === "CANCELLED") ? ([
        {
            key: "action-3", label: "Khôi phục", disabled: busy !== null, onClick: () => void edit(s, "restore")
        },
        ...((s.kind === "REGULAR" && !s.makeupSessionId) ? ([
            {
                key: "action-4", label: "Học bù", disabled: busy !== null, onClick: () => void edit(s, "makeup")
            }
        ]) : [])
    ]) : []), ...((s.makeupSessionId) ? ([
        {
            key: "action-5", label: <>Buổi bù #{s.makeupSessionId}</>, onClick: () => setDetail(s.makeupSessionId)
        }
    ]) : [])
]}><Button size="small" onClick={() => setDetail(s.id)}>
                    Xem
                  </Button>
    {s.sessionDate <= today && s.status !== "CANCELLED" && (<Link to={attendanceLink(s.id)}>
                      <Button size="small">
                        {s.canAttend
            ? s.status === "COMPLETED"
                ? "Sửa điểm danh"
                : "Điểm danh"
            : "Xem điểm danh"}
                      </Button>
                    </Link>)}</TableActions>
              ),
            },
          ]}
          pagination={{
            current: (query.page ?? 0) + 1,
            pageSize: query.size,
            total: list.data?.totalElements ?? 0,
            showSizeChanger: true,
            onChange: (page, size) =>
              setQuery((q) => ({
                ...q,
                page: size !== q.size ? 0 : page - 1,
                size,
              })),
          }}
        />
      </Card>
      {editing && (
        <SessionEditor
          session={editing.session}
          mode={editing.mode}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            list.reload();
            classes.reload();
            setTimeRevision((v) => v + 1);
            message.success("Đã cập nhật buổi học.");
          }}
        />
      )}
      {generate && (
        <GenerateSessions
          classes={classes.data ?? []}
          classId={classId}
          onClose={() => setGenerate(false)}
          onSaved={(count) => {
            setGenerate(false);
            list.reload();
            setTimeRevision((v) => v + 1);
            message.success("Đã thêm " + count + " buổi còn thiếu.");
          }}
        />
      )}
      {detail && <SessionDetails id={detail} onClose={() => setDetail(null)} />}
    </ManagementLayout>
  );
}
