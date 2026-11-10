import { useState } from 'react';
import { Button, Drawer } from 'antd';
import { Menu as MenuIcon } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, LogOut, Building2, UserPlus, Users, GraduationCap, UserCheck,
  BookOpen, School, ClipboardList, DoorOpen, CalendarCheck, CalendarDays, FileText,
  Award, BarChart3, ShieldCheck, ClipboardCheck, CreditCard, Receipt, CalendarClock,
  BookMarked, type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import {
  getNavigationGroups, getItemLabel, ROLE_LABELS, type NavigationIcon,
} from '../../../config/navigation';
import AVATAR_DEFAULT from '../../../assets/images/avatar-default.png';
import * as S from './Sidebar.styles';
import BranchSwitcher from './BranchSwitcher';

const ICONS: Record<NavigationIcon, LucideIcon> = {
  dashboard: LayoutDashboard, branch: Building2, accounts: ShieldCheck,
  leads: UserPlus, students: Users, teachers: GraduationCap, staff: UserCheck,
  courses: BookOpen, classes: School, rooms: DoorOpen, schedule: CalendarDays,
  enrollment: ClipboardList, attendance: CalendarCheck, exams: ClipboardCheck,
  grades: Award, documents: FileText, tuition: CreditCard, payments: Receipt,
  reports: BarChart3, myClasses: BookMarked, mySchedule: CalendarClock,
};

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const role = user?.role;
  const groups = role ? getNavigationGroups(role) : [];
  const content = (<>
      <S.SidebarTop>
        <S.Header>
          <S.AvatarWrapper><img src={AVATAR_DEFAULT} alt="" /></S.AvatarWrapper>
          <S.InfoWrapper>
            <S.UserName as="button" type="button" onClick={() => navigate('/profile')} title="Xem hồ sơ của tôi"
              style={{ border: 0, padding: 0, background: 'transparent', textAlign: 'left', cursor: 'pointer' }}>
              {user?.fullName || user?.username || 'Người dùng'}
            </S.UserName>
            <S.UserRole>{role ? ROLE_LABELS[role] : 'Chưa xác thực'}</S.UserRole>
            <S.UserRole>
              {role === 'SUPER_ADMIN' ? 'Phạm vi: toàn hệ thống'
                : user?.branchId ? `Chi nhánh #${user.branchId}` : 'Chưa được gán chi nhánh'}
            </S.UserRole>
          </S.InfoWrapper>
        </S.Header>
        <BranchSwitcher />
        <S.Menu aria-label="Điều hướng chính">
          {groups.map((group) => (
            <S.MenuGroup key={group.label || 'overview'}>
              {group.label && <S.GroupLabel>{group.label}</S.GroupLabel>}
              <ul>
                {group.items.map((item) => {
                  const Icon = ICONS[item.icon];
                  return (
                    <li key={item.id}>
                      <NavLink to={item.path} end onClick={() => setOpen(false)}>
                        <span className="icon"><Icon size={18} aria-hidden="true" /></span>
                        <span>{getItemLabel(item, role!)}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </S.MenuGroup>
          ))}
        </S.Menu>
      </S.SidebarTop>
      <S.SidebarBottom>
        <S.LogoutButton type="button" onClick={() => { setOpen(false); logout(); }}>
          <LogOut size={18} aria-hidden="true" /><span>Đăng xuất</span>
        </S.LogoutButton>
      </S.SidebarBottom>
    </>);
  return (<>
    <S.MobileBar><Button aria-label="Mở menu điều hướng" aria-expanded={open} aria-controls="mobile-navigation" icon={<MenuIcon size={20}/>} onClick={()=>setOpen(true)}>Menu</Button><strong>Language Center</strong></S.MobileBar>
    <S.DesktopSlot><S.SidebarContainer>{content}</S.SidebarContainer></S.DesktopSlot>
    <Drawer id="mobile-navigation" title="Điều hướng" placement="left" size={280} open={open} onClose={()=>setOpen(false)}
      styles={{body:{display:'flex',flexDirection:'column',padding:14,overflow:'hidden'}}}>{content}</Drawer>
  </>);
}
export default Sidebar;
