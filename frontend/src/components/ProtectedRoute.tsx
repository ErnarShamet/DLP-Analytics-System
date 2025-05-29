// frontend/src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/hooks'; // Redux hook
import { selectIsAuthenticated, selectUser } from '../store/slices/authSlice'; // Redux auth selectors

interface ProtectedRouteProps {
  allowedRoles?: string[]; // Roles that are allowed to access this route
  children?: React.ReactNode; // For wrapping specific components if not using Outlet
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const user = useAppSelector(selectUser);
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to so we can send them along after they login.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && allowedRoles.length > 0 && user?.role && !allowedRoles.includes(user.role)) {
        // User is authenticated but does not have the required role
        // Redirect to a "not authorized" page or dashboard
        // For simplicity, redirecting to dashboard. Consider a dedicated 403 page.
        return <Navigate to="/dashboard" state={{ from: location }} replace />;
        // Or: return <Navigate to="/unauthorized" replace />;
    }

    return children ? <>{children}</> : <Outlet />; // Render children or Outlet for nested routes
};

export default ProtectedRoute;