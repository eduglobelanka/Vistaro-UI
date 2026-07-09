import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has at least one of the allowed roles
  const hasRole = user.roles.some((role) => allowedRoles.includes(role));

  if (!hasRole) {
    return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
