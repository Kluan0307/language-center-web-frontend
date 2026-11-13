import {scopeLabel as pageScopeLabel} from '../../utils/managementScope';
import TableActions from '../../components/Common/TableActions';
import { useListQuery } from "../../hooks/useListQuery";
import { useSearchParams } from "react-router-dom";
import {useState} from "react";
import { App, Alert, Button, Card, Select, Space, Table, Tag, Typography, Input } from "antd";
import type { TableColumnsType } from "antd";
import { Eye, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import {
  ManagementLayout,
  Filters,
} from "../../components/Layout/ManagementLayout";
import { BranchFilter, LoadError } from "../../components/Common/Academic";
import { useBranches } from "../../hooks/useBranches";
import { useAuth } from "../../hooks/useAuth";
import { useRemoteResource } from "../../hooks/useRemoteResource";
import { classService } from "../../services/academicService";
import { getErrorMessage } from "../../utils/apiErrors";
import { canPlan, PROGRESS, branchLabel } from "../../utils/academic";
import { displayDate } from "../../utils/display";
import ClassForm from "./ClassForm";
import ClassDetails from "./ClassDetails";
import type { ClassDto, ClassQuery } from "../../types/academic";

export default function ClassManagement() {
  const { user } = useAuth();
  const { message } = App.useApp();
  const branches = useBranches();
  const [query, setQuery] = useListQuery<ClassQuery>(Object.keys(PROGRESS));
  const list = useRemoteResource(classService.list, query);
  const [search, setSearch] = useState(query.keyword ?? "");
  const [params, setParams] = useSearchParams();
  const rawId = Number(params.get("classId"));
  const detailId = Number.isSafeInteger(rawId) && rawId > 0 ? rawId : null;
  const setDetailId = (id: number | null) =>
    setParams((p) => {
      const n = new URLSearchParams(p);
      if (id === null) n.delete("classId");
      else n.set("classId", String(id));
      return n;
    });
  const [formState, setFormState] = useState<{
    editing: ClassDto | null;
  } | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const teacher = user?.role === "TEACHER";
  const manager = !!user && canPlan(user.role);
  async function mutate(c: ClassDto, action: "status" | "delete") {
    if (busyId !== null || teacher || (action === "status" && !manager)) return;
    if (action === "status") {
      setDetailId(c.id);
      return;
    }
    setBusyId(c.id);
    try {
      if (action === "delete") await classService.remove(c.id);

      setDetailId(null);
      list.reload();
      message.success(
        action === "delete" ? "Đã xóa lớp học." : "Đã cập nhật tiến độ lớp.",
      );
    } catch (e) {
      message.error(getErrorMessage(e));
    } finally {
      setBusyId(null);
    }
  }
  const columns: TableColumnsType<ClassDto> = [
    {
      title: "Lớp học",
      key: "name",
      width: 250,
      render: (_, c) => (
        <div>
          <Button
            type="link"
            style={{ padding: 0 }}
            onClick={() => setDetailId(c.id)}
          >
            {c.name}
          </Button>
          <div>
            <Typography.Text type="secondary">{c.code}</Typography.Text>
          </div>
        </div>
      ),
    },
    { title: "Khóa học", dataIndex: "courseName", width: 170 },
    {
      title: "Giáo viên / phòng",
      key: "assignment",
      render: (_, c) => (
        <div>
          {c.teacherName}
          <div>
            <Typography.Text type="secondary">{c.roomName}</Typography.Text>
          </div>
        </div>
      ),
    },
    {
      title: "Thời gian",
      key: "dates",
      render: (_, c) => (
        <div>
          {displayDate(c.startDate, false)}
          <div>
            <Typography.Text type="secondary">
              đến {displayDate(c.endDate, false)}
            </Typography.Text>
          </div>
        </div>
      ),
    },
    {
      title: "Sĩ số",
      key: "capacity",
      render: (_, c) => (
        <Space direction="vertical" size={2}>
          <span>
            {c.currentSize}/{c.maxSize}
          </span>
          {c.full && <Tag color="orange">Đủ chỗ</Tag>}
        </Space>
      ),
    },
    {
      title: "Tiến độ",
      dataIndex: "status",
      render: (v: ClassDto["status"]) => (
        <Tag
          color={
            v === "ONGOING" ? "green" : v === "UPCOMING" ? "blue" : "default"
          }
        >
          {PROGRESS[v]}
        </Tag>
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
      fixed: "right" as const,
      width: 160,
      render: (_, c) => (
        <TableActions items={[
    ...((!teacher) ? ([
        {
            key: "action-1", label: "Sửa", icon: <Pencil size={14}/>, onClick: () => setFormState({
                editing: c
            })
        },
        ...((manager) ? ([
            {
                key: "action-2", label: "Đối soát đóng / mở lớp", onClick: () => setDetailId(c.id)
            }
        ]) : []),
        {
            key: "action-3", label: "Xóa", icon: <Trash2 size={14}/>, loading: busyId === c.id, danger: true, disabled: busyId !== null, confirm: {
                title: "Xóa lớp học?", okText: "Xóa", cancelText: "Hủy", content: "Chỉ xóa được lớp chưa từng có đăng ký. Lịch tuần của lớp cũng sẽ bị xóa.", okButtonProps: {
                    danger: true
                }, onOk: () => mutate(c, "delete")
            }
        }
    ]) : [])
]}><Button size="small" icon={<Eye size={14}/>} onClick={() => setDetailId(c.id)}>
            Xem
          </Button></TableActions>
      ),
    },
  ];
  return (
    <ManagementLayout scopeLabel={pageScopeLabel(user,branches.data,query.branchId,false)}
      title={teacher ? "Lớp của tôi" : "Lớp học"}
      description={
        teacher
          ? "Các lớp được phân công và học viên đang học trong lớp."
          : "Quản lý lớp, phân công giảng dạy, phòng học và thời gian đào tạo."
      }
      actions={
        <>
          <Button
            icon={<RefreshCw size={16} />}
            onClick={list.reload}
            loading={list.loading}
          >
            Tải lại
          </Button>
          {!teacher && (
            <Button
              type="primary"
              icon={<Plus size={16} />}
              onClick={() => setFormState({ editing: null })}
            >
              Thêm lớp học
            </Button>
          )}
        </>
      }
    >
      {user?.role === "STAFF" && (
        <Alert
          type="info"
          showIcon
          title="Bạn có thể tạo lớp không kèm lịch. Lớp đã có chỉ được sửa mã, tên và sĩ số tối đa."
        />
      )}
      <LoadError error={list.error} reload={list.reload} />
      <Card>
        <Filters>
          <Input.Search
            className="search"
            placeholder="Tìm mã hoặc tên lớp"
            allowClear
            enterButton
            value={search}
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
            aria-label="Tiến độ lớp"
            placeholder="Tất cả tiến độ"
            allowClear
            value={query.status}
            options={[
              ...Object.entries(PROGRESS).map(([value, label]) => ({
                value,
                label,
              })),
              { value: "FULL", label: "Đủ chỗ" },
            ]}
            onChange={(status) => setQuery((q) => ({ ...q, status, page: 0 }))}
          />
          <BranchFilter
            branches={branches.data}
            loading={branches.loading}
            value={query.branchId}
            onChange={(branchId) =>
              setQuery((q) => ({ ...q, branchId, page: 0 }))
            }
          />
          <Typography.Text type="secondary">
            {list.loading?'Đang tải…':list.error?'—':list.data?.totalElements??'—'} lớp
          </Typography.Text>
        </Filters>
        {!list.error&&<Table<ClassDto>
          rowKey="id"
          columns={columns}
          dataSource={list.data?.content ?? []}
          loading={list.loading}
          scroll={{ x: teacher ? 1000 : 1500 }}
          locale={{
            emptyText: list.error
              ? "Chưa tải được dữ liệu"
              : "Không có lớp phù hợp",
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
      {detailId !== null && (
        <ClassDetails
          id={detailId}
          teacher={teacher}
          onClose={() => setDetailId(null)}
          onEdit={
            teacher
              ? undefined
              : (editing) => {
                  setDetailId(null);
                  setFormState({ editing });
                }
          }
        />
      )}
      {formState && (
        <ClassForm
          editing={formState.editing}
          defaultBranchId={query.branchId ?? user?.branchId ?? undefined}
          onClose={() => setFormState(null)}
          onSaved={() => {
            setFormState(null);
            list.reload();
            message.success("Đã lưu lớp học.");
          }}
        />
      )}
    </ManagementLayout>
  );
}
