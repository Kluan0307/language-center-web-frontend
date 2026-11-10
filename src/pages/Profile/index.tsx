import AccountSettings from './AccountSettings';
import { Card, Descriptions, Typography } from 'antd';
import { ManagementLayout } from '../../components/Layout/ManagementLayout';
import { useAuth } from '../../hooks/useAuth';
import { ROLE_LABELS } from '../../config/navigation';
import { displayDate } from '../../utils/display';

export default function Profile() {
  const { user } = useAuth();
  if (!user) return null;
  return <ManagementLayout title="Hồ sơ của tôi" description="Thông tin tài khoản và phạm vi làm việc của bạn.">
    <Card>
      <Descriptions bordered column={{ xs: 1, md: 2 }} items={[
        { key: 'name', label: 'Họ tên', children: user.fullName || '—' },
        { key: 'username', label: 'Tên đăng nhập', children: user.username },
        { key: 'role', label: 'Vai trò', children: ROLE_LABELS[user.role] },
        { key: 'branch', label: 'Phạm vi', children: user.role === 'SUPER_ADMIN' ? 'Toàn hệ thống' : (user.branchIds??[]).map(id=>'Chi nhánh #'+id+(id===user.primaryBranchId?' (Chính)':'')).join(', ')||'Chưa phân công' },
        { key: 'email', label: 'Email', children: user.email || '—' },
        { key: 'phone', label: 'Điện thoại', children: user.phone || '—' },
        ...(user.role !== 'SUPER_ADMIN' ? [
          { key: 'hire', label: 'Ngày vào làm', children: displayDate(user.hireDate, false) },
          { key: 'work', label: 'Trạng thái làm việc', children: user.workStatus === 'ACTIVE' ? 'Đang làm việc' : user.workStatus === 'INACTIVE' ? 'Ngừng làm việc' : user.workStatus || '—' },
        ] : []),
        ...(user.role === 'STAFF' ? [{ key: 'position', label: 'Vị trí', children: user.position || '—' }] : []),
        ...(user.role === 'TEACHER' ? [
          { key: 'spec', label: 'Chuyên môn', children: user.specialization || '—' },
          { key: 'qualification', label: 'Trình độ', children: user.qualification || '—' },
          { key: 'experience', label: 'Kinh nghiệm', children: user.experience || '—' },
          { key: 'certificate', label: 'Chứng chỉ', children: user.certificate || '—' },
        ] : []),
        { key: 'created', label: 'Ngày tạo', children: displayDate(user.createdAt) },
        { key: 'passwordChanged', label: 'Mật khẩu cập nhật', children: displayDate(user.passwordChangedAt??null) },
        { key: 'last', label: 'Đăng nhập gần nhất', children: displayDate(user.lastLogin) },
      ]} />
      <Typography.Paragraph type="secondary" style={{ marginTop: 20, marginBottom: 0 }}>
        Thông tin nhân sự do người quản lý cập nhật. Bạn có thể sửa liên hệ bên dưới.
      </Typography.Paragraph>
    </Card>
    <AccountSettings/>
  </ManagementLayout>;
}

