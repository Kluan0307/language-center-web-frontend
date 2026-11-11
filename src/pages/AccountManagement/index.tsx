import { useState } from 'react';
import { Alert, App, Button, Card, Col, Descriptions, Divider, Drawer, Form, Input, Modal, Dropdown, Row, Select, Space, Table, Tag, Typography, DatePicker } from 'antd';
import type { TableColumnsType } from 'antd';
import type { Dayjs } from 'dayjs';
import { Eye, LockKeyhole, MoreHorizontal, Plus, RefreshCw, UnlockKeyhole } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ManagementLayout, Filters } from '../../components/Layout/ManagementLayout';
import { useAuth } from '../../hooks/useAuth';
import { useAccounts } from '../../hooks/useAccounts';
import { useRemoteResource } from '../../hooks/useRemoteResource';
import { branchService } from '../../services/branchService';
import { authService } from '../../services/authService';
import { canManageAccount, creatableRoles } from '../../utils/accountPermissions';
import { applyFormErrors, getErrorMessage } from '../../utils/apiErrors';
import { displayDate } from '../../utils/display';
import { ROLE_LABELS } from '../../config/navigation';
import type { CreateUserRequest, Role, UserResponse } from '../../types/auth';

import BranchAssignments from './BranchAssignments';
import ResetPassword from './ResetPassword';
import TeacherProfilePanel from './TeacherProfilePanel';

