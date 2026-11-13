import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Button, Result, Space, Spin } from 'antd';
import { useAuth } from '../../../hooks/useAuth';
import { isRole } from '../../../config/navigation';
import type { Role } from '../../../types';

interface ProtectedRouteProps { allowedRoles?: readonly Role[] }
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, sessionError, refreshUser, logout } = useAuth();
  const location = useLocation();
  if (isLoading) return <Spin fullscreen description="Đang xác thực tài khoản…" />;
  if (sessionError) return <Result status="warning" title="Chưa thể xác thực phiên đăng nhập"
    subTitle={sessionError} extra={<Space>
      <Button type="primary" onClick={() => void refreshUser()}>Thử lại</Button>
      <Button onClick={logout}>Về đăng nhập</Button>
    </Space>} />;
  if (!isAuthenticated || !isRole(user?.role)) return <Navigate to="/login" replace />;
  if (user.mustChangePassword && location.pathname !== '/change-password') return <Navigate to="/change-password" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/forbidden" state={{ from: location.pathname }} replace />;
  }
  return <Outlet />;
}

