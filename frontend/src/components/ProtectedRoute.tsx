// frontend/src/components/ProtectedRoute.tsx

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/hooks'; 
import { selectIsAuthenticated, selectUser } from '../store/slices/authSlice'; 

interface ProtectedRouteProps {
  allowedRoles?: string[]; 
  children?: React.ReactNode; 
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const user = useAppSelector(selectUser);
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && allowedRoles.length > 0 && user?.role && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" state={{ from: location }} replace />;
    }

    return children ? <>{children}</> : <Outlet />; 
};

export default ProtectedRoute;
