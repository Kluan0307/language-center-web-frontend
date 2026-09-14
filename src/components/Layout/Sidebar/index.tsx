import React from 'react';
import { NavLink } from 'react-router-dom';
import * as S from './Sidebar.styles';
import {
    LayoutDashboard,
    LogOut,
    Users,
    GraduationCap,
    BookOpen,
    School,
    ClipboardList,
    DoorOpen,
    CalendarCheck,
    CalendarDays,
    FileText,
    Award,
    BarChart3,
    ShieldCheck,
    ClipboardCheck,
    CreditCard,
    Receipt,
    PieChart,
    CalendarClock,
    BookMarked,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import AVATAR_DEFAULT from '../../../assets/images/avatar-default.png';
import type { Role } from '../../../types';

interface MenuItem {
    id: string;
    label: string;
    path: string;
    icon: React.ReactNode;
    roles: Role[];
}

interface MenuGroup {
    groupLabel?: string;
    items: MenuItem[];
}

const MENU_GROUPS: { [key in Role]: MenuGroup[] } = {
    ADMIN: [
        {
            items: [
                { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} />, roles: ['ADMIN'] },
            ],
        },
        {
            groupLabel: 'QUẢN LÝ',
            items: [
                { id: 'students', label: 'Học viên', path: '/students', icon: <Users size={18} />, roles: ['ADMIN'] },
                { id: 'teachers', label: 'Giáo viên', path: '/teachers', icon: <GraduationCap size={18} />, roles: ['ADMIN'] },
                { id: 'courses', label: 'Khóa học', path: '/courses', icon: <BookOpen size={18} />, roles: ['ADMIN'] },
                { id: 'classes', label: 'Lớp học', path: '/classes', icon: <School size={18} />, roles: ['ADMIN'] },
                { id: 'enrollment', label: 'Đăng ký / Xếp lớp', path: '/enrollment', icon: <ClipboardList size={18} />, roles: ['ADMIN'] },
                { id: 'rooms', label: 'Phòng học', path: '/rooms', icon: <DoorOpen size={18} />, roles: ['ADMIN'] },
                { id: 'attendance', label: 'Điểm danh', path: '/attendance', icon: <CalendarCheck size={18} />, roles: ['ADMIN'] },
            ],
        },
        {
            groupLabel: 'HỌC TẬP',
            items: [
                { id: 'schedule', label: 'Lịch học', path: '/schedule', icon: <CalendarDays size={18} />, roles: ['ADMIN'] },
                { id: 'exams', label: 'Kiểm tra & Kỳ thi', path: '/exams', icon: <ClipboardCheck size={18} />, roles: ['ADMIN'] },
                { id: 'grades', label: 'Đánh giá học viên', path: '/grades', icon: <Award size={18} />, roles: ['ADMIN'] },
                { id: 'documents', label: 'Tài liệu', path: '/documents', icon: <FileText size={18} />, roles: ['ADMIN'] },
            ],
        },
        {
            groupLabel: 'TÀI CHÍNH',
            items: [
                { id: 'tuition', label: 'Học phí', path: '/tuition', icon: <CreditCard size={18} />, roles: ['ADMIN'] },
                { id: 'reports', label: 'Báo cáo & Thống kê', path: '/reports', icon: <BarChart3 size={18} />, roles: ['ADMIN'] },
            ],
        },
        {
            groupLabel: 'HỆ THỐNG',
            items: [
                { id: 'accounts', label: 'Tài khoản', path: '/accounts', icon: <ShieldCheck size={18} />, roles: ['ADMIN'] },
            ],
        },
    ],

    STAFF: [
        {
            items: [
                { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} />, roles: ['STAFF'] },
            ],
        },
        {
            groupLabel: 'QUẢN LÝ',
            items: [
                { id: 'students', label: 'Học viên', path: '/students', icon: <Users size={18} />, roles: ['STAFF'] },
                { id: 'teachers', label: 'Giáo viên', path: '/teachers', icon: <GraduationCap size={18} />, roles: ['STAFF'] },
                { id: 'courses', label: 'Khóa học', path: '/courses', icon: <BookOpen size={18} />, roles: ['STAFF'] },
                { id: 'classes', label: 'Lớp học', path: '/classes', icon: <School size={18} />, roles: ['STAFF'] },
                { id: 'enrollment', label: 'Đăng ký / Xếp lớp', path: '/enrollment', icon: <ClipboardList size={18} />, roles: ['STAFF'] },
                { id: 'rooms', label: 'Phòng học', path: '/rooms', icon: <DoorOpen size={18} />, roles: ['STAFF'] },
                { id: 'attendance', label: 'Điểm danh', path: '/attendance', icon: <CalendarCheck size={18} />, roles: ['STAFF'] },
            ],
        },
        {
            groupLabel: 'HỌC TẬP',
            items: [
                { id: 'schedule', label: 'Lịch học', path: '/schedule', icon: <CalendarDays size={18} />, roles: ['STAFF'] },
                { id: 'documents', label: 'Tài liệu', path: '/documents', icon: <FileText size={18} />, roles: ['STAFF'] },
            ],
        },
        {
            groupLabel: 'TÀI CHÍNH',
            items: [
                { id: 'payments', label: 'Thanh toán', path: '/payments', icon: <Receipt size={18} />, roles: ['STAFF'] },
                { id: 'stats', label: 'Thống kê học viên/lớp', path: '/stats', icon: <PieChart size={18} />, roles: ['STAFF'] },
            ],
        },
    ],

    TEACHER: [
        {
            items: [
                { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} />, roles: ['TEACHER'] },
            ],
        },
        {
            groupLabel: 'CỦA TÔI',
            items: [
                { id: 'my-classes', label: 'Lớp học của tôi', path: '/my-classes', icon: <BookMarked size={18} />, roles: ['TEACHER'] },
                { id: 'attendance', label: 'Điểm danh', path: '/attendance', icon: <CalendarCheck size={18} />, roles: ['TEACHER'] },
                { id: 'my-schedule', label: 'Lịch dạy của tôi', path: '/my-schedule', icon: <CalendarClock size={18} />, roles: ['TEACHER'] },
                { id: 'exams', label: 'Kiểm tra & Kỳ thi', path: '/exams', icon: <ClipboardCheck size={18} />, roles: ['TEACHER'] },
                { id: 'grades', label: 'Đánh giá học viên', path: '/grades', icon: <Award size={18} />, roles: ['TEACHER'] },
                { id: 'documents', label: 'Tài liệu', path: '/documents', icon: <FileText size={18} />, roles: ['TEACHER'] },
            ],
        },
    ],
};

