import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { Box, CircularProgress } from '@mui/material';

export const DashboardRedirect: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || !user) {
        navigate('/login', { replace: true });
      } else {
        if (user.roles.includes('Admin')) {
          navigate('/admin/dashboard', { replace: true });
        } else if (user.roles.includes('Student')) {
          navigate('/student/dashboard', { replace: true });
        } else if (user.roles.includes('ShopOwner')) {
          navigate('/employer/dashboard', { replace: true });
        } else {
          navigate('/forbidden', { replace: true });
        }
      }
    }
  }, [user, isAuthenticated, loading, navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
      }}
    >
      <CircularProgress color="primary" size={50} />
    </Box>
  );
};

export default DashboardRedirect;
