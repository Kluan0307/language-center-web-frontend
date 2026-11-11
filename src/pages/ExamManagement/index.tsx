import TableActions from '../../components/Common/TableActions';
import EvaluationWorkspace from "../../components/Common/Evaluation/EvaluationWorkspace";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Alert, App, Button, Card, Select, Table, Typography } from "antd";
import {
  ManagementLayout,
  Filters,
} from "../../components/Layout/ManagementLayout";
import { BranchFilter, LoadError } from "../../components/Common/Academic";
import { useAuth } from "../../hooks/useAuth";
import { useBranches } from "../../hooks/useBranches";
import { useRemoteResource } from "../../hooks/useRemoteResource";
import { classService } from "../../services/academicService";
import { examService } from "../../services/teachingService";
import { positiveId } from "../../utils/admissions";
import { getErrorMessage } from "../../utils/apiErrors";
import { displayDate } from "../../utils/display";
import ExamForm from "./ExamForm";
import type { ExamDto, ExamQuery } from "../../types/teaching";
async function load(
  { query, enabled }: { query: ExamQuery; enabled: boolean },
  signal?: AbortSignal,
) {
  return enabled ? examService.list(query, signal) : null;
}
export default function ExamManagement() {
  const { user } = useAuth();
  const { message } = App.useApp();
  const branches = useBranches();
  const [params, setParams] = useSearchParams();
  const classId = positiveId(params.get("classId"));
  const [query, setQuery] = useState<ExamQuery>({ page: 0, size: 10 });
  const classes = useRemoteResource(classService.all, {
    branchId: query.branchId,
  });
  const list = useRemoteResource(load, {
    query: { ...query, classId },
    enabled: user?.role !== "TEACHER" || !!classId,
  });
  const [form, setForm] = useState<{ editing: ExamDto | null } | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  async function remove(exam: ExamDto) {
    if (busyId !== null) return;
    setBusyId(exam.id);
    try {
      await examService.remove(exam.id);
      list.reload();
      message.success("Đã xóa bài kiểm tra.");
    } catch (e) {
      message.error(getErrorMessage(e));
    } finally {
      setBusyId(null);
    }
  }
  return (
    <ManagementLayout
      title="Bài kiểm tra"
      description="Quản lý bài kiểm tra theo lớp, ngày kiểm tra, thang điểm và trọng số."
      actions={
        <>
          <Button onClick={list.reload} loading={list.loading}>
            Tải lại
          </Button>
          <Button
            type="primary"
            disabled={
              classes.loading || !!classes.error || !classes.data?.length
            }
            onClick={() => setForm({ editing: null })}
          >
            Thêm bài kiểm tra
          </Button>
        </>
      }
    >
      <LoadError error={list.error} reload={list.reload} />
      <Card>
        <Filters>
          <BranchFilter
            branches={branches.data}
            loading={branches.loading}
            value={query.branchId}
            onChange={(branchId) => {
              setQuery((q) => ({ ...q, branchId, page: 0 }));
              setParams({});
            }}
          />
          <Select
            className="filter"
            style={{ minWidth: 320 }}
            placeholder={
              user?.role === "TEACHER"
                ? "Chọn lớp được phân công"
                : "Tất cả lớp"
            }
            allowClear
            showSearch
            optionFilterProp="label"
            loading={classes.loading}
            value={classId}
            options={classes.data?.map((c) => ({
              value: c.id,
              label: c.code + " · " + c.name,
            }))}
            onChange={(id: number | undefined) => {
              setParams(id ? { classId: String(id) } : {});
              setQuery((q) => ({ ...q, page: 0 }));
            }}
          />
          <Typography.Text type="secondary">
            {list.data?.totalElements ?? 0} bài kiểm tra
          </Typography.Text>
        </Filters>
        <LoadError error={classes.error} reload={classes.reload} />
        {user?.role === "TEACHER" && !classId ? (
          <Alert
            type="info"
            showIcon
            title="Chọn lớp của bạn để xem bài kiểm tra"
          />
        ) : (
          <Table<ExamDto>
            rowKey="id"
            loading={list.loading}
            dataSource={list.data?.content ?? []}
            scroll={{ x: 1100 }}
            columns={[
              { title: "Tên", dataIndex: "name" },
              {
                title: "Lớp",
                dataIndex: "classId",
                render: (id) =>
                  classes.data?.find((c) => c.id === id)?.name || "#" + id,
              },
              { title: "Loại", dataIndex: "examType" },
              {
                title: "Ngày",
                dataIndex: "examDate",
                render: (v: string) => displayDate(v, false),
              },
              { title: "Trọng số gợi ý", dataIndex: "weight" },
              { title: "Điểm tối đa", dataIndex: "maxScore" },
              {
                title: "Thao tác",
                key: "actions",
                fixed: "right",
                width: 160,
                render: (_, e) => (
                  <TableActions items={[
    {
        key: "action-1", label: "Sửa", onClick: () => setForm({
            editing: e
        })
    },
    {
        key: "action-2", label: "Xóa", loading: busyId === e.id, danger: true, disabled: (busyId !== null), confirm: {
            title: "Xóa bài kiểm tra chưa có điểm?", okText: "Xóa", cancelText: "Hủy", content: undefined, okButtonProps: {
                danger: true
            }, onOk: () => remove(e)
        }
    }
]}><Link to={"/grades?classId=" + e.classId + "&examId=" + e.id}>
                      <Button size="small" type="primary">
                        Bảng điểm
                      </Button>
                    </Link></TableActions>
                ),
              },
            ]}
            pagination={{
              current: query.page + 1,
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
        )}
      </Card>
      {classId && (
        <Card title="Quy tắc đánh giá của lớp">
          <EvaluationWorkspace key={classId} classId={classId} policyOnly />
        </Card>
      )}
      {form && (
        <ExamForm
          editing={form.editing}
          classes={classes.data ?? []}
          classId={classId}
          onClose={() => setForm(null)}
          onSaved={(exam) => {
            setForm(null);
            setParams({ classId: String(exam.classId) });
            setQuery((q) => ({ ...q, page: 0 }));
            list.reload();
            message.success("Đã lưu bài kiểm tra.");
          }}
        />
      )}
    </ManagementLayout>
  );
}
