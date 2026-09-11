import { NavLink } from 'react-router-dom';
import * as S from './Sidebar.styles';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import AVATAR_DEFAULT from '../../../assets/images/avatar-default.png';
import type { Role } from '../../../types';

interface MenuItem {
    id: string;
    label: string;
    path: string;
    icon: React.ReactNode;
}

const adminMenuItems: MenuItem[] = [
    { id: 'overview', label: 'Tổng quan', path: '/overview', icon: <LayoutDashboard size={18} /> },
    { id: 'admin', label: 'Admin', path: '/admin', icon: <LayoutDashboard size={18} /> },
];

const staffMenuItems: MenuItem[] = [
    { id: 'overview', label: 'Tổng quan', path: '/overview', icon: <LayoutDashboard size={18} /> },
    { id: 'staff', label: 'Staff', path: '/staff', icon: <LayoutDashboard size={18} /> },
];

const teacherMenuItems: MenuItem[] = [
    { id: 'overview', label: 'Tổng quan', path: '/overview', icon: <LayoutDashboard size={18} /> },
    { id: 'teacher', label: 'Teacher', path: '/teacher', icon: <LayoutDashboard size={18} /> },
];

function getMenuItemsByRole(role?: Role): MenuItem[] {
    switch (role) {
        case 'ADMIN':
            return adminMenuItems;
        case 'STAFF':
            return staffMenuItems;
        case 'TEACHER':
            return teacherMenuItems;
        default:
            return [];
    }
}

function Sidebar() {
    const { user, logout } = useAuth();
    const menuItems = getMenuItemsByRole(user?.role);

    return (
        <S.SidebarContainer>
            <S.SidebarTop>
                <S.Header>
                    <S.AvatarWrapper>
                        <img src={AVATAR_DEFAULT} alt="avatar" />
                    </S.AvatarWrapper>

                    <S.InfoWrapper>
                        <S.UserName>{user?.fullName || user?.username || 'Người dùng'}</S.UserName>
                        <S.UserRole>{user?.role ? `Role: ${user.role}` : 'Chưa phân quyền'}</S.UserRole>
                    </S.InfoWrapper>
                </S.Header>

                <S.Menu>
                    <ul>
                        {menuItems.map((item) => (
                            <li key={item.id}>
                                <NavLink to={item.path}>
                                    <span className="icon">{item.icon}</span>
                                    <span>{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </S.Menu>
            </S.SidebarTop>

            <S.SidebarBottom>
                <S.LogoutButton type="button" onClick={logout}>
                    <LogOut size={18} />
                    <span>Đăng xuất</span>
                </S.LogoutButton>
            </S.SidebarBottom>
        </S.SidebarContainer>
    );
}

export default Sidebar;