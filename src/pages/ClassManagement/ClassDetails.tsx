import ClassWorkspaceTabs from './ClassWorkspaceTabs';
import {ContextLink} from '../../components/Common/ContextLink';
import ClassClosurePanel from "../../components/Common/Evaluation/ClassClosurePanel";
import { ClassDurationPanel } from "../../components/Common/Placement/DurationPanel";
import {
  Alert,
  Button,
  Descriptions,
  Drawer,
  Space,
  Table,
  Typography,
  Tag,
} from "antd";

import { useAuth } from "../../hooks/useAuth";
import { useRemoteResource } from "../../hooks/useRemoteResource";
import { classService } from "../../services/academicService";
import { LoadError } from "../../components/Common/Academic";
import { dayLabel, PROGRESS } from "../../utils/academic";
import { displayDate } from "../../utils/display";
import { ClassAdmissionPanel } from "../../components/Common/Placement/AdmissionPanel";
import type { ClassDto } from "../../types/academic";

export default function ClassDetails({
  id,
  teacher,
  onClose,
  onEdit,
}: {
  id: number;
  teacher: boolean;
  onClose: () => void;
  onEdit?: (value: ClassDto) => void;
}) {
  const { user } = useAuth();
  const detail = useRemoteResource(classService.detail, { id });
  const students = useRemoteResource(classService.students, { id });
  const c = detail.data?.schoolClass;
  return (
    <Drawer
      title="Thông tin lớp học"
      open
      onClose={onClose}
      size={820}
      loading={detail.loading}
    >
      <LoadError error={detail.error} reload={detail.reload} />
      {c && (
        <>
          <Typography.Title level={3} style={{marginTop:0}}>{c.code} · {c.name}</Typography.Title><Space wrap style={{marginBottom:16}}><Tag>{c.currentSize}/{c.maxSize} học viên</Tag><Tag>{c.teacherName??'Chưa phân công'}</Tag><Tag>{c.roomName??'Chưa có phòng'}</Tag></Space>
          <Space wrap size={12} style={{ marginBottom: 20 }}>
            <Tag color="blue">{PROGRESS[c.status]}</Tag>
            {c.full && <Tag color="orange">Đủ chỗ</Tag>}
            {onEdit && <Button onClick={() => onEdit(c)}>Chỉnh sửa lớp</Button>}
            <ContextLink
              to={`${teacher ? "/my-schedule" : "/schedule"}?classId=${c.id}`}
            >
              <Button>{teacher ? "Xem lịch dạy" : "Mở lịch của lớp"}</Button>
            </ContextLink>
            <ContextLink to={"/attendance?classId=" + c.id}>
              <Button>Điểm danh</Button>
            </ContextLink>
            {user?.role !== "STAFF" && (
              <>
                <ContextLink to={"/exams?classId=" + c.id}>
                  <Button>Bài kiểm tra</Button>
                </ContextLink>
                <ContextLink to={"/grades?classId=" + c.id}>
                  <Button>Bảng điểm</Button>
                </ContextLink>
              </>
            )}
            <ContextLink to={"/documents?classId="+c.id}>
              <Button>Tài liệu</Button>
            </ContextLink>
          </Space>
          <ClassWorkspaceTabs manager={user?.role==='ADMIN'||user?.role==='SUPER_ADMIN'}
            items={[
              {
                key: "closure",
                label: "Đóng / mở lại lớp",
                children: (
                  <ClassClosurePanel classId={id} onChanged={detail.reload} />
                ),
              },
              {
                key: "info",
                label: "Thông tin",
                children: (
                  <Descriptions
                    column={1}
                    bordered
                    items={[
                      { key: "code", label: "Mã lớp", children: c.code },
                      { key: "name", label: "Tên lớp", children: c.name },
                      {
                        key: "course",
                        label: "Khóa học",
                        children: c.courseName,
                      },
                      {
                        key: "teacher",
                        label: "Giáo viên",
                        children: c.teacherName,
                      },
                      { key: "room", label: "Phòng", children: c.roomName },
                      {
                        key: "start",
                        label: "Bắt đầu",
                        children: displayDate(c.startDate, false),
                      },
                      {
                        key: "end",
                        label: "Kết thúc dự kiến",
                        children: displayDate(c.endDate, false),
                      },
                      ...(c.effectiveEndDate && c.effectiveEndDate !== c.endDate
                        ? [
                            {
                              key: "actualEnd",
                              label: "Kết thúc theo buổi thực tế",
                              children: displayDate(c.effectiveEndDate, false),
                            },
                          ]
                        : []),
                      {
                        key: "size",
                        label: "Sĩ số",
                        children: `${c.currentSize}/${c.maxSize}`,
                      },
                      {
                        key: "progress",
                        label: "Tiến độ",
                        children: `${PROGRESS[c.status]}${c.statusManuallySet ? " (đã đặt thủ công)" : ""}`,
                      },
                    ]}
                  />
                ),
              },
              {
                key: "duration",
                label: "Thời lượng / tiến độ",
                children: <ClassDurationPanel id={c.id} />,
              },
              {
                key: "admission",
                label: "Đầu vào / đầu ra",
                children: (
                  <ClassAdmissionPanel
                    key={c.id}
                    id={c.id}
                    courseId={c.courseId}
                  />
                ),
              },
              {
                key: "schedule",
                label: "Lịch tuần",
                children: (
                  <Table
                    rowKey="id"
                    dataSource={detail.data?.schedules ?? []}
                    pagination={false}
                    locale={{ emptyText: "Lớp chưa có lịch học" }}
                    columns={[
                      {
                        title: "Ngày",
                        dataIndex: "dayOfWeek",
                        render: dayLabel,
                      },
                      { title: "Bắt đầu", dataIndex: "startTime" },
                      { title: "Kết thúc", dataIndex: "endTime" },
                      { title: "Phòng", dataIndex: "roomName" },
                    ]}
                  />
                ),
              },
              {
                key: "students",
                label: "Học viên đang học",
                children: (
                  <>
                    <LoadError
                      error={students.error}
                      reload={students.reload}
                    />
                    <Alert
                      type="info"
                      showIcon
                      title="Danh sách học viên có đăng ký đang học trong lớp."
                      style={{ marginBottom: 16 }}
                    />
                    <Table
                      rowKey="id"
                      dataSource={students.data ?? []}
                      loading={students.loading}
                      locale={{ emptyText: "Chưa có học viên đang học" }}
                      columns={[
                        {
                          title: "Mã học viên",
                          dataIndex: "studentCode",
                          render: (value) => value || "—",
                        },
                        { title: "Họ và tên", dataIndex: "fullName" },
                        {
                          title: "Trình độ",
                          dataIndex: "currentLevel",
                          render: (value) => value || "—",
                        },
                      ]}
                    />
                  </>
                ),
              },
            ]}
          />
        </>
      )}
    </Drawer>
  );
}
