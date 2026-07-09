import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
  Grid,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
  School,
  Store,
} from '@mui/icons-material';
import useAuth from '../../hooks/useAuth';
import VistroLogo from '../../components/common/VistroLogo';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(150, 'Name must be less than 150 characters'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  phoneNumber: z.string().min(8, 'Phone number must be at least 8 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['Student', 'ShopOwner']),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      role: 'Student', // Default role
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormValues) => {
    setApiError(null);
    try {
      await registerUser(data);
      // Retrieve roles after successful registration to route correctly
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.roles.includes('Student')) {
          navigate('/student/dashboard', { replace: true });
        } else if (user.roles.includes('ShopOwner')) {
          navigate('/employer/dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Registration failed. Please try again.';
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
        py: 6,
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
          <CardContent sx={{ p: { xs: 4, md: 5 } }}>
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
              Create Your Account
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 4 }}>
              Sign up today and find opportunities or post new jobs
            </Typography>

            {apiError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {apiError}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Custom Role Selector Cards */}
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
                I want to join Vistro as a:
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 6 }}>
                  <Card
                    onClick={() => setValue('role', 'Student')}
                    sx={{
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: selectedRole === 'Student' ? 'primary.main' : 'rgba(148, 163, 184, 0.2)',
                      backgroundColor: selectedRole === 'Student' ? 'rgba(27, 74, 143, 0.04)' : '#ffffff',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0px 4px 12px rgba(15, 23, 42, 0.05)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2, textAlign: 'center', '&:last-child': { pb: 2 } }}>
                      <School color={selectedRole === 'Student' ? 'primary' : 'action'} sx={{ fontSize: 32, mb: 1 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: selectedRole === 'Student' ? 'primary.dark' : 'text.secondary' }}>
                        Student / Seeker
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Card
                    onClick={() => setValue('role', 'ShopOwner')}
                    sx={{
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: selectedRole === 'ShopOwner' ? 'secondary.main' : 'rgba(148, 163, 184, 0.2)',
                      backgroundColor: selectedRole === 'ShopOwner' ? 'rgba(13, 148, 136, 0.04)' : '#ffffff',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0px 4px 12px rgba(15, 23, 42, 0.05)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2, textAlign: 'center', '&:last-child': { pb: 2 } }}>
                      <Store color={selectedRole === 'ShopOwner' ? 'secondary' : 'action'} sx={{ fontSize: 32, mb: 1 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: selectedRole === 'ShopOwner' ? 'secondary.dark' : 'text.secondary' }}>
                        Shop Owner / Employer
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <TextField
                fullWidth
                label="Full Name"
                variant="outlined"
                {...register('fullName')}
                error={!!errors.fullName}
                helperText={errors.fullName?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Email Address"
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
                label="Phone Number"
                placeholder="e.g. +44 7123 456789"
                variant="outlined"
                {...register('phoneNumber')}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone color="action" />
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
                sx={{ mb: 4 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                color={selectedRole === 'ShopOwner' ? 'secondary' : 'primary'}
                disabled={isSubmitting}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 700,
                  mb: 3,
                }}
              >
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{
                    color: selectedRole === 'ShopOwner' ? '#0d9488' : '#1b4a8f',
                    fontWeight: 600,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Log in instead
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Register;
