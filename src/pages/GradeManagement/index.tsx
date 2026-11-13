import {ContextLink} from '../../components/Common/ContextLink';
import StudentPublicationPanel from "./StudentPublicationPanel";
import FinalResultPanel from "../../components/Common/Evaluation/FinalResultPanel";
import EvaluationWorkspace from "../../components/Common/Evaluation/EvaluationWorkspace";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
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
  Tabs,
  Tag,
} from "antd";
import {
  ManagementLayout,
  Filters,
} from "../../components/Layout/ManagementLayout";
import { BranchFilter, LoadError } from "../../components/Common/Academic";
import { useAuth } from "../../hooks/useAuth";
import { useBranches } from "../../hooks/useBranches";
import { useRemoteResource } from "../../hooks/useRemoteResource";
import { classService } from "../../services/academicService";
import { examService, gradeService } from "../../services/teachingService";
import { businessDate } from "../../utils/academic";
import { positiveId } from "../../utils/admissions";
import { gradeRoster, isTeachingManager } from "../../utils/teaching";
import { displayDate } from "../../utils/display";
import GradeForm from "./GradeForm";
import type { GradeDto } from "../../types/teaching";
type Row = ReturnType<typeof gradeRoster>[number];
export default function GradeManagement() {
  const { user } = useAuth();
  const admin = isTeachingManager(user?.role);
  const { message } = App.useApp();
  const branches = useBranches();
  const [params, setParams] = useSearchParams();
  const classId = positiveId(params.get("classId")) ?? null;
  const examId = positiveId(params.get("examId")) ?? null;
  const branchId = positiveId(params.get("branchId"));
  const updateScope = (
    values: Record<string, string | undefined>,
    clearKeys: string[] = [],
  ) =>
    setParams((p) => {
      const n = new URLSearchParams(p);
      for (const k of clearKeys) n.delete(k);
      for (const [k, v] of Object.entries(values)) {
        if (v === undefined) n.delete(k);
        else n.set(k, v);
      }
      return n;
    });
  const classes = useRemoteResource(classService.all, { branchId });
  const exams = useRemoteResource(examService.forClass, { classId });
  const selected = useRemoteResource(examService.detail, { id: examId });
  const valid = selected.data?.classId === classId;
  const grades = useRemoteResource(gradeService.list, {
    examId: valid ? examId : null,
  });
  const students = useRemoteResource(examService.roster, {
    id: valid ? examId : null,
  });
  const [evaluationRevision, setEvaluationRevision] = useState(0);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [historyGrade, setHistoryGrade] = useState<GradeDto | null>(null);
  const history = useRemoteResource(gradeService.history, {
    id: historyGrade?.id ?? null,
  });
  const rows = gradeRoster(
    students.data?.students ?? [],
    grades.data ?? [],
  ).filter((r) => r.studentName.toLowerCase().includes(search.toLowerCase()));
  const historyRecord =
    grades.data?.find((g) => g.id === historyGrade?.id) ?? historyGrade;
  const loading = grades.loading || students.loading || selected.loading;
  return (
    <ManagementLayout
      title={admin ? "Bảng điểm & đánh giá" : "Bảng điểm"}
      description="Nhập điểm đúng thang, theo dõi người nhập và lịch sử cập nhật."
      actions={
        <Button
          onClick={() => {
            exams.reload();
            selected.reload();
            grades.reload();
            students.reload();
            setEvaluationRevision((v) => v + 1);
            history.reload();
          }}
        >
          Tải lại
        </Button>
      }
    >
      <Card>
        <Filters>
          <BranchFilter
            branches={branches.data}
            loading={branches.loading}
            value={branchId}
            onChange={(id) => {
              updateScope({ branchId: id ? String(id) : undefined }, [
                "classId",
                "examId",
                "enrollmentId",
              ]);
            }}
          />
          <Select
            className="filter"
            style={{ minWidth: 280 }}
            placeholder="Chọn lớp"
            allowClear
            showSearch
            optionFilterProp="label"
            value={classId ?? undefined}
            loading={classes.loading}
            options={classes.data?.map((c) => ({
              value: c.id,
              label: c.code + " · " + c.name,
            }))}
            onChange={(id: number | undefined) =>
              updateScope({ classId: id ? String(id) : undefined }, [
                "examId",
                "enrollmentId",
              ])
            }
          />
          <Select
            className="filter"
            style={{ minWidth: 280 }}
            placeholder="Chọn bài kiểm tra"
            allowClear
            showSearch
            optionFilterProp="label"
            disabled={!classId}
            value={examId ?? undefined}
            loading={exams.loading}
            options={exams.data?.map((e) => ({
              value: e.id,
              label: e.name + " · " + e.examDate,
            }))}
            onChange={(id: number | undefined) =>
              setParams(
                classId
                  ? {
                      classId: String(classId),
                      ...(branchId ? { branchId: String(branchId) } : {}),
                      ...(id ? { examId: String(id) } : {}),
                    }
                  : {},
              )
            }
          />
        </Filters>
        <LoadError error={classes.error} reload={classes.reload} />
        <LoadError error={exams.error} reload={exams.reload} />
        {!classId ? (
          <Alert type="info" showIcon title="Chọn lớp để xem bảng điểm" />
        ) : (
          <Tabs
            activeKey={params.get("view") ?? "grades"}
            onChange={(view) =>
              setParams((p) => {
                const n = new URLSearchParams(p);
                n.set("view", view);
                return n;
              })
            }
            items={[
              {
                key: "final",
                label: "Kết quả chính thức",
                children: (
                  <FinalResultPanel
                    key={classId}
                    classId={classId}
                    revision={evaluationRevision}
                  />
                ),
              },
              {
                key: "grades",
                label: "Bảng điểm",
                children: (
                  <>
                    {valid && examId && <StudentPublicationPanel key={examId+"-"+evaluationRevision} examId={examId}/>}
                    <LoadError
                      error={selected.error}
                      reload={selected.reload}
                    />
                    <LoadError error={grades.error} reload={grades.reload} />
                    <LoadError
                      error={students.error}
                      reload={students.reload}
                    />
                    {examId && !selected.loading && selected.data && !valid && (
                      <Alert
                        type="error"
                        title="Bài kiểm tra không thuộc lớp đang chọn"
                      />
                    )}
                    {!examId ? (
                      <Alert
                        type="info"
                        showIcon
                        title="Chọn bài kiểm tra. Học viên chưa nhập điểm được để trống."
                      />
                    ) : (
                      valid && (
                        <>
                          <Alert
                            type="info"
                            showIcon
                            style={{ marginBottom: 16 }}
                            title={
                              students.data?.frozen
                                ? "Danh sách dự thi đã chốt"
                                : "Danh sách dự thi theo ngày " +
                                  selected.data!.examDate
                            }
                            description={
                              students.data?.frozen
                                ? "Đã chốt khi bắt đầu nhập điểm bởi " +
                                  students.data.frozenByName +
                                  ". Bảo lưu/chuyển lớp sau đó không làm mất học viên dự thi."
                                : "Danh sách lấy theo khoảng học tại ngày thi, không theo trạng thái hiện tại. Lưu điểm đầu tiên sẽ chốt danh sách; chưa đến ngày thi chỉ được xem."
                            }
                          />
                          <Space wrap style={{ marginBottom: 16 }}>
                            <Tag>Thang điểm: {selected.data!.maxScore}</Tag>
                            <Tag>
                              Trọng số gợi ý của bài: {selected.data!.weight}
                            </Tag>
                            <ContextLink to={"/exams?classId=" + classId}>
                              Quản lý bài kiểm tra
                            </ContextLink>
                          </Space>
                          <Input.Search
                            placeholder="Tìm học viên trong lớp"
                            allowClear
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ maxWidth: 360, marginBottom: 16 }}
                          />
                          <Table<Row>
                            rowKey="studentId"
                            loading={loading}
                            dataSource={rows}
                            scroll={{ x: 1100 }}
                            columns={[
                              { title: "Học viên",fixed:"left",width:220, dataIndex: "studentName" },
                              {
                                title: "Danh sách dự thi",
                                dataIndex: "active",
                                render: (v) => (
                                  <Tag color={v ? "green" : "default"}>
                                    {v ? "Có trong danh sách" : "Điểm lịch sử"}
                                  </Tag>
                                ),
                              },
                              {
                                title: "Điểm",
                                key: "score",
                                render: (_, r) =>
                                  r.grade
                                    ? r.grade.score +
                                      " / " +
                                      selected.data!.maxScore
                                    : "Chưa nhập",
                              },
                              {
                                title: "Ghi chú nội bộ",
                                key: "comment",
                                render: (_, r) => r.grade?.comment || "—",
                              },
                              {
                                title: "Người nhập",
                                key: "by",
                                render: (_, r) => r.grade?.enteredByName || "—",
                              },
                              {
                                title: "Thao tác",
                                key: "actions",
                                fixed: "right",
                                width: 220,
                                render: (_, r) => (
                                  <Space wrap>
                                    {((admin && r.grade) ||
                                      (!admin &&
                                        r.active &&
                                        selected.data!.examDate <=
                                          businessDate())) && (
                                      <Button
                                        size="small"
                                        type="primary"
                                        disabled={
                                          loading ||
                                          !!students.error ||
                                          !!grades.error
                                        }
                                        onClick={() => setEditing(r)}
                                      >
                                        {admin
                                          ? "Hiệu chỉnh"
                                          : r.grade
                                            ? "Cập nhật"
                                            : "Nhập điểm"}
                                      </Button>
                                    )}
                                    {r.grade && (
                                      <Button
                                        size="small"
                                        onClick={() =>
                                          setHistoryGrade(r.grade!)
                                        }
                                      >
                                        Lịch sử
                                      </Button>
                                    )}
                                  </Space>
                                ),
                              },
                            ]}
                          />
                        </>
                      )
                    )}
                  </>
                ),
              },
              {
                key: "evaluation",
                label: "Đánh giá tạm / quy tắc",
                children: (
                  <EvaluationWorkspace
                    key={classId}
                    classId={classId}
                    revision={evaluationRevision}
                  />
                ),
              },
            ]}
          />
        )}
      </Card>
      {editing && valid && selected.data && (
        <GradeForm
          exam={selected.data}
          studentId={editing.studentId}
          studentName={editing.studentName}
          grade={editing.grade}
          onClose={() => setEditing(null)}
          onSaved={(g) => {
            setEditing(null);
            grades.reload();
            students.reload();
            setEvaluationRevision((v) => v + 1);
            if (historyGrade?.id === g.id) setHistoryGrade(g);
            history.reload();
            message.success("Đã lưu điểm.");
          }}
        />
      )}
      <Drawer
        open={historyGrade !== null}
        title="Lịch sử điểm"
        size={800}
        onClose={() => setHistoryGrade(null)}
      >
        {historyRecord && (
          <Descriptions
            column={1}
            bordered
            items={[
              {
                key: "student",
                label: "Học viên",
                children: historyRecord.studentName,
              },
              {
                key: "score",
                label: "Điểm hiện tại",
                children: historyRecord.score,
              },
              {
                key: "author",
                label: "Người nhập ban đầu",
                children: historyRecord.enteredByName,
              },
              {
                key: "entered",
                label: "Thời gian nhập",
                children: displayDate(historyRecord.enteredAt),
              },
              {
                key: "modified",
                label: "Người sửa gần nhất",
                children: historyRecord.lastModifiedByName || "—",
              },
              {
                key: "reason",
                label: "Lý do gần nhất",
                children: historyRecord.modificationReason || "—",
              },
            ]}
          />
        )}
        <LoadError error={history.error} reload={history.reload} />
        <Table
          rowKey={(_, i) => String(i)}
          style={{ marginTop: 16 }}
          loading={history.loading}
          dataSource={history.data ?? []}
          scroll={{ x: 700 }}
          columns={[
            { title: "Điểm cũ", dataIndex: "oldScore" },
            { title: "Điểm mới", dataIndex: "newScore" },
            { title: "Người sửa", dataIndex: "modifiedByName" },
            {
              title: "Thời gian",
              dataIndex: "modifiedAt",
              render: (v: string) => displayDate(v),
            },
            {
              title: "Lý do",
              dataIndex: "reason",
              render: (v: string | null) => v || "—",
            },
          ]}
        />
      </Drawer>
    </ManagementLayout>
  );
}
