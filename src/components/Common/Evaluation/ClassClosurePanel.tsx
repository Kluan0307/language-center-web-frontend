import { useState } from "react";
import { Alert, Button, Space, Table, Tag } from "antd";
import { useRemoteResource } from "../../../hooks/useRemoteResource";
import { useAuth } from "../../../hooks/useAuth";
import { finalResultService } from "../../../services/finalResultService";
import { LoadError } from "../Academic";
import { ResultReasonModal } from "./FinalResultPanel";
import { Link } from "react-router-dom";
import { displayDate } from "../../../utils/display";
export default function ClassClosurePanel({
  classId,
  onChanged,
}: {
  classId: number;
  onChanged: () => void;
}) {
  const closure = useRemoteResource(finalResultService.closure, { classId });
  const [action, setAction] = useState<boolean | null>(null);
  const { user } = useAuth();
  const manager = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const c = closure.data;
  return (
    <Space orientation="vertical" style={{ width: "100%" }}>
      <LoadError error={closure.error} reload={closure.reload} />
      <Button onClick={closure.reload} loading={closure.loading}>
        Tải lại trạng thái đóng lớp
      </Button>
      {c && (
        <>
          <Tag color={c.closed ? "red" : "blue"}>
            {c.closed ? "Đã đóng thủ công" : "Chưa đóng thủ công"}
          </Tag>
          {c.verification === "NEEDS_REVIEW" && (
            <Alert
              type="warning"
              showIcon
              title="Kết quả đã thay đổi. Cần mở lại lớp để kiểm tra trước khi đóng."
            />
          )}
          {c.verification === "LEGACY_UNVERIFIED" && (
            <Alert
              type="warning"
              showIcon
              title="Chưa xác nhận điều kiện kết thúc lớp"
            />
          )}
          <Alert
            type="info"
            showIcon
            title="Hết ngày học khác với đóng lớp"
            description="Đóng lớp yêu cầu đủ phút đã xác minh, không còn buổi chưa xử lý hoặc đăng ký đang học/bảo lưu, và các đăng ký hoàn thành đã đồng bộ đúng kết quả hiện hành. Muốn sửa nguồn, mở lại kết quả toàn lớp trước rồi mở lớp; lịch sử học phí và đăng ký được giữ."
          />
          {manager && (
            <Space wrap>
              <Button onClick={() => setAction(!c.closed)}>
                {c.closed ? "Mở lại lớp" : "Đóng lớp có đối soát"}
              </Button>
              <Link to={"/grades?classId=" + classId + "&view=final"}>
                Kết quả cuối khóa
              </Link>
            </Space>
          )}
          <Table
            rowKey="revision"
            dataSource={c.history}
            scroll={{ x: 650 }}
            pagination={{ pageSize: 5 }}
            columns={[
              { title: "Phiên bản", dataIndex: "revision" },
              {
                title: "Thao tác",
                dataIndex: "closed",
                render: (v) => (v ? "Đóng lớp" : "Mở lại lớp"),
              },
              { title: "Người thực hiện", dataIndex: "actorName" },
              {
                title: "Thời điểm",
                dataIndex: "changedAt",
                render: (v: string) => displayDate(v),
              },
              { title: "Lý do", dataIndex: "reason" },
            ]}
          />
          {action !== null && (
            <ResultReasonModal
              title={action ? "Đóng lớp có đối soát" : "Mở lại lớp để đối soát"}
              onClose={() => setAction(null)}
              onSubmit={async (reason, requestId) => {
                await finalResultService.changeClosure(classId, action, {
                  reason,
                  requestId,
                  expectedRevision: c.revision,
                });
                setAction(null);
                closure.reload();
                onChanged();
              }}
            />
          )}
        </>
      )}
    </Space>
  );
}
