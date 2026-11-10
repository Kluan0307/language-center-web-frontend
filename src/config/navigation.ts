import type { Role } from '../types/auth';

export const ROLES: readonly Role[] = ['SUPER_ADMIN', 'ADMIN', 'STAFF', 'TEACHER'];
export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: 'Quản trị toàn hệ thống',
  ADMIN: 'Quản trị chi nhánh',
  STAFF: 'Nhân viên',
  TEACHER: 'Giáo viên',
};
const OPERATIONS: readonly Role[] = ['SUPER_ADMIN', 'ADMIN', 'STAFF'];
const MANAGERS: readonly Role[] = ['SUPER_ADMIN', 'ADMIN'];
const TEACHING: readonly Role[] = ['SUPER_ADMIN', 'ADMIN', 'TEACHER'];

export type NavigationIcon = 'dashboard' | 'branch' | 'accounts' | 'leads' | 'students'
  | 'teachers' | 'staff' | 'courses' | 'classes' | 'rooms' | 'schedule' | 'enrollment'
  | 'attendance' | 'exams' | 'grades' | 'documents' | 'tuition' | 'payments'
  | 'reports' | 'myClasses' | 'mySchedule';
export interface NavigationItem {
  id: string;
  path: string;
  label: string;
  group: string;
  icon: NavigationIcon;
  roles: readonly Role[];
  description: string;
  roleLabels?: Partial<Record<Role, string>>;
  roleDescriptions?: Partial<Record<Role, string>>;
}