function Sidebar() {
    const { user, logout } = useAuth();
    const role = user?.role;

    // Lọc menu theo role hiện tại
    const menuGroups = role && MENU_GROUPS[role]
        ? MENU_GROUPS[role]
            .map((group) => ({
                ...group,
                items: group.items.filter((item) => item.roles.includes(role)),
            }))
            .filter((group) => group.items.length > 0)
        : [];

    return (
        <S.SidebarContainer>
            <S.SidebarTop>
                <S.Header>
                    <S.AvatarWrapper>
                        <img src={AVATAR_DEFAULT} alt="avatar" />
                    </S.AvatarWrapper>

                    <S.InfoWrapper>
                        <S.UserName>{user?.fullName || user?.username || 'Người dùng'}</S.UserName>
                        <S.UserRole>{user?.role ?? 'Chưa phân quyền'}</S.UserRole>
                    </S.InfoWrapper>
                </S.Header>

                <S.Menu>
                    {menuGroups.map((group, gi) => (
                        <S.MenuGroup key={gi}>
                            {group.groupLabel && (
                                <S.GroupLabel>{group.groupLabel}</S.GroupLabel>
                            )}
                            <ul>
                                {group.items.map((item) => (
                                    <li key={item.id}>
                                        <NavLink to={item.path} end={item.path === '/dashboard'}>
                                            <span className="icon">{item.icon}</span>
                                            <span>{item.label}</span>
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </S.MenuGroup>
                    ))}
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