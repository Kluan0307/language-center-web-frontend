import {managementClasses} from '../../services/managementOptions';
import {ContextLink} from '../../components/Common/ContextLink';
import {positiveId} from '../../utils/admissions';
import {scopeLabel} from '../../utils/managementScope';
﻿import { loadSchedule } from './scheduleData';
import { readScheduleState, updateScheduleParams } from '../../utils/scheduleView';
import { authService } from '../../services/authService';
import SessionCalendar from './SessionCalendar';
import TableActions from '../../components/Common/TableActions';
import { ClassTimeProgress } from "../../components/Common/Placement/DurationPanel";
import { durationLabel, sessionMinutes } from "../../utils/duration";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Alert, App, Button, Card, DatePicker, Select, Table, Tag, Typography, Segmented } from "antd";
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
import { roomService } from "../../services/academicService";
import { businessDate, branchLabel } from "../../utils/academic";

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
async function loadFilterTeachers({ branchId, enabled }: { branchId?: number; enabled: boolean }, signal?: AbortSignal) {
  return enabled ? authService.teachers({ branchId }, signal) : [];
}
async function loadFilterRooms({ branchId, enabled }: { branchId?: number; enabled: boolean }, signal?: AbortSignal) {
  return enabled ? roomService.all({ branchId }, signal) : [];
}
export default function SessionManagement() {
  const { user } = useAuth();
  const { message } = App.useApp();
  const [params, setParams] = useSearchParams();
  const [defaultView] = useState<'week' | 'day'>(() => window.matchMedia('(max-width: 767px)').matches ? 'day' : 'week');
  const today = businessDate();
  const state = readScheduleState(params, today, defaultView);
  const { query:rawQuery, roomId, date, calendarView, display: displayMode } = state;
  const query={...rawQuery,allAssigned:user?.role==='ADMIN'&&rawQuery.allAssigned?true:undefined};
  const classId = query.classId;
  const manager = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
  const teacher = user?.role === 'TEACHER';
  const valid = !query.from || !query.to || query.from <= query.to;
  const [timeRevision, setTimeRevision] = useState(0);
  const updateParams = (patch: Record<string, string | number | boolean | undefined>) =>
    setParams(previous => updateScheduleParams(previous, { calendarView, date, display: displayMode, ...patch }));
  const setDisplayMode = (display: string) => updateParams({ display });
  const setQuery = (change: (previous: SessionQuery) => SessionQuery) => {
    const next = change(query);
    updateParams({ ...next, from: next.from ?? '', to: next.to ?? '' });
  };
  const list = useRemoteResource(loadSchedule, { display: displayMode, date, calendarView, query, roomId, revision: timeRevision });
  const teachers = useRemoteResource(loadFilterTeachers, { branchId: query.branchId, enabled: !teacher });
  const rooms = useRemoteResource(loadFilterRooms, { branchId: query.branchId, enabled: !teacher });
  const classes = useRemoteResource(managementClasses, {
    branchId: query.branchId,allAssigned:query.allAssigned,branchIds:user?.branchIds,
  });
  const branches = useBranches();
  const [editing, setEditing] = useState<{
    session: ClassSession;
    mode: EditMode;
  } | null>(null);
  const [generate, setGenerate] = useState(false);
  const detail=positiveId(params.get('sessionId'))??null;
  const setDetail=(id:number|null)=>updateParams({sessionId:id??undefined});
  const [busy, setBusy] = useState<number | null>(null);
  const classOptions = new Map(
    classes.data?.map((c) => [
      c.id,
      { value: c.id, label: c.code + " · " + c.name },
    ]),
  );
  list.data?.options.forEach((s) =>
    classOptions.set(s.classId, {
      value: s.classId,
      label: s.classCode + " · " + s.className,
    }),
  );
  const roomOptions = new Map(rooms.data?.map(r => [r.id, { value: r.id, label: r.code + ' · ' + r.name }]));
  const teacherOptions = new Map(teachers.data?.map(t => [t.profileId, { value: t.profileId, label: t.fullName }]));
  list.data?.options.forEach(s => {
    if (s.roomId) roomOptions.set(s.roomId, { value: s.roomId, label: s.roomName ?? 'Phòng #' + s.roomId });
    if (s.teacherId) teacherOptions.set(s.teacherId, { value: s.teacherId, label: s.teacherName ?? 'Giáo viên #' + s.teacherId });
  });
  if (roomId && !roomOptions.has(roomId)) roomOptions.set(roomId, {value: roomId, label: 'Phòng #' + roomId});
  if (query.teacherId && !teacherOptions.has(query.teacherId)) teacherOptions.set(query.teacherId, {value: query.teacherId, label: 'Giáo viên #' + query.teacherId});
  if (classId && !classOptions.has(classId)) classOptions.set(classId, {value: classId, label: 'Lớp #' + classId});
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
      title={teacher ? "Lịch dạy của tôi" : "Lịch học"}
      description="Ngày, giờ, phòng và giáo viên thực tế của từng buổi; bao gồm học bù và dạy thay." scopeLabel={scopeLabel(user,branches.data,query.branchId,query.allAssigned)}
      actions={
        <>
          <Button
            onClick={() => {
              list.reload();
              classes.reload(); teachers.reload(); rooms.reload();
              setTimeRevision(v => v + 1);
            }}
            loading={list.loading}
          >
            Tải lại
          </Button>
          {manager && (
            <>
              <ContextLink
                to={
                  "/schedule?view=weekly" +
                  (classId ? "&classId=" + classId : "")
                }
              >
                <Button>Lịch mẫu tuần</Button>
              </ContextLink>
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
      
      
      {classId && (!teacher || classes.data?.some((c) => c.id === classId)) && (
        <Card>
          <ClassTimeProgress id={classId} revision={timeRevision} />
        </Card>
      )}
      <LoadError error={list.error} reload={list.reload} />
      <LoadError error={classes.error} reload={classes.reload} />
      <LoadError error={teachers.error} reload={teachers.reload} />
      <LoadError error={rooms.error} reload={rooms.reload} />
      <Card>
        <Filters>
          <Segmented aria-label="Cách hiển thị lịch" value={displayMode} options={[{label: 'Lịch', value: 'calendar'}, {label: 'Danh sách', value: 'list'}]} onChange={setDisplayMode} />
          <BranchFilter
            branches={branches.data}
            value={query.branchId}
            onChange={(branchId) => {
              updateParams({ branchId,allAssigned:undefined, classId: undefined, teacherId: undefined, roomId: undefined, page: 0 });
            }}
          />
          <Select
            className="filter"
            style={{ minWidth: 200, maxWidth: '100%' }}
            aria-label="Lọc lớp buổi học"
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="Tất cả lớp"
            value={classId}
            options={[...classOptions.values()]}
            onChange={(id: number | undefined) => {
              updateParams({ classId: id, page: 0 });
            }}
          />
          {!teacher && <Select className="filter" aria-label="Lọc giáo viên" placeholder="Tất cả giáo viên" allowClear showSearch optionFilterProp="label"
            value={query.teacherId} options={[...teacherOptions.values()]} loading={teachers.loading}
            onChange={(teacherId: number | undefined) => updateParams({ teacherId, page: 0 })} />}
          <Select className="filter" aria-label="Lọc phòng học" placeholder="Tất cả phòng" allowClear showSearch optionFilterProp="label"
            value={roomId} options={[...roomOptions.values()]} loading={rooms.loading}
            onChange={(roomId: number | undefined) => updateParams({ roomId, page: 0 })} />
          {displayMode === 'list' && (<DatePicker
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
          />)}
          {displayMode === 'list' && (<DatePicker
            aria-label="Buổi đến ngày"
            placeholder="Đến ngày"
            format="DD/MM/YYYY"
            value={query.to ? dayjs(query.to) : null}
            needConfirm={false}
            onChange={(d) =>
              setQuery((q) => ({ ...q, to: d?.format("YYYY-MM-DD"), page: 0 }))
            }
          />)}
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
          {displayMode === 'list' && (<Typography.Text type="secondary">
            {list.loading?'Đang tải…':list.error?'—':list.data?.totalElements??'—'} buổi
          </Typography.Text>)}
        </Filters>
        {displayMode === 'list' && !valid && (
          <Alert type="warning" title="Từ ngày không được sau đến ngày" />
        )}
        {displayMode === 'calendar' ? <SessionCalendar sessions={list.data?.content ?? []} loading={list.loading} error={list.error}
          date={date} view={calendarView} onDateChange={date => updateParams({ date })}
          onViewChange={calendarView => updateParams({ calendarView })} onSelect={setDetail} /> : ((!list.error&&<Table<ClassSession>
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
    {s.sessionDate <= today && s.status !== "CANCELLED" && (<ContextLink to={attendanceLink(s.id)}>
                      <Button size="small">
                        {s.canAttend
            ? s.status === "COMPLETED"
                ? "Sửa điểm danh"
                : "Điểm danh"
            : "Xem điểm danh"}
                      </Button>
                    </ContextLink>)}</TableActions>
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
        />))}
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
      {detail && <SessionDetails id={detail} classIds={classes.data?.map(c=>c.id)} onClose={() => setDetail(null)}
        onChanged={() => { list.reload(); setTimeRevision(v => v + 1); }}
        onEdit={manager ? (session, mode) => { setDetail(null); void edit(session, mode); } : undefined} />}
    </ManagementLayout>
  );
}