// Shared by sidebar and route guards. Backend still enforces object and branch permissions.
export const NAVIGATION: readonly NavigationItem[] = [
  { id: 'dashboard', path: '/dashboard', label: 'Tổng quan', group: '', icon: 'dashboard', roles: ROLES,
    description: 'Theo dõi hoạt động trong phạm vi được phân quyền.',
    roleDescriptions: {
      SUPER_ADMIN: 'Tổng quan toàn chuỗi và từng chi nhánh.',
      ADMIN: 'Tổng quan vận hành và tài chính của chi nhánh.',
      STAFF: 'Tổng quan tuyển sinh, học viên và lớp trong chi nhánh.',
      TEACHER: 'Tổng quan các lớp được phân công và lịch dạy của bạn.',
    } },
  { id: 'branches', path: '/branches', label: 'Chi nhánh', group: 'HỆ THỐNG', icon: 'branch', roles: ['SUPER_ADMIN'],
    description: 'Tạo, cập nhật và bật/tắt chi nhánh.' },
  { id: 'accounts', path: '/accounts', label: 'Tài khoản', group: 'HỆ THỐNG', icon: 'accounts', roles: MANAGERS,
    description: 'Xem, tạo và khóa/mở tài khoản theo quyền.',
    roleDescriptions: { SUPER_ADMIN: 'Tạo Admin, Staff, Teacher và quản lý tài khoản theo chi nhánh.',
      ADMIN: 'Tạo và khóa/mở tài khoản Staff, Teacher trong chi nhánh của bạn.' } },
  { id: 'teachers', path: '/teachers', label: 'Giáo viên', group: 'NHÂN SỰ', icon: 'teachers', roles: OPERATIONS,
    description: 'Tra cứu giáo viên trong phạm vi được phép.',
    roleDescriptions: { STAFF: 'Chỉ tra cứu giáo viên đang khả dụng; không quản lý tài khoản.' } },
  { id: 'staff', path: '/staff', label: 'Nhân viên', group: 'NHÂN SỰ', icon: 'staff', roles: MANAGERS,
    description: 'Tra cứu nhân viên; tạo và khóa/mở tài khoản ở mục Tài khoản.' },
  { id: 'leads', path: '/leads', label: 'Khách hàng tiềm năng', group: 'TUYỂN SINH', icon: 'leads', roles: OPERATIONS,
    description: 'Chăm sóc Lead và chuyển đổi thành học viên.' },
  { id: 'students', path: '/students', label: 'Học viên', group: 'TUYỂN SINH', icon: 'students', roles: OPERATIONS,
    description: 'Quản lý hồ sơ và theo dõi lịch sử đăng ký của học viên.' },
  { id: 'courses', path: '/courses', label: 'Khóa học', group: 'HỌC VỤ', icon: 'courses', roles: OPERATIONS,
    description: 'Quản lý khóa học trong phạm vi được phép.',
    roleDescriptions: { SUPER_ADMIN: 'Quản lý khóa học chung và khóa học chi nhánh, bao gồm học phí.',
      ADMIN: 'Quản lý khóa học chi nhánh; không sửa khóa học chung.',
      STAFF: 'Xem và sửa thông tin được phép; không tạo khóa học hoặc thay đổi học phí.' } },
  { id: 'classes', path: '/classes', label: 'Lớp học', group: 'HỌC VỤ', icon: 'classes', roles: OPERATIONS,
    description: 'Quản lý thông tin lớp và danh sách học viên.',
    roleDescriptions: { STAFF: 'Tạo lớp không kèm lịch; không đổi khóa, giáo viên, phòng, ngày học hoặc trạng thái lớp đã có.' } },
  { id: 'rooms', path: '/rooms', label: 'Phòng học', group: 'HỌC VỤ', icon: 'rooms', roles: OPERATIONS,
    description: 'Quản lý phòng, sức chứa và trạng thái sử dụng.' },
  { id: 'schedule', path: '/schedule', label: 'Lịch học', group: 'HỌC VỤ', icon: 'schedule', roles: OPERATIONS,
    description: 'Xem và điều phối lịch, kiểm tra trùng giáo viên, phòng và học viên.',
    roleDescriptions: { STAFF: 'Xem lịch học trong chi nhánh; không tạo, sửa hoặc xóa lịch.' } },
  { id: 'enrollment', path: '/enrollment', label: 'Đăng ký & xếp lớp', group: 'HỌC VỤ', icon: 'enrollment', roles: OPERATIONS,
    description: 'Ghi danh, bảo lưu, học lại và chuyển lớp cùng khóa, cùng chi nhánh.' },
  { id: 'my-classes', path: '/my-classes', label: 'Lớp của tôi', group: 'GIẢNG DẠY', icon: 'myClasses', roles: ['TEACHER'],
    description: 'Xem các lớp được phân công, thông tin lớp và học viên trong lớp.' },
  { id: 'my-schedule', path: '/my-schedule', label: 'Lịch dạy của tôi', group: 'GIẢNG DẠY', icon: 'mySchedule', roles: ['TEACHER'],
    description: 'Xem lịch dạy của các lớp được phân công.' },
  { id: 'attendance', path: '/attendance', label: 'Điểm danh', group: 'HỌC VỤ', icon: 'attendance', roles: ROLES,
    description: 'Điểm danh theo ngày, xem lịch sử và tổng hợp chuyên cần.',
    roleDescriptions: { TEACHER: 'Chỉ điểm danh và xem chuyên cần các lớp được phân công.' } },
  { id: 'exams', path: '/exams', label: 'Bài kiểm tra', group: 'GIẢNG DẠY', icon: 'exams', roles: TEACHING,
    description: 'Quản lý bài kiểm tra, thang điểm và trọng số.',
    roleDescriptions: { TEACHER: 'Tạo và quản lý bài kiểm tra cho lớp của bạn.' } },
  { id: 'grades', path: '/grades', label: 'Bảng điểm & đánh giá', group: 'GIẢNG DẠY', icon: 'grades', roles: TEACHING,
    description: 'Xem điểm, lịch sử sửa điểm và đánh giá tổng hợp của lớp.',
    roleLabels: { TEACHER: 'Bảng điểm' },
    roleDescriptions: { TEACHER: 'Nhập, cập nhật và xem lịch sử điểm lớp mình; không truy cập báo cáo đánh giá tổng hợp.',
      ADMIN: 'Xem điểm, đánh giá lớp và sửa điểm đã có kèm lý do.',
      SUPER_ADMIN: 'Xem điểm, đánh giá lớp và sửa điểm đã có kèm lý do.' } },
  { id: 'documents', path: '/documents', label: 'Tài liệu', group: 'GIẢNG DẠY', icon: 'documents', roles: ROLES,
    description: 'Đăng, duyệt và tải tài liệu trong phạm vi được phép.',
    roleLabels: { TEACHER: 'Tài liệu của tôi' },
    roleDescriptions: { STAFF: 'Chỉ xem và tải tài liệu đã được duyệt.',
      TEACHER: 'Đăng tài liệu cho lớp/khóa được phân công; xem tài liệu mình đăng và trạng thái duyệt.' } },
  { id: 'tuition', path: '/tuition', label: 'Học phí & công nợ', group: 'TÀI CHÍNH', icon: 'tuition', roles: OPERATIONS,
    description: 'Theo dõi học phí, số đã đóng và số còn nợ.',
    roleDescriptions: { STAFF: 'Xem học phí và công nợ; không điều chỉnh số tiền học phí.',
      ADMIN: 'Theo dõi và điều chỉnh học phí kèm lý do.',
      SUPER_ADMIN: 'Theo dõi và điều chỉnh học phí kèm lý do.' } },
  { id: 'payments', path: '/payments', label: 'Phiếu thu', group: 'TÀI CHÍNH', icon: 'payments', roles: OPERATIONS,
    description: 'Thu tiền mặt/chuyển khoản, xem biên nhận; không sửa hoặc xóa phiếu thu.' },
  { id: 'reports', path: '/reports', label: 'Báo cáo', group: 'BÁO CÁO', icon: 'reports', roles: MANAGERS,
    description: 'Xem doanh thu, công nợ và thống kê vận hành.',
    roleDescriptions: { ADMIN: 'Báo cáo trong chi nhánh của bạn.',
      SUPER_ADMIN: 'Báo cáo toàn chuỗi hoặc theo chi nhánh.' } },
];

export function isRole(value: unknown): value is Role {
  return ROLES.some((role) => role === value);
}
export function canAccess(item: NavigationItem, role: Role | null | undefined): boolean {
  return isRole(role) && item.roles.includes(role);
}
export function getNavigation(role: Role | null | undefined): NavigationItem[] {
  return NAVIGATION.filter((item) => canAccess(item, role));
}
export function getNavigationGroups(role: Role) {
  const groups: { label: string; items: NavigationItem[] }[] = [];
  for (const item of getNavigation(role)) {
    const label = role === 'TEACHER' && item.id === 'attendance' ? 'GIẢNG DẠY' : item.group;
    let group = groups.find((entry) => entry.label === label);
    if (!group) { group = { label, items: [] }; groups.push(group); }
    group.items.push(item);
  }
  return groups;
}
export function getItemLabel(item: NavigationItem, role: Role): string {
  return item.roleLabels?.[role] ?? item.label;
}
export function getItemDescription(item: NavigationItem, role: Role): string {
  return item.roleDescriptions?.[role] ?? item.description;
}
