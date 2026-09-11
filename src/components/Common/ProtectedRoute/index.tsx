import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import type { Role } from '../../../types';

interface ProtectedRouteProps {
    allowedRoles?: Role[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
        return null;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/overview" replace />;
    }

    return <Outlet />;
}