type AccountForm = Omit<CreateUserRequest, 'hireDate'> & { hireDate?: Dayjs; confirmPassword: string };
export default function AccountManagement({ fixedRole }: { fixedRole?: 'ADMIN' | 'STAFF' | 'TEACHER' }) {
  const { user } = useAuth();
  const { message, modal } = App.useApp();
  const [query, setQuery] = useState<{ page: number; size: number; keyword: string; branchId?: number; role?: Role }>({ page: 0, size: 10, keyword: '' });
  const resource = useAccounts({ ...query, role: fixedRole ?? query.role });
  const branches = useRemoteResource(branchService.all, {});
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<AccountForm>();
  const role = Form.useWatch('role', form);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string>();
  const [resetTarget,setResetTarget]=useState<UserResponse|null>(null);
  const [assignment,setAssignment]=useState<UserResponse|null>(null);
  const [detail, setDetail] = useState<UserResponse | null>(null);
  const [teacherProfile,setTeacherProfile]=useState<number|null>(null);
  if (!user) return null;
  const isSuper = user.role === 'SUPER_ADMIN';
  const allowedRoles = creatableRoles(user.role).filter((value) => !fixedRole || value === fixedRole);
  const activeBranches = branches.data?.filter((b) => b.status === 'ACTIVE') ?? [];
  const ownBranch = branches.data?.find((b) => b.id === user.branchId);
  const canCreate = allowedRoles.length > 0 && (isSuper ? activeBranches.length > 0 : ownBranch?.status === 'ACTIVE');
  const branchName = (id: number | null) => id === null ? 'Toàn hệ thống'
    : branches.data?.find((b) => b.id === id)?.name ?? `Chi nhánh #${id}`;
  const title = fixedRole === 'ADMIN' ? 'Quản trị viên' : fixedRole === 'TEACHER' ? 'Giáo viên' : fixedRole === 'STAFF' ? 'Nhân viên' : 'Tài khoản';
  function openCreate() {
    form.resetFields();
    form.setFieldsValue({ role: fixedRole ?? (isSuper ? 'ADMIN' : 'STAFF'),
      branchId: activeBranches.some((b) => b.id === query.branchId) ? query.branchId : undefined });
    setFormError(undefined);
    setOpen(true);
  }
  async function create(values: AccountForm) {
    const targetRole = fixedRole ?? values.role;
    if (!user || saving || !allowedRoles.includes(targetRole)) return;
    setSaving(true); setFormError(undefined);
    const optional = (value?: string) => value?.trim() || undefined;
    const payload: CreateUserRequest = {
      username: values.username.trim(), password: values.password, fullName: values.fullName.trim(),
      role: targetRole, branchId: isSuper ? values.branchId : undefined,
      email: optional(values.email), phone: optional(values.phone),
      hireDate: values.hireDate?.format('YYYY-MM-DD'), workStatus: 'ACTIVE',
      ...(targetRole === 'STAFF' ? { position: optional(values.position) } : {}),
      ...(targetRole === 'TEACHER' ? { specialization: optional(values.specialization),
        qualification: optional(values.qualification), experience: optional(values.experience), certificate: optional(values.certificate) } : {}),
    };
    try {
      await authService.createAccount(payload);
      message.success('Đã tạo tài khoản. Người dùng đăng nhập bằng mật khẩu tạm và phải đổi mật khẩu trước khi vào nghiệp vụ.');
      setOpen(false); setSearch('');
      setQuery((q) => ({ ...q, page: 0, keyword: '', role: fixedRole, branchId: isSuper ? values.branchId : undefined }));
      resource.reload();
    } catch (error) { applyFormErrors(form, error); setFormError(getErrorMessage(error)); }
    finally { setSaving(false); }
  }
  async function toggle(target: UserResponse) {
    if (!user || !canManageAccount(user, target) || busyId !== null) return;
    setBusyId(target.accountId);
    try {
      const saved = await authService.toggleAccountStatus(target.accountId);
      if (detail?.accountId === saved.accountId) setDetail(saved);
      message.success(saved.status ? 'Đã mở tài khoản.' : 'Đã khóa tài khoản.');
      resource.reload();
    } catch (error) { message.error(getErrorMessage(error)); }
    finally { setBusyId(null); }
  }
  const columns: TableColumnsType<UserResponse> = [
    { title: 'Tài khoản', dataIndex: 'username', render: (_, account) => <div>
      <Button type="link" style={{ padding: 0 }} onClick={() => setDetail(account)}>{account.fullName || account.username}</Button>
      <div><Typography.Text type="secondary">{account.username}</Typography.Text></div>
    </div> },
    { title: 'Vai trò', dataIndex: 'role', render: (value: Role) => <Tag color={value === 'SUPER_ADMIN' ? 'purple' : value === 'ADMIN' ? 'blue' : value === 'TEACHER' ? 'cyan' : 'default'}>{ROLE_LABELS[value]}</Tag> },
    ...(isSuper ? [{ title: 'Chi nhánh', key: 'branches', render: (_:unknown,a:UserResponse) => a.role==='SUPER_ADMIN'?'Toàn hệ thống':(a.branchIds??(a.branchId?[a.branchId]:[])).map(id=>branchName(id)).join(', ')||'Chưa phân công' }] : []),
    { title: 'Liên hệ', key: 'contact', render: (_, a) => <div>{a.phone || '—'}<div><Typography.Text type="secondary">{a.email}</Typography.Text></div></div> },
    { title: 'Trạng thái', dataIndex: 'status', render: (value,account) => <><Tag color={value ? 'green' : 'default'}>{value ? 'Đang hoạt động' : 'Đã khóa'}</Tag>{account.mustChangePassword&&<Tag color="orange">Cần đổi mật khẩu</Tag>}</> },
    { title: 'Thao tác', key: 'actions', width: 132, render: (_, a) => {
      const manageable = canManageAccount(user, a);
      const items = [
        ...(isSuper && a.role !== 'SUPER_ADMIN' ? [{ key: 'branches', label: 'Phân công chi nhánh', onClick: () => setAssignment(a) }] : []),
        ...(manageable ? [
          { key: 'password', label: 'Cấp lại mật khẩu', onClick: () => setResetTarget(a) },
          { key: 'status', label: a.status ? 'Khóa tài khoản' : 'Mở khóa tài khoản', danger: a.status,
            disabled: busyId !== null,
            icon: a.status ? <LockKeyhole size={14} /> : <UnlockKeyhole size={14} />,
            onClick: () => modal.confirm({
              title: a.status ? 'Khóa tài khoản này?' : 'Mở lại tài khoản này?',
              content: a.status ? 'Người dùng sẽ không đăng nhập lại được khi bị khóa.' : undefined,
              okText: 'Xác nhận', cancelText: 'Hủy', okButtonProps: { danger: a.status },
              onOk: () => toggle(a),
            }),
          },
        ] : []),
      ];
      return <Space size={4} wrap={false}>
        <Button size="small" icon={<Eye size={14} />} onClick={() => a.role === 'TEACHER' && a.profileId ? setTeacherProfile(a.profileId) : setDetail(a)}>Xem</Button>
        {items.length > 0 && <Dropdown trigger={['click']} menu={{ items }} placement="bottomRight">
          <Button size="small" icon={<MoreHorizontal size={16} />} loading={busyId === a.accountId}
            disabled={busyId !== null} aria-label={'Thao tác khác cho ' + a.username} />
        </Dropdown>}
      </Space>;
    } },
  ];
  return <ManagementLayout title={title}
    description={fixedRole === 'ADMIN' ? 'Quản lý Admin, phân công các chi nhánh phụ trách và theo dõi lịch sử thay đổi.' : isSuper ? 'Quản lý tài khoản và hồ sơ nhân sự theo từng chi nhánh.' : 'Quản lý nhân sự trong chi nhánh của bạn.'}
    actions={<>
      <Button icon={<RefreshCw size={16} />} onClick={() => { resource.reload(); branches.reload(); }} loading={resource.loading}>Tải lại</Button>
      <Button type="primary" icon={<Plus size={16} />} disabled={!canCreate} onClick={openCreate}>{fixedRole === 'ADMIN' ? 'Tạo quản trị viên' : 'Tạo tài khoản'}</Button>
    </>}>
    {branches.error && <Alert showIcon type="warning" title="Chưa tải được thông tin chi nhánh" description={branches.error}
      action={<Button onClick={branches.reload}>Thử lại</Button>} />}
    {!branches.loading && !branches.error && !canCreate && <Alert showIcon type="warning" title="Chưa thể tạo tài khoản"
      description={isSuper ? <span>Cần ít nhất một chi nhánh đang hoạt động. <Link to="/branches">Quản lý chi nhánh</Link></span>
        : 'Chi nhánh của bạn chưa được gán hoặc đang ngừng hoạt động.'} />}
    {resource.error && <Alert showIcon type="error" title="Không tải được danh sách" description={resource.error}
      action={<Button onClick={resource.reload}>Thử lại</Button>} />}
    <Card>
      <Filters>
        <Input.Search className="search" value={search} allowClear enterButton placeholder={fixedRole === 'ADMIN' ? 'Tìm tên đăng nhập quản trị viên' : 'Tìm tên đăng nhập hoặc họ tên giáo viên'}
          onChange={(e) => { setSearch(e.target.value); if (!e.target.value) setQuery((q) => ({ ...q, page: 0, keyword: '' })); }}
          onSearch={(keyword) => setQuery((q) => ({ ...q, keyword: keyword.trim(), page: 0 }))} />
        {!fixedRole && <Select className="filter" placeholder="Tất cả vai trò" allowClear value={query.role}
          aria-label="Lọc vai trò" options={Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }))}
          onChange={(role: Role | undefined) => setQuery((q) => ({ ...q, role, page: 0 }))} />}
        {isSuper && <Select className="filter" placeholder="Tất cả chi nhánh" allowClear showSearch optionFilterProp="label"
          aria-label="Lọc chi nhánh" loading={branches.loading} value={query.branchId}
          options={branches.data?.map((b) => ({ value: b.id, label: `${b.code} · ${b.name}${b.status === 'INACTIVE' ? ' (Ngừng)' : ''}` }))}
          onChange={(branchId: number | undefined) => setQuery((q) => ({ ...q, branchId, page: 0 }))} />}
        <Typography.Text type="secondary">{resource.data?.totalElements ?? 0} tài khoản</Typography.Text>
      </Filters>
      <Table<UserResponse> rowKey="accountId" columns={columns} dataSource={resource.accounts}
        loading={resource.loading} scroll={{ x: isSuper ? 1100 : 900 }}
        locale={{ emptyText: resource.error ? 'Chưa tải được dữ liệu' : 'Không có tài khoản phù hợp' }}
        pagination={{ current: query.page + 1, pageSize: query.size, total: resource.data?.totalElements ?? 0,
          showSizeChanger: true, pageSizeOptions: [10, 20, 50],
          onChange: (page, size) => setQuery((q) => ({ ...q, page: size !== q.size ? 0 : page - 1, size })) }} />
    </Card>
    <Modal title={fixedRole === 'ADMIN' ? 'Tạo quản trị viên' : 'Tạo tài khoản nhân sự'} open={open} width={720} forceRender
      onCancel={() => { if (!saving) setOpen(false); }} onOk={() => form.submit()} okText={fixedRole === 'ADMIN' ? 'Tạo quản trị viên' : 'Tạo tài khoản'} cancelText="Hủy"
      confirmLoading={saving} closable={!saving} maskClosable={!saving} cancelButtonProps={{ disabled: saving }}>
      <Form<AccountForm> form={form} layout="vertical" onFinish={create} disabled={saving}>
        {formError && <Alert showIcon type="error" title={formError} style={{ marginBottom: 16 }} />}
        <Row gutter={16}>
          <Col xs={24} sm={12}><Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
            <Select disabled={!!fixedRole} options={allowedRoles.map((value) => ({ value, label: ROLE_LABELS[value] }))} />
          </Form.Item></Col>
          <Col xs={24} sm={12}>{isSuper ? <Form.Item name="branchId" label="Chi nhánh"
            rules={[{ required: true, message: 'Chọn chi nhánh đang hoạt động.' }]}>
            <Select showSearch optionFilterProp="label" placeholder="Chọn chi nhánh" loading={branches.loading}
              options={branches.data?.map((b) => ({ value: b.id, disabled: b.status !== 'ACTIVE', label: `${b.code} · ${b.name}` }))} />
          </Form.Item> : <Form.Item label="Chi nhánh"><Input disabled value={branchName(user.branchId)} /></Form.Item>}</Col>
          <Col xs={24} sm={12}><Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, whitespace: true, message: 'Nhập họ tên.' }, { max: 100 }]}>
            <Input maxLength={100} autoComplete="name" /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true, message: 'Nhập tên đăng nhập.' },
            { pattern: /^[A-Za-z0-9_.@-]{3,50}$/, message: 'Dùng 3–50 chữ, số hoặc các ký tự _.@-' }]}>
            <Input maxLength={50} autoComplete="off" /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email không hợp lệ.' }, { max: 100 }]}>
            <Input maxLength={100} autoComplete="email" /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item name="phone" label="Điện thoại" rules={[{ max: 15 }]}>
            <Input maxLength={15} autoComplete="tel" /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item name="password" label="Mật khẩu tạm" rules={[{ required: true, message: 'Nhập mật khẩu.' },
            { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự.' },
            { validator: (_, value: string) => !value || new TextEncoder().encode(value).length <= 72
              ? Promise.resolve() : Promise.reject(new Error('Mật khẩu không được vượt 72 byte UTF-8.')) }]}>
            <Input.Password autoComplete="new-password" /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item name="confirmPassword" label="Xác nhận mật khẩu" dependencies={['password']}
            rules={[{ required: true, message: 'Nhập lại mật khẩu.' }, ({ getFieldValue }) => ({
              validator: (_, value) => !value || getFieldValue('password') === value ? Promise.resolve() : Promise.reject(new Error('Mật khẩu xác nhận chưa khớp.')),
            })]}><Input.Password autoComplete="new-password" /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item name="hireDate" label="Ngày bắt đầu làm việc"><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
          {role === 'STAFF' && <Col xs={24} sm={12}><Form.Item name="position" label="Vị trí công việc" preserve={false} rules={[{ max: 100 }]}><Input maxLength={100} /></Form.Item></Col>}
        </Row>
        {role === 'TEACHER' && <>
          <Divider>Thông tin giảng dạy</Divider>
          <Row gutter={16}>
            <Col xs={24} sm={12}><Form.Item name="specialization" label="Chuyên môn" preserve={false} rules={[{ max: 100 }]}><Input maxLength={100} /></Form.Item></Col>
            <Col xs={24} sm={12}><Form.Item name="qualification" label="Trình độ" preserve={false} rules={[{ max: 100 }]}><Input maxLength={100} /></Form.Item></Col>
            <Col xs={24} sm={12}><Form.Item name="experience" label="Kinh nghiệm" preserve={false} rules={[{ max: 50 }]}><Input maxLength={50} placeholder="Ví dụ: 3 năm" /></Form.Item></Col>
            <Col xs={24} sm={12}><Form.Item name="certificate" label="Chứng chỉ" preserve={false} rules={[{ max: 255 }]}><Input maxLength={255} /></Form.Item></Col>
          </Row>
        </>}
      </Form>
    </Modal>
    <Drawer title="Hồ sơ tài khoản" open={!!detail} onClose={() => setDetail(null)} size={520}>
      {detail && <Descriptions column={1} bordered items={[
        { key: 'name', label: 'Họ tên', children: detail.fullName || '—' },
        { key: 'username', label: 'Tên đăng nhập', children: detail.username },
        { key: 'role', label: 'Vai trò', children: ROLE_LABELS[detail.role] },
        { key: 'branch', label: 'Chi nhánh', children: detail.role==='SUPER_ADMIN'?'Toàn hệ thống':(detail.branchIds??(detail.branchId?[detail.branchId]:[])).map(id=>branchName(id)+(id===detail.branchId?' (Chính)':'')).join(', ')||'Chưa phân công' },
        { key: 'status', label: 'Tài khoản', children: detail.status ? 'Đang hoạt động' : 'Đã khóa' },
        { key: 'phone', label: 'Điện thoại', children: detail.phone || '—' },
        { key: 'email', label: 'Email', children: detail.email || '—' },
        { key: 'hire', label: 'Ngày vào làm', children: displayDate(detail.hireDate, false) },
        ...(detail.role !== 'SUPER_ADMIN' ? [{ key: 'work', label: 'Trạng thái làm việc', children: detail.workStatus === 'ACTIVE' ? 'Đang làm việc' : detail.workStatus === 'INACTIVE' ? 'Ngừng làm việc' : detail.workStatus || '—' }] : []),
        { key: 'created', label: 'Ngày tạo', children: displayDate(detail.createdAt) },
        { key: 'login', label: 'Đăng nhập gần nhất', children: displayDate(detail.lastLogin) },
        ...(detail.role === 'STAFF' ? [{ key: 'position', label: 'Vị trí', children: detail.position || '—' }] : []),
        ...(detail.role === 'TEACHER' ? [
          { key: 'spec', label: 'Chuyên môn', children: detail.specialization || '—' },
          { key: 'qualification', label: 'Trình độ', children: detail.qualification || '—' },
          { key: 'experience', label: 'Kinh nghiệm', children: detail.experience || '—' },
          { key: 'certificate', label: 'Chứng chỉ', children: detail.certificate || '—' },
        ] : []),
      ]} />}
    </Drawer>
    {resetTarget&&<ResetPassword account={resetTarget} onClose={()=>setResetTarget(null)} onSaved={()=>{setResetTarget(null);setDetail(null);resource.reload();}}/>}
    {assignment&&<BranchAssignments account={assignment} branches={branches.data} onClose={()=>setAssignment(null)} onSaved={saved=>{setAssignment(null);if(detail?.accountId===saved.accountId)setDetail(saved);resource.reload();}}/>}
  {teacherProfile!==null&&<TeacherProfilePanel key={teacherProfile} id={teacherProfile} onClose={()=>setTeacherProfile(null)} onChanged={resource.reload}/>}</ManagementLayout>;
}

