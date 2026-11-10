import SessionTimeCorrection from "./SessionTimeCorrection";
import {
  Descriptions,
  Drawer,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import { Link } from "react-router-dom";
import { useRemoteResource } from "../../hooks/useRemoteResource";
import { sessionService } from "../../services/sessionService";
import { LoadError } from "../../components/Common/Academic";
import { SESSION_LABELS, attendanceLink } from "../../utils/sessions";
import { displayDate } from "../../utils/display";
import { businessDate } from "../../utils/academic";
const ACTIONS: Record<string, string> = {
  GENERATED: "Sinh buổi",
  MIGRATED: "Chuyển lịch sử",
  TEMPLATE_SYNC: "Đồng bộ lịch mẫu",
  UPDATED: "Điều chỉnh buổi",
  CANCELLED: "Hủy buổi",
  RESTORED: "Khôi phục",
  MAKEUP_CREATED: "Tạo buổi học bù",
  MAKEUP_LINKED: "Liên kết học bù",
  COMPLETED: "Lưu điểm danh",
  ATTENDANCE_CORRECTED: "Sửa điểm danh",
  TIME_CORRECTED: "Đối soát giờ học",
};
export default function SessionDetails({
  id,
  onClose,
}: {
  id: number;
  onClose: () => void;
}) {
  const detail = useRemoteResource(sessionService.detail, { id });
  const history = useRemoteResource(sessionService.history, { id });
  const s = detail.data;
  return (
    <Drawer
      open
      title="Buổi học thực tế"
      onClose={onClose}
      size={820}
      loading={detail.loading}
    >
      <LoadError error={detail.error} reload={detail.reload} />
      {s && (
        <>
          <Space wrap style={{ marginBottom: 16 }}>
            <Tag>{SESSION_LABELS[s.status]}</Tag>
            {s.kind === "MAKEUP" && (
              <Tag color="cyan">Học bù cho #{s.makeupForId}</Tag>
            )}
            {s.sessionDate <= businessDate() && s.status !== "CANCELLED" && (
              <Link to={attendanceLink(s.id)}>
                {s.canAttend ? "Mở điểm danh" : "Xem điểm danh"}
              </Link>
            )}
          </Space>
          <SessionTimeCorrection
            session={s}
            onSaved={() => {
              detail.reload();
              history.reload();
            }}
          />
          <Descriptions
            bordered
            column={1}
            items={[
              {
                key: "class",
                label: "Lớp",
                children: s.classCode + " · " + s.className,
              },
              {
                key: "date",
                label: "Ngày",
                children: displayDate(s.sessionDate, false),
              },
              {
                key: "time",
                label: "Giờ",
                children: s.startTime
                  ? s.startTime + " – " + s.endTime
                  : "Chưa xác minh lịch sử",
              },
              {
                key: "room",
                label: "Phòng thực tế",
                children: s.roomName ?? "Chưa xác minh lịch sử",
              },
              {
                key: "planned",
                label: "Giáo viên kế hoạch",
                children: s.plannedTeacherName ?? "—",
              },
              {
                key: "teacher",
                label: "Giáo viên thực tế",
                children: s.teacherName ?? "Chưa xác minh lịch sử",
              },
              {
                key: "source",
                label: "Ngày theo mẫu ban đầu",
                children: s.sourceDate
                  ? displayDate(s.sourceDate, false)
                  : "Buổi học bù",
              },
              {
                key: "reason",
                label: "Lý do gần nhất",
                children: s.reason ?? "—",
              },
            ]}
          />
          <Tabs
            style={{ marginTop: 20 }}
            items={[
              {
                key: "history",
                label: "Lịch sử thay đổi",
                children: (
                  <>
                    <LoadError error={history.error} reload={history.reload} />
                    <Table
                      rowKey="id"
                      loading={history.loading}
                      dataSource={history.data ?? []}
                      pagination={{ pageSize: 10 }}
                      scroll={{ x: 700 }}
                      columns={[
                        {
                          title: "Thời điểm",
                          dataIndex: "occurredAt",
                          render: (v: string) => displayDate(v),
                        },
                        {
                          title: "Thao tác",
                          dataIndex: "action",
                          render: (v: string) => ACTIONS[v] ?? v,
                        },
                        { title: "Người thực hiện", dataIndex: "actorName" },
                        { title: "Lý do", dataIndex: "reason" },
                      ]}
                      expandable={{
                        expandedRowRender: (r) => (
                          <>
                            <Typography.Paragraph
                              style={{ whiteSpace: "pre-wrap" }}
                            >
                              Trước: {r.beforeState ?? "Chưa có"}
                            </Typography.Paragraph>
                            <Typography.Paragraph
                              style={{ whiteSpace: "pre-wrap" }}
                            >
                              Sau: {r.afterState}
                            </Typography.Paragraph>
                          </>
                        ),
                      }}
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
