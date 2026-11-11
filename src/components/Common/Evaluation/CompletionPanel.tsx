import { useState } from "react";
import { Alert, Button, Space, Tag } from "antd";
import { Link } from "react-router-dom";
import { useRemoteResource } from "../../../hooks/useRemoteResource";
import { finalResultService } from "../../../services/finalResultService";
import type { EnrollmentDto } from "../../../types/admissions";
import { LoadError } from "../Academic";
import { ResultReasonModal } from "./FinalResultPanel";
import { useAuth } from "../../../hooks/useAuth";
export default function CompletionPanel({
  record,
  onSaved,
}: {
  record: EnrollmentDto;
  onSaved: () => void;
}) {
  const finals = useRemoteResource(finalResultService.list, {
    classId: record.classId,
    version: record.version,
  });
  const [confirm, setConfirm] = useState(false);
  const { user } = useAuth();
  const f = finals.data?.results.find((r) => r.enrollmentId === record.id);
  const linked =
    !!f &&
    record.studyStatus === "COMPLETED" &&
    record.completionResultId === f.id &&
    record.completionResultRevision === f.revision;
  return (
    <Space orientation="vertical" style={{ width: "100%", marginBlock: 16 }}>
      <LoadError error={finals.error} reload={finals.reload} />
      <Alert
        type={f?.state === "CONFIRMED" ? "success" : "info"}
        showIcon
        title={
          f?.state === "CONFIRMED"
            ? "Kết quả chính thức: " +
              (f.outcome === "PASS" ? "Đạt" : "Chưa đạt") +
              " · v" +
              f.revision
            : f
              ? "Kết quả đang được xem xét lại"
              : record.studyStatus === "COMPLETED"
                ? "Hoàn thành cũ: chưa xác minh kết quả"
                : "Chưa có kết quả chính thức"
        }
        description={
          (linked
            ? "Đã cập nhật kết quả hiện hành. "
            : "Cần cập nhật kết quả hiện hành. ") +
          "Hoàn thành đăng ký xác nhận đã kết thúc quá trình học. Bước này không thay đổi học phí và không đồng nghĩa đạt khóa học."
        }
      />
      <Space wrap>
        <Button loading={finals.loading} onClick={finals.reload}>
          Kiểm tra kết quả
        </Button>
        {f?.state === "CONFIRMED" &&
          !linked &&
          ["STUDYING", "COMPLETED"].includes(record.studyStatus) && (
            <Button onClick={() => setConfirm(true)}>
              Đồng bộ hoàn thành học vụ
            </Button>
          )}
        {user?.role !== "STAFF" && (
          <Link
            to={
              "/grades?classId=" +
              record.classId +
              "&view=final&enrollmentId=" +
              record.id
            }
          >
            Mở kết quả cuối khóa
          </Link>
        )}
        {record.completionResultId && (
          <Tag>
            Đã liên kết #{record.completionResultId} · v
            {record.completionResultRevision}
          </Tag>
        )}
      </Space>
      {confirm && f && (
        <ResultReasonModal
          title="Đồng bộ kết quả sang học vụ"
          onClose={() => setConfirm(false)}
          onSubmit={async (reason) => {
            await finalResultService.complete(record, f, reason);
            setConfirm(false);
            finals.reload();
            onSaved();
          }}
        />
      )}
    </Space>
  );
}
