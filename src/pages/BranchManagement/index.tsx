import {useListQuery} from '../../hooks/useListQuery';
import TableActions from '../../components/Common/TableActions';
import {useEffect,useState} from 'react';
import { App, Alert, Button, Card, Descriptions, Drawer, Form, Input, Modal, Space, Table, Tag, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { Building2, Eye, Pencil, Plus, RefreshCw } from 'lucide-react';
import { ManagementLayout, Filters } from '../../components/Layout/ManagementLayout';
import { branchService } from '../../services/branchService';
import { useRemoteResource } from '../../hooks/useRemoteResource';
import { useAuth } from '../../hooks/useAuth';
import { applyFormErrors, getErrorMessage } from '../../utils/apiErrors';
import { displayDate } from '../../utils/display';
import type { Branch, BranchRequest } from '../../types/branch';

export default function BranchManagement() {
  const { user } = useAuth();
  const { message } = App.useApp();
  const canEdit = user?.role === 'SUPER_ADMIN';
  const [query, setQuery] = useListQuery<{page:number;size:number;keyword?:string}>([]);
  const resource = useRemoteResource(branchService.list, query);
  const [form] = Form.useForm<BranchRequest>();
  const [editing, setEditing] = useState<Branch | null>(null);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<Branch | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string>();
  const [search, setSearch] = useState(query.keyword??'');
 useEffect(()=>setSearch(query.keyword??''),[query.keyword]);

  function openForm(branch: Branch | null) {
    setEditing(branch);
    setFormError(undefined);
    form.resetFields();
    if (branch) form.setFieldsValue({ code: branch.code, name: branch.name,
      phone: branch.phone, address: branch.address ?? '' });
    setOpen(true);
  }
  async function save(values: BranchRequest) {
    if (!canEdit || saving) return;
    setSaving(true);
    setFormError(undefined);
    const payload = { code: values.code.trim(), name: values.name.trim(),
      phone: values.phone.trim(), address: values.address?.trim() || undefined };
    try {
      const saved = editing ? await branchService.update(editing.id, payload) : await branchService.create(payload);
      message.success(editing ? 'Đã cập nhật chi nhánh.' : 'Đã tạo chi nhánh.');
      if (detail?.id === saved.id) setDetail(saved);
      setOpen(false);
      if (!editing) { setSearch(''); setQuery((q) => ({ ...q, page: 0, keyword: '' })); }
      resource.reload();
    } catch (error) {
      applyFormErrors(form, error);
      setFormError(getErrorMessage(error));
    } finally { setSaving(false); }
  }
  async function toggle(branch: Branch) {
    if (!canEdit || busyId !== null) return;
    setBusyId(branch.id);
    try {
      const saved = await branchService.toggle(branch.id);
      if (detail?.id === saved.id) setDetail(saved);
      message.success(saved.status === 'ACTIVE' ? 'Đã bật hoạt động chi nhánh.' : 'Đã ngừng hoạt động chi nhánh.');
      resource.reload();
    } catch (error) { message.error(getErrorMessage(error)); }
    finally { setBusyId(null); }
  }
  const columns: TableColumnsType<Branch> = [
    { title: 'Chi nhánh', dataIndex: 'name', width: 300, render: (_, b) => <Space align="start" style={{ maxWidth: '100%' }}>
      <Building2 size={20} color="#2563eb" />
      <div style={{ minWidth: 0 }}><Button type="link" style={{ padding: 0 }} onClick={() => setDetail(b)}>{b.name}</Button>
        <div><Typography.Text type="secondary">{b.code}</Typography.Text></div></div>
    </Space> },
    { title: 'Liên hệ', dataIndex: 'phone' },
    { title: 'Địa chỉ', dataIndex: 'address', render: (value) => value || '—', ellipsis: true },
    { title: 'Trạng thái', dataIndex: 'status', render: (status) =>
      <Tag color={status === 'ACTIVE' ? 'green' : 'default'}>{status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngừng hoạt động'}</Tag> },
    { title: 'Thao tác', key: 'actions', width: 160, render: (_, b) => <TableActions items={[
    ...((canEdit) ? ([
        {
            key: "action-1", label: "Sửa", icon: <Pencil size={14}/>, onClick: () => openForm(b)
        },
        {
            key: "action-2", label: b.status === 'ACTIVE' ? 'Ngừng' : 'Bật lại', loading: busyId === b.id, danger: b.status === 'ACTIVE', disabled: busyId !== null, confirm: {
                title: b.status === 'ACTIVE' ? 'Ngừng hoạt động chi nhánh?' : 'Bật hoạt động chi nhánh?', okText: "Xác nhận", cancelText: "Hủy", content: "Dữ liệu và lịch sử được giữ lại.", okButtonProps: {
                    danger: b.status === 'ACTIVE'
                }, onOk: () => toggle(b)
            }
        }
    ]) : [])
]}><Button size="small" icon={<Eye size={14}/>} onClick={() => setDetail(b)}>Xem</Button></TableActions> },
  ];
  return <ManagementLayout title="Chi nhánh" description="Quản lý thông tin và trạng thái các chi nhánh trong hệ thống."
    actions={<>
      <Button icon={<RefreshCw size={16} />} onClick={resource.reload} loading={resource.loading}>Tải lại</Button>
      {canEdit && <Button type="primary" icon={<Plus size={16} />} onClick={() => openForm(null)}>Thêm chi nhánh</Button>}
    </>}>
    {resource.error && <Alert type="error" showIcon title="Không tải được danh sách" description={resource.error}
      action={<Button onClick={resource.reload}>Thử lại</Button>} />}
    <Card>
      <Filters>
        <Input.Search className="search" placeholder="Tìm theo mã hoặc tên chi nhánh" allowClear enterButton
          value={search} onChange={(e) => { setSearch(e.target.value); if (!e.target.value) setQuery((q) => ({ ...q, keyword: '', page: 0 })); }}
          onSearch={(keyword) => setQuery((q) => ({ ...q, keyword: keyword.trim(), page: 0 }))} />
        <Typography.Text type="secondary">{resource.loading?'Đang tải…':resource.error?'—':resource.data?.totalElements??'—'} chi nhánh</Typography.Text>
      </Filters>
      {!resource.error&&<Table<Branch> rowKey="id" columns={columns} dataSource={resource.data?.content ?? []}
        loading={resource.loading} scroll={{ x: 900 }} locale={{ emptyText: resource.error ? 'Chưa tải được dữ liệu' : 'Không có chi nhánh phù hợp' }}
        pagination={{ current: query.page + 1, pageSize: query.size, total: resource.data?.totalElements ?? 0,
          showSizeChanger: true, pageSizeOptions: [10, 20, 50],
          onChange: (page, size) => setQuery((q) => ({ ...q, page: size !== q.size ? 0 : page - 1, size })) }} />}
    </Card>
    <Modal title={editing ? 'Chỉnh sửa chi nhánh' : 'Thêm chi nhánh'} open={open} forceRender
      onCancel={() => { if (!saving) setOpen(false); }} onOk={() => form.submit()}
      okText={editing ? 'Lưu thay đổi' : 'Tạo chi nhánh'} cancelText="Hủy" confirmLoading={saving}
      closable={!saving} maskClosable={!saving} cancelButtonProps={{ disabled: saving }}>
      <Form form={form} layout="vertical" onFinish={save} disabled={saving}>
        {formError && <Alert style={{ marginBottom: 16 }} type="error" showIcon title={formError} />}
        <Form.Item name="code" label="Mã chi nhánh" rules={[{ required: true, whitespace: true, message: 'Nhập mã chi nhánh.' }, { max: 255 }]}>
          <Input maxLength={255} placeholder="Ví dụ: CN02" />
        </Form.Item>
        <Form.Item name="name" label="Tên chi nhánh" rules={[{ required: true, whitespace: true, message: 'Nhập tên chi nhánh.' }, { max: 255 }]}>
          <Input maxLength={255} placeholder="Ví dụ: Language Center Quận 1" />
        </Form.Item>
        <Form.Item name="phone" label="Điện thoại" rules={[{ required: true, whitespace: true, message: 'Nhập số điện thoại liên hệ.' }, { max: 255 }]}>
          <Input maxLength={255} placeholder="Số điện thoại liên hệ" />
        </Form.Item>
        <Form.Item name="address" label="Địa chỉ" rules={[{ max: 255 }]}><Input.TextArea rows={2} maxLength={255} /></Form.Item>
        {!editing && <Typography.Paragraph type="secondary">Chi nhánh mới mặc định đang hoạt động.</Typography.Paragraph>}
      </Form>
    </Modal>
    <Drawer title="Thông tin chi nhánh" open={!!detail} onClose={() => setDetail(null)} size={460}>
      {detail && <Descriptions column={1} bordered items={[
        { key: 'code', label: 'Mã', children: detail.code },
        { key: 'name', label: 'Tên', children: detail.name },
        { key: 'phone', label: 'Điện thoại', children: detail.phone },
        { key: 'address', label: 'Địa chỉ', children: detail.address || '—' },
        { key: 'status', label: 'Trạng thái', children: detail.status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngừng hoạt động' },
        { key: 'created', label: 'Ngày tạo', children: displayDate(detail.createdAt) },
      ]} />}
    </Drawer>
  </ManagementLayout>;
}
