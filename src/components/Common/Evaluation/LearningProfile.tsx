import PublishedStudentGrades from './PublishedStudentGrades';
import { useState } from "react";
import { Alert, Button, Card, Empty, Pagination, Space, Tag, Typography, } from "antd";
import { Link } from "react-router-dom";
import { useRemoteResource } from "../../../hooks/useRemoteResource";
import { learningProfileService, finalResultService, } from "../../../services/finalResultService";
import { LoadError } from "../Academic";
import { evaluationService } from "../../../services/evaluationService";
import { useAuth } from "../../../hooks/useAuth";
import { StudyTag } from "../Admissions";
import { displayDate } from "../../../utils/display";
import type { LearningProfile as Profile } from "../../../services/finalResultService";
function StudyCard({ study, expanded, onToggle }: {
    study: Profile["studies"][number];
    expanded: boolean;
    onToggle: () => void;
}) {
    const { user } = useAuth();
    const e = study.enrollment;
    const finals = useRemoteResource(finalResultService.list, {
        classId: expanded ? e.classId : null,
    });
    const f = finals.data?.results.find((r) => r.enrollmentId === e.id);
    const ops = user?.role !== "STAFF";
    const provisional = useRemoteResource(evaluationService.preview, {
        classId: e.classId,
        revision: 0,
        enabled: ops && expanded,
    });
    const row = provisional.data?.students.find((r) => r.enrollmentId === e.id);
    return (<Card size="small" title={e.classCode + " · " + e.className} extra={<StudyTag value={e.studyStatus}/>}>
      <Space orientation="vertical" style={{ width: "100%" }}>
        <Typography.Text>
          Đăng ký #{e.id} · Chi nhánh #{e.branchId}
        </Typography.Text>
        <Typography.Text>
          Giai đoạn học:{" "}
          {study.periods.length
            ? study.periods
                .map((p) => displayDate(p.activeFrom, false) +
                " → " +
                (p.activeUntil
                    ? displayDate(p.activeUntil, false) +
                        " (không gồm ngày này)"
                    : "Đang mở"))
                .join("; ")
            : "Chưa có khoảng học xác minh"}
        </Typography.Text>
        <Typography.Text>
          Điểm danh đã lưu:{" "}
          {Object.entries(study.recordedAttendance)
            .map(([k, v]) => k + ": " + v)
            .join(" · ") || "Chưa có bản ghi"}
          . Số bản ghi không phải tỷ lệ chuyên cần đã xác minh.
        </Typography.Text>
        {expanded && <PublishedStudentGrades key={e.id} studentId={e.studentId} enrollmentId={e.id}/>}
        <Button onClick={onToggle}>{expanded ? "Thu gọn kết quả" : "Xem kết quả học tập"}</Button>
        {ops && expanded && (<>
            <LoadError error={provisional.error} reload={provisional.reload}/>
            {row && (<Typography.Text>
                Đánh giá tạm:{" "}
                {row.status === "INSUFFICIENT"
                    ? "Chưa đủ dữ liệu"
                    : row.status === "PASS"
                        ? "Đạt"
                        : "Chưa đạt"}{" "}
                · Điểm tổng hợp: {row.averagePercent ?? "Chưa xác định"}%
              </Typography.Text>)}
          </>)}
        {expanded && <LoadError error={finals.error} reload={finals.reload}/>}
        {expanded && finals.data && (<Tag>
            {f
                ? f.state === "CONFIRMED"
                    ? (f.outcome === "PASS"
                        ? "Đạt chính thức"
                        : "Chưa đạt chính thức") +
                        " · v" +
                        f.revision
                    : "Đang xem xét lại"
                : study.resultVerification === "LEGACY_UNVERIFIED"
                    ? "Kết quả cũ chưa xác minh"
                    : "Chưa chốt kết quả"}
          </Tag>)}
        <Space wrap>
          <Link to={"/classes?classId=" + e.classId + "&branchId=" + e.branchId}>
            Chi tiết lớp
          </Link>
          <Link to={"/enrollment?studentId=" +
            e.studentId +
            "&classId=" +
            e.classId +
            "&enrollmentId=" +
            e.id +
            "&branchId=" +
            e.branchId}>
            Đăng ký / hoàn thành
          </Link>
          <Link to={"/schedule?classId=" + e.classId}>Lịch học</Link>
          <Link to={"/attendance?classId=" + e.classId}>Điểm danh</Link>
          <Link to={"/tuition?studentId=" +
            e.studentId +
            "&enrollmentId=" +
            (e.billingEnrollmentId ?? e.id) +
            "&branchId=" +
            e.branchId}>
            Học phí
          </Link>
          {ops && (<>
              <Link to={"/grades?classId=" +
                e.classId +
                "&view=evaluation&enrollmentId=" +
                e.id +
                "&branchId=" +
                e.branchId}>
                Đánh giá tạm
              </Link>
              <Link to={"/grades?classId=" +
                e.classId +
                "&view=final&enrollmentId=" +
                e.id}>
                Kết quả / lịch sử
              </Link>
            </>)}
        </Space>
      </Space>
    </Card>);
}
export default function LearningProfile({ studentId }: {
    studentId: number;
}) {
    const profile = useRemoteResource(learningProfileService.get, { studentId });
    const [page, setPage] = useState(1);
    const [expanded, setExpanded] = useState<number | null>(null);
    const studies = profile.data?.studies ?? [];
    const current = Math.min(page, Math.max(1, Math.ceil(studies.length / 5)));
    return (<Space orientation="vertical" style={{ width: "100%" }}>
      <Button loading={profile.loading} onClick={profile.reload}>
        Tải lại hồ sơ học tập
      </Button>
      <LoadError error={profile.error} reload={profile.reload}/>
      <Alert type="info" title="Hồ sơ theo từng đăng ký" description="Đánh giá đầu vào nằm ở tab bên cạnh. Lịch sử chuyển lớp và bảo lưu được giữ theo khoảng học; điểm tạm và kết quả chính thức có đường xem riêng." showIcon/>
      {profile.data?.studies.length === 0 && (<Empty description="Học viên chưa có đăng ký lớp"/>)}
      {studies.slice((current - 1) * 5, current * 5).map((s) => (<StudyCard key={s.enrollment.id} study={s} expanded={expanded === s.enrollment.id} onToggle={() => setExpanded(v => v === s.enrollment.id ? null : s.enrollment.id)}/>))}
      {studies.length > 5 && (<Pagination current={current} pageSize={5} total={studies.length} onChange={p => { setPage(p); setExpanded(null); }} showSizeChanger={false}/>)}
    </Space>);
}
