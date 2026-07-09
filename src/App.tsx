import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';
import { AuthProvider } from './contexts/AuthContext';

// Auth Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleGuard from './components/auth/RoleGuard';

// Layout Components
import DashboardLayout from './components/layout/DashboardLayout';

// Public Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard / Redirect Pages
import DashboardRedirect from './pages/shared/DashboardRedirect';
import Forbidden from './pages/shared/Forbidden';
import Landing from './pages/shared/Landing';

// Role-specific Dashboards
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import EmployerDashboard from './pages/shop-owner/EmployerDashboard';
import UserManager from './pages/admin/UserManager';
import AuditLogs from './pages/admin/AuditLogs';

// Role-specific Pages
import StudentProfile from './pages/student/Profile';
import ShopOwnerProfile from './pages/shop-owner/Profile';
import Documents from './pages/shop-owner/Documents';

// Phase 3 Pages
import SearchJobs from './pages/student/SearchJobs';
import MyApplications from './pages/student/MyApplications';
import ManageJobs from './pages/shop-owner/ManageJobs';
import SearchStudents from './pages/shop-owner/SearchStudents';

// Phase 4 Pages
import Inbox from './pages/messaging/Inbox';

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Workspace Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<DashboardRedirect />} />
              <Route path="forbidden" element={<Forbidden />} />

              {/* Admin Only Routes */}
              <Route
                path="admin"
                element={
                  <RoleGuard allowedRoles={['Admin']}>
                    <OutletWrapper />
                  </RoleGuard>
                }
              >
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UserManager />} />
                <Route path="audit-logs" element={<AuditLogs />} />
              </Route>

              {/* Student Only Routes */}
              <Route
                path="student"
                element={
                  <RoleGuard allowedRoles={['Student']}>
                    <OutletWrapper />
                  </RoleGuard>
                }
              >
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="profile" element={<StudentProfile />} />
              </Route>

              <Route
                path="jobs"
                element={
                  <RoleGuard allowedRoles={['Student']}>
                    <OutletWrapper />
                  </RoleGuard>
                }
              >
                <Route path="search" element={<SearchJobs />} />
              </Route>

              <Route
                path="job-applications"
                element={
                  <RoleGuard allowedRoles={['Student']}>
                    <OutletWrapper />
                  </RoleGuard>
                }
              >
                <Route path="my" element={<MyApplications />} />
              </Route>

              {/* Employer / Shop Owner Only Routes */}
              <Route
                path="employer"
                element={
                  <RoleGuard allowedRoles={['ShopOwner']}>
                    <OutletWrapper />
                  </RoleGuard>
                }
              >
                <Route path="dashboard" element={<EmployerDashboard />} />
                <Route path="profile" element={<ShopOwnerProfile />} />
                <Route path="documents" element={<Documents />} />
                <Route path="students" element={<SearchStudents />} />
              </Route>

              <Route
                path="job-postings"
                element={
                  <RoleGuard allowedRoles={['ShopOwner']}>
                    <OutletWrapper />
                  </RoleGuard>
                }
              >
                <Route path="my" element={<ManageJobs />} />
              </Route>

              <Route
                path="messages"
                element={
                  <RoleGuard allowedRoles={['Student', 'ShopOwner']}>
                    <Inbox />
                  </RoleGuard>
                }
              />
            </Route>

            {/* Fallback Catch-all Route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

// Simple wrapper to support child nested routes inside RoleGuard layouts
import { Outlet } from 'react-router-dom';
const OutletWrapper: React.FC = () => <Outlet />;

export default App;
