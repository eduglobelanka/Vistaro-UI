import React, { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  Link,
  Container,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import useAuth from '../../hooks/useAuth';
import VistroLogo from '../../components/common/VistroLogo';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Calculate redirect destination
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const onSubmit = async (data: LoginFormValues) => {
    setApiError(null);
    try {
      await login(data);
      // Retrieve roles after successful login to route correctly if going to default '/dashboard'
      const userStr = localStorage.getItem('user');
      if (userStr && from === '/dashboard') {
        const user = JSON.parse(userStr);
        if (user.roles.includes('Admin')) {
          navigate('/admin/dashboard', { replace: true });
        } else if (user.roles.includes('Student')) {
          navigate('/student/dashboard', { replace: true });
        } else if (user.roles.includes('ShopOwner')) {
          navigate('/employer/dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setApiError(errorMsg);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f2c59 0%, #1b4a8f 50%, #0d9488 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            overflow: 'visible',
            position: 'relative',
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0px 20px 40px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: 4,
          }}
        >
          <CardContent sx={{ p: { xs: 4, md: 6 } }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <VistroLogo iconSize={52} tagline={true} />
            </Box>

            <Typography
              variant="h5"
              align="center"
              sx={{
                fontWeight: 700,
                color: '#0f2c59',
                fontFamily: '"Outfit", sans-serif',
                mb: 1,
              }}
            >
              Welcome Back
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 4 }}>
              Enter your credentials to access your Vistro account
            </Typography>

            {apiError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {apiError}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <TextField
                fullWidth
                label="Email Address"
                margin="normal"
                variant="outlined"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                margin="normal"
                variant="outlined"
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isSubmitting}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 700,
                  mb: 3,
                }}
              >
                {isSubmitting ? 'Logging in...' : 'Log In'}
              </Button>
            </form>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/register"
                  sx={{
                    color: '#0d9488',
                    fontWeight: 600,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Create one now
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;
