import {scopeLabel as pageScopeLabel} from '../../utils/managementScope';
import {useListQuery} from '../../hooks/useListQuery';
import TableActions from '../../components/Common/TableActions';
import {useEffect,useState} from 'react';
import { App, Alert, Button, Card, Col, Descriptions, Drawer, Form, Input, InputNumber, Modal, Row, Select, Table, Tag, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { Eye, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { ManagementLayout, Filters } from '../../components/Layout/ManagementLayout';
import { BranchField, BranchFilter, LoadError } from '../../components/Common/Academic';
import { useBranches } from '../../hooks/useBranches';
import { useRemoteResource } from '../../hooks/useRemoteResource';
import { useAuth } from '../../hooks/useAuth';
import { roomService } from '../../services/academicService';
import { applyFormErrors, getErrorMessage } from '../../utils/apiErrors';
import { branchLabel } from '../../utils/academic';
import type { RoomDto, RoomQuery, RoomRequest } from '../../types/academic';

export default function RoomManagement() {
  const { user } = useAuth();
  const { message } = App.useApp();
  const branches = useBranches();
  const [query, setQuery] = useListQuery<RoomQuery>(['AVAILABLE','MAINTENANCE']);
  const list = useRemoteResource(roomService.list, query);
  const [search, setSearch] = useState(query.keyword??'');
 useEffect(()=>setSearch(query.keyword??''),[query.keyword]);
  const [form] = Form.useForm<RoomRequest>();
  const [editing, setEditing] = useState<RoomDto | null>(null);
  const [detail, setDetail] = useState<RoomDto | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string>();
  function openForm(room: RoomDto | null) {
    form.resetFields(); setEditing(room); setError(undefined);
    form.setFieldsValue(room ? { ...room, location: room.location ?? '', equipment: room.equipment ?? '' }
      : { branchId: query.branchId, capacity: 20 });
    setOpen(true);
  }
  async function save(values: RoomRequest) {
    if (busy) return;
    setBusy(true); setError(undefined);
    try {
      const saved = await roomService.save(editing?.id ?? null, { ...values, code: values.code.trim(), name: values.name.trim(),
        location: values.location?.trim() || undefined, equipment: values.equipment?.trim() || undefined,
        branchId: editing?.branchId ?? (user?.role === 'SUPER_ADMIN' ? values.branchId : undefined) });
      if (detail?.id === saved.id) setDetail(saved);
      message.success(editing ? 'Đã cập nhật phòng học.' : 'Đã tạo phòng học.');
      setOpen(false); list.reload();
    } catch (e) { applyFormErrors(form, e); setError(getErrorMessage(e)); }
    finally { setBusy(false); }
  }
  async function mutate(room: RoomDto, action: 'status' | 'delete') {
    if (busyId !== null) return;
    setBusyId(room.id);
    try {
      if (action === 'delete') { await roomService.remove(room.id); if (detail?.id === room.id) setDetail(null); }
      else { const saved = await roomService.status(room.id, room.status === 'AVAILABLE' ? 'MAINTENANCE' : 'AVAILABLE');
        if (detail?.id === saved.id) setDetail(saved); }
      message.success(action === 'delete' ? 'Đã xóa phòng học.' : 'Đã cập nhật trạng thái phòng.'); list.reload();
    } catch (e) { message.error(getErrorMessage(e)); }
    finally { setBusyId(null); }
  }
  const columns: TableColumnsType<RoomDto> = [
    { title: 'Phòng học', key: 'name', width: 230, render: (_, r) => <div>
      <Button type="link" style={{ padding: 0 }} onClick={() => setDetail(r)}>{r.name}</Button>
      <div><Typography.Text type="secondary">{r.code}</Typography.Text></div></div> },
    ...(user?.role === 'SUPER_ADMIN' ? [{ title: 'Chi nhánh', dataIndex: 'branchId', render: (id: number) => branchLabel(branches.data, id) }] : []),
    { title: 'Vị trí', dataIndex: 'location', render: (v) => v || '—' },
    { title: 'Sức chứa', dataIndex: 'capacity', render: (v) => `${v} chỗ` },
    { title: 'Trạng thái', dataIndex: 'status', render: (v) => <Tag color={v === 'AVAILABLE' ? 'green' : 'orange'}>{v === 'AVAILABLE' ? 'Sẵn sàng' : 'Bảo trì'}</Tag> },
    { title: 'Thao tác', key: 'actions', fixed: 'right' as const, width: 160, render: (_, r) => <TableActions items={[
    {
        key: "action-1", label: "Sửa", icon: <Pencil size={14}/>, onClick: () => openForm(r)
    },
    {
        key: "action-2", label: r.status === 'AVAILABLE' ? 'Bảo trì' : 'Sử dụng', loading: busyId === r.id, disabled: busyId !== null, confirm: {
            title: r.status === 'AVAILABLE' ? 'Đưa phòng vào bảo trì?' : 'Đưa phòng vào sử dụng?', okText: "Xác nhận", cancelText: "Hủy", content: undefined, okButtonProps: {
                danger: false
            }, onOk: () => mutate(r, 'status')
        }
    },
    {
        key: "action-3", label: "Xóa", icon: <Trash2 size={14}/>, danger: true, disabled: busyId !== null, confirm: {
            title: "Xóa phòng học?", okText: "Xóa", cancelText: "Hủy", content: "Chỉ xóa được phòng chưa được gán cho lớp nào.", okButtonProps: {
                danger: true
            }, onOk: () => mutate(r, 'delete')
        }
    }
]}><Button size="small" icon={<Eye size={14}/>} onClick={() => setDetail(r)}>Xem</Button></TableActions> },
  ];
  return <ManagementLayout scopeLabel={pageScopeLabel(user,branches.data,query.branchId,false)} title="Phòng học" description="Quản lý sức chứa, vị trí, thiết bị và trạng thái phòng."
    actions={<><Button icon={<RefreshCw size={16} />} onClick={list.reload} loading={list.loading}>Tải lại</Button>
      <Button type="primary" icon={<Plus size={16} />} onClick={() => openForm(null)}>Thêm phòng học</Button></>}>
    <LoadError error={list.error} reload={list.reload} />
    <Card>
      <Filters>
        <Input.Search className="search" value={search} enterButton allowClear placeholder="Tìm mã hoặc tên phòng"
          onChange={(e) => { setSearch(e.target.value); if (!e.target.value) setQuery((q) => ({ ...q, keyword: undefined, page: 0 })); }}
          onSearch={(keyword) => setQuery((q) => ({ ...q, keyword: keyword.trim() || undefined, page: 0 }))} />
        <Select className="filter" aria-label="Trạng thái phòng" placeholder="Tất cả trạng thái" allowClear value={query.status}
          options={[{ value: 'AVAILABLE', label: 'Sẵn sàng' }, { value: 'MAINTENANCE', label: 'Bảo trì' }]}
          onChange={(status) => setQuery((q) => ({ ...q, status, page: 0 }))} />
        <BranchFilter branches={branches.data} value={query.branchId} loading={branches.loading}
          onChange={(branchId) => setQuery((q) => ({ ...q, branchId, page: 0 }))} />
        <Typography.Text type="secondary">{list.loading?'Đang tải…':list.error?'—':list.data?.totalElements??'—'} phòng</Typography.Text>
      </Filters>
      {!list.error&&<Table<RoomDto> columns={columns} rowKey="id" dataSource={list.data?.content ?? []} loading={list.loading} scroll={{ x: 1050 }}
        locale={{ emptyText: list.error ? 'Chưa tải được dữ liệu' : 'Không có phòng phù hợp' }}
        pagination={{ current: query.page + 1, pageSize: query.size, total: list.data?.totalElements ?? 0, showSizeChanger: true,
          pageSizeOptions: [10, 20, 50], onChange: (page, size) => setQuery((q) => ({ ...q, page: size !== q.size ? 0 : page - 1, size })) }} />}
    </Card>
    <Modal open={open} title={editing ? 'Chỉnh sửa phòng học' : 'Thêm phòng học'} forceRender width={650}
      okText="Lưu phòng học" cancelText="Hủy" onOk={() => form.submit()} onCancel={() => { if (!busy) setOpen(false); }}
      confirmLoading={busy} closable={!busy} maskClosable={!busy} cancelButtonProps={{ disabled: busy }}>
      <Form form={form} layout="vertical" onFinish={save} disabled={busy}>
        {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}
        <LoadError error={branches.error} reload={branches.reload} />
        <BranchField branches={branches.data} editing={!!editing} loading={branches.loading} />
        <Row gutter={16}>
          <Col xs={24} sm={12}><Form.Item name="code" label="Mã phòng" rules={[{ required: true, whitespace: true, message: 'Nhập mã phòng.' }, { max: 255 }]}><Input maxLength={255} /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item name="name" label="Tên phòng" rules={[{ required: true, whitespace: true, message: 'Nhập tên phòng.' }, { max: 255 }]}><Input maxLength={255} /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item name="location" label="Vị trí" rules={[{ max: 255 }]}><Input maxLength={255} placeholder="Ví dụ: Tầng 2" /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item name="capacity" label="Sức chứa" rules={[{ required: true, message: 'Nhập sức chứa.' }, { type: 'number', min: 1 }]}>
            <InputNumber min={1} max={2147483647} precision={0} style={{ width: '100%' }} /></Form.Item></Col>
        </Row>
        <Form.Item name="equipment" label="Thiết bị"><Input.TextArea rows={3} /></Form.Item>
      </Form>
    </Modal>
    <Drawer open={!!detail} onClose={() => setDetail(null)} title="Thông tin phòng học" size={520}>
      {detail && <Descriptions bordered column={1} items={[
        { key: 'code', label: 'Mã', children: detail.code }, { key: 'name', label: 'Tên', children: detail.name },
        { key: 'branch', label: 'Chi nhánh', children: branchLabel(branches.data, detail.branchId) },
        { key: 'location', label: 'Vị trí', children: detail.location || '—' }, { key: 'capacity', label: 'Sức chứa', children: detail.capacity },
        { key: 'status', label: 'Trạng thái', children: detail.status === 'AVAILABLE' ? 'Sẵn sàng' : 'Bảo trì' },
        { key: 'equipment', label: 'Thiết bị', children: <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{detail.equipment || '—'}</Typography.Paragraph> },
      ]} />}
    </Drawer>
  </ManagementLayout>;
}
