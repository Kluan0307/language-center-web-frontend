import TableActions from '../../components/Common/TableActions';
import { useListQuery } from "../../hooks/useListQuery";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Alert,
  App,
  Button,
  Card,
  Checkbox,
  Descriptions,
  Drawer,
  Input,
  Select,
  Space,
  Table,
  Typography,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  ManagementLayout,
  Filters,
} from "../../components/Layout/ManagementLayout";
import { BranchFilter, LoadError } from "../../components/Common/Academic";
import {
  PendingPaymentBanner,
  ReceiptDetails,
  TuitionTag,
} from "../../components/Common/Finance";
import { usePendingFinance } from "../../hooks/usePendingFinance";
import { useAuth } from "../../hooks/useAuth";
import { useBranches } from "../../hooks/useBranches";
import { useRemoteResource } from "../../hooks/useRemoteResource";
import { tuitionService, paymentService } from "../../services/financeService";
import { classService } from "../../services/academicService";
import { branchLabel, money } from "../../utils/academic";
import { positiveId } from "../../utils/admissions";
import { displayDate } from "../../utils/display";
import {
  canAdjustTuition,
  canCollect,
  TUITION_LABELS,
  METHOD_LABELS,
} from "../../utils/finance";
import AdjustmentForm from "./AdjustmentForm";
import FinanceOperationFlow, {
  PendingFinanceBanner,
} from "../../components/Common/Finance/FinanceOperationFlow";
import { TuitionLedgerHistory } from "../../components/Common/Finance/LedgerHistory";
import PaymentFlow from "../PaymentManagement/PaymentFlow";
import type {
  PaymentDto,
  TuitionDto,
  TuitionQuery,
  TuitionStatus,
} from "../../types/finance";

async function loadReceipts(
  { tuitionId, page }: { tuitionId: number | null; page: number },
  signal?: AbortSignal,
) {
  return tuitionId === null
    ? null
    : paymentService.list({ tuitionId, page, size: 10 }, signal);
}
export default function TuitionManagement() {
  const { user } = useAuth();
  const financial = usePendingFinance();
  const { message } = App.useApp();
  const branches = useBranches();
  const [params, setParams] = useSearchParams();
  const selectedId = positiveId(params.get("tuitionId")) ?? null;
  const studentId = positiveId(params.get("studentId"));
  const classId = positiveId(params.get("classId"));
  const enrollmentId = positiveId(params.get("enrollmentId"));
  const [query, setQuery] = useListQuery<TuitionQuery>(
    Object.keys(TUITION_LABELS),
  );
  const [search, setSearch] = useState(query.keyword ?? "");
  const list = useRemoteResource(tuitionService.list, {
    ...query,
    studentId,
    classId,
  });
  const detail = useRemoteResource(tuitionService.detail, { id: selectedId });
  const classes = useRemoteResource(classService.all, {
    branchId: query.branchId,
  });
  const [receiptPage, setReceiptPage] = useState(0);
  const receipts = useRemoteResource(loadReceipts, {
    page: receiptPage,
    tuitionId: selectedId,
  });
  const [resumeFinance, setResumeFinance] = useState(false);
  const [adjust, setAdjust] = useState<TuitionDto | null>(null);
  const [collect, setCollect] = useState<{ id: number | null } | null>(null);
  const [receipt, setReceipt] = useState<PaymentDto | null>(null);
  function focus(id: number) {
    setReceiptPage(0);
    setParams((p) => {
      const n = new URLSearchParams(p);
      n.set("tuitionId", String(id));
      return n;
    });
  }
  function refresh() {
    list.reload();
    detail.reload();
    receipts.reload();
  }
  function paid(p: PaymentDto) {
    setCollect(null);
    setReceipt(p);
    focus(p.tuitionId);
    refresh();
    message.success("Đã xác nhận phiếu thu.");
  }
  const actions = (t: TuitionDto, view = true) => (
    <TableActions items={[
    ...((canAdjustTuition(user?.role) && t.status !== "CANCELLED") ? ([
        {
            key: "action-1", label: "Điều chỉnh", onClick: () => setAdjust(t)
        }
    ]) : []),
    {
        key: "action-2", label: "Phiếu thu", to: "/payments?tuitionId=" + t.id
    }
]}>{view && (<Button size="small" onClick={() => focus(t.id)}>
          Xem
        </Button>)}
    {canCollect(t) && (<Button size="small" type="primary" disabled={!!financial.draft || !!financial.error} onClick={() => setCollect({
        id: t.id
    })}>
          Thu tiền
        </Button>)}</TableActions>
  );
  const columns: TableColumnsType<TuitionDto> = [
    {
      title: "Học viên",
      key: "student",
      width: 210,
      render: (_, t) => (
        <div>
          <Button
            type="link"
            style={{ padding: 0 }}
            onClick={() => focus(t.id)}
          >
            {t.studentName || "#" + t.studentId}
          </Button>
          <div>
            <Typography.Text type="secondary">Học phí #{t.id}</Typography.Text>
          </div>
        </div>
      ),
    },
    {
      title: "Lớp / khóa gốc",
      key: "class",
      width: 220,
      render: (_, t) => (
        <div>
          {t.className || "#" + t.classId}
          <div>
            <Typography.Text type="secondary">
              {t.courseName || "—"}
            </Typography.Text>
          </div>
        </div>
      ),
    },
    { title: "Phải thu", dataIndex: "amount", render: money },
    { title: "Thu ròng ghi nhận", dataIndex: "paidAmount", render: money },
    { title: "Tiền dư", dataIndex: "credit", render: money },
    {
      title: "Còn nợ",
      dataIndex: "balance",
      render: (v: number) => (
        <Typography.Text strong type={v > 0 ? "warning" : undefined}>
          {money(v)}
        </Typography.Text>
      ),
    },
    {
      title: "Hạn đóng",
      dataIndex: "dueDate",
      render: (v) => displayDate(v, false),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, t) => <TuitionTag tuition={t} />,
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
      fixed: "right",
      width: 230,
      render: (_, t) => actions(t),
    },
  ];
  const t = detail.data;
  return (
    <ManagementLayout
      title="Học phí & công nợ"
      description="Theo dõi số phải thu, đã đóng, số còn nợ và hạn đóng của từng khoản học phí."
      actions={
        <Button onClick={refresh} loading={list.loading}>
          Tải lại
        </Button>
      }
    >
      <PendingFinanceBanner onResume={() => setResumeFinance(true)} />
      <PendingPaymentBanner onResume={() => setCollect({ id: null })} />
      <LoadError error={list.error} reload={list.reload} />
      {(studentId || enrollmentId) && (
        <Alert
          showIcon
          type="info"
          style={{ marginBottom: 16 }}
          title={
            enrollmentId
              ? "Học phí thuộc học viên của đăng ký #" + enrollmentId
              : "Đang lọc theo học viên #" + studentId
          }
          description={
            enrollmentId
              ? "Đối chiếu mục Đăng ký tính phí gốc trong chi tiết. Một học viên có thể có nhiều khoản học phí."
              : undefined
          }
          action={
            <Button
              onClick={() => {
                setParams({});
                setQuery((q) => ({ ...q, page: 0 }));
              }}
            >
              Bỏ lọc
            </Button>
          }
        />
      )}
      <Card>
        <Filters>
          <Input.Search
            className="search"
            value={search}
            allowClear
            enterButton
            placeholder="Tên học viên, lớp hoặc khóa"
            onChange={(e) => {
              setSearch(e.target.value);
              if (!e.target.value)
                setQuery((q) => ({ ...q, page: 0, keyword: undefined }));
            }}
            onSearch={(keyword) =>
              setQuery((q) => ({
                ...q,
                page: 0,
                keyword: keyword.trim() || undefined,
              }))
            }
          />
          <Select
            className="filter"
            aria-label="Trạng thái học phí"
            placeholder="Tất cả trạng thái"
            allowClear
            value={query.status}
            options={(
              ["UNPAID", "PARTIAL", "PAID", "CANCELLED"] as TuitionStatus[]
            ).map((value) => ({ value, label: TUITION_LABELS[value] }))}
            onChange={(status) => setQuery((q) => ({ ...q, status, page: 0 }))}
          />
          <Select
            className="filter"
            aria-label="Lọc lớp"
            placeholder="Tất cả lớp gốc"
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
              setParams((p) => {
                const n = new URLSearchParams(p);
                n.delete("tuitionId");
                if (id) n.set("classId", String(id));
                else n.delete("classId");
                return n;
              });
              setQuery((q) => ({ ...q, page: 0 }));
            }}
          />
          <BranchFilter
            branches={branches.data}
            loading={branches.loading}
            value={query.branchId}
            onChange={(branchId) => {
              setQuery((q) => ({ ...q, branchId, page: 0 }));
              setParams({});
            }}
          />
          <Checkbox
            checked={query.overdue === true}
            onChange={(e) =>
              setQuery((q) => ({
                ...q,
                overdue: e.target.checked ? true : undefined,
                page: 0,
              }))
            }
          >
            Chỉ quá hạn
          </Checkbox>
          <Typography.Text type="secondary">
            {list.data?.totalElements ?? 0} khoản học phí
          </Typography.Text>
        </Filters>
        <LoadError error={classes.error} reload={classes.reload} />
        <Table<TuitionDto>
          rowKey="id"
          columns={columns}
          dataSource={list.data?.content ?? []}
          loading={list.loading}
          scroll={{ x: 1700 }}
          locale={{
            emptyText: list.error
              ? "Chưa tải được dữ liệu"
              : "Không có học phí phù hợp",
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
        />
      </Card>
      <Drawer
        open={selectedId !== null}
        title="Chi tiết học phí"
        size={900}
        loading={detail.loading}
        onClose={() =>
          setParams((p) => {
            const n = new URLSearchParams(p);
            n.delete("tuitionId");
            return n;
          })
        }
      >
        <LoadError error={detail.error} reload={detail.reload} />
        {t && (
          <>
            <Space wrap style={{ marginBottom: 16 }}>
              {actions(t, false)}
            </Space>
            <Descriptions
              bordered
              column={1}
              items={[
                {
                  key: "student",
                  label: "Học viên",
                  children: (
                    <Link to={"/students?studentId=" + t.studentId}>
                      {t.studentName || "#" + t.studentId}
                    </Link>
                  ),
                },
                {
                  key: "class",
                  label: "Lớp ghi danh gốc",
                  children: t.className || "#" + t.classId,
                },
                { key: "course", label: "Khóa", children: t.courseName || "—" },
                {
                  key: "branch",
                  label: "Chi nhánh",
                  children: branchLabel(branches.data, t.branchId),
                },
                {
                  key: "enrollment",
                  label: "Đăng ký tính phí gốc",
                  children: t.enrollmentId ? (
                    <Link
                      to={
                        "/enrollment?studentId=" +
                        t.studentId +
                        "&enrollmentId=" +
                        t.enrollmentId
                      }
                    >
                      #{t.enrollmentId}
                    </Link>
                  ) : (
                    "Dữ liệu cũ chưa liên kết"
                  ),
                },
                {
                  key: "original",
                  label: "Học phí ban đầu",
                  children: money(t.originalAmount),
                },
                {
                  key: "discount",
                  label: "Giảm trừ",
                  children: money(t.discountAmount),
                },
                { key: "amount", label: "Phải thu", children: money(t.amount) },
                {
                  key: "paid",
                  label: "Thu ròng ghi nhận",
                  children: money(t.paidAmount),
                },
                {
                  key: "credit",
                  label: "Tiền dư có thể hoàn",
                  children: money(t.credit),
                },
                {
                  key: "balance",
                  label: "Còn nợ",
                  children: <strong>{money(t.balance)}</strong>,
                },
                {
                  key: "due",
                  label: "Hạn đóng",
                  children: displayDate(t.dueDate, false),
                },
                {
                  key: "status",
                  label: "Trạng thái",
                  children: <TuitionTag tuition={t} />,
                },
              ]}
            />
            <TuitionLedgerHistory id={t.id} version={t.version} />
            {t.adjustedAt && (
              <>
                <Typography.Title level={5}>
                  Điều chỉnh gần nhất
                </Typography.Title>
                <Descriptions
                  bordered
                  column={1}
                  items={[
                    {
                      key: "by",
                      label: "Người điều chỉnh",
                      children: t.adjustedByName || "—",
                    },
                    {
                      key: "at",
                      label: "Thời gian",
                      children: displayDate(t.adjustedAt),
                    },
                    {
                      key: "reason",
                      label: "Lý do",
                      children: (
                        <span style={{ whiteSpace: "pre-wrap" }}>
                          {t.adjustmentReason || "—"}
                        </span>
                      ),
                    },
                  ]}
                />
              </>
            )}
            <Typography.Title level={5}>
              Phiếu thu của khoản học phí
            </Typography.Title>
            <LoadError error={receipts.error} reload={receipts.reload} />
            <Table<PaymentDto>
              rowKey="id"
              size="small"
              loading={receipts.loading}
              dataSource={receipts.data?.content ?? []}
              scroll={{ x: 650 }}
              columns={[
                {
                  title: "Số phiếu",
                  dataIndex: "receiptNo",
                  render: (v, p) => (
                    <Button type="link" onClick={() => setReceipt(p)}>
                      {v || "#" + p.id}
                    </Button>
                  ),
                },
                { title: "Số tiền", dataIndex: "amount", render: money },
                {
                  title: "Phương thức",
                  dataIndex: "paymentMethod",
                  render: (v: PaymentDto["paymentMethod"]) => METHOD_LABELS[v],
                },
                {
                  title: "Ngày thu",
                  dataIndex: "paidAt",
                  render: (v: string) => displayDate(v),
                },
                { title: "Người thu", dataIndex: "recordedByName" },
              ]}
              pagination={{
                current: receiptPage + 1,
                pageSize: 10,
                total: receipts.data?.totalElements ?? 0,
                onChange: (page) => setReceiptPage(page - 1),
              }}
            />
            <Typography.Paragraph type="secondary">
              Học phí gắn với lớp ghi danh gốc. Chuyển lớp cùng khóa giữ nguyên
              khoản này. Bảo lưu hoặc ngừng học không tự hoàn tiền hay xóa công
              nợ.
            </Typography.Paragraph>
          </>
        )}
      </Drawer>
      <Drawer
        open={receipt !== null}
        title="Phiếu thu"
        size={680}
        onClose={() => setReceipt(null)}
      >
        {receipt && <ReceiptDetails receipt={receipt} />}
      </Drawer>
      {adjust && (
        <AdjustmentForm
          tuition={adjust}
          onClose={() => setAdjust(null)}
          onSaved={() => {
            setAdjust(null);
            focus(adjust.id);
            refresh();
            message.success("Đã điều chỉnh học phí.");
          }}
        />
      )}
      {resumeFinance && (
        <FinanceOperationFlow
          onClose={() => setResumeFinance(false)}
          onSaved={() => {
            setResumeFinance(false);
            refresh();
            message.success("Đã xác nhận yêu cầu tài chính.");
          }}
        />
      )}
      {collect && (
        <PaymentFlow
          tuitionId={collect.id}
          onClose={() => setCollect(null)}
          onSaved={paid}
        />
      )}
    </ManagementLayout>
  );
}
