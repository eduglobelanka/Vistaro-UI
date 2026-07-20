import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  FormControlLabel,
  Checkbox,
  Chip,
  Divider,
  Paper,
  Stack,
  Avatar,
} from '@mui/material';
import {
  Store,
  Business,
  Verified,
  Warning,
  ErrorOutlined,
  Edit,
  Cancel,
} from '@mui/icons-material';
import shopOwnerService from '../../services/shop-owner.service';
import type {
  ShopOwnerProfileResponseDto,
  SaveShopOwnerProfileDto,
} from '../../types/shop-owner';
import {
  BusinessVerificationStatus,
} from '../../types/shop-owner';
import useAuth from '../../hooks/useAuth';
import { parseApiError } from '../../services/api-client';

// Zod Schema matching C# validators
const shopOwnerProfileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(150, 'Name must be less than 150 characters'),
  email: z.string().email('Enter a valid email address'),
  phoneNumber: z.string().min(8, 'Phone number must be at least 8 digits'),
  shopName: z.string().min(2, 'Shop/Business name must be at least 2 characters'),
  businessType: z.string().min(2, 'Business type is required'),
  shopAddress: z.string().min(5, 'Enter a valid shop address'),
  city: z.string().min(2, 'City is required'),
  postcode: z.string().min(4, 'Enter a valid UK postcode'),
  premisesLicenceNumber: z.string().optional().nullable(),
  consentToFollowUkEmploymentLaw: z.boolean().refine(val => val === true, 'You must consent to proceed'),
});

type ShopOwnerProfileFormValues = z.infer<typeof shopOwnerProfileSchema>;

export const ShopOwnerProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ShopOwnerProfileResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShopOwnerProfileFormValues>({
    resolver: zodResolver(shopOwnerProfileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      shopName: '',
      businessType: '',
      shopAddress: '',
      city: '',
      postcode: '',
      premisesLicenceNumber: '',
      consentToFollowUkEmploymentLaw: true,
    },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await shopOwnerService.getProfile();
      if (response.succeeded && response.data) {
        setProfile(response.data);
        reset({
          fullName: response.data.fullName,
          email: response.data.email,
          phoneNumber: response.data.phoneNumber,
          shopName: response.data.shopName,
          businessType: response.data.businessType,
          shopAddress: response.data.shopAddress,
          city: response.data.city,
          postcode: response.data.postcode,
          premisesLicenceNumber: response.data.premisesLicenceNumber || '',
          consentToFollowUkEmploymentLaw: response.data.consentToFollowUkEmploymentLaw,
        });
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setProfile(null);
      } else {
        setErrorMessage('Failed to fetch profile details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ShopOwnerProfileFormValues) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const payload: SaveShopOwnerProfileDto = {
      ...data,
      premisesLicenceNumber: data.premisesLicenceNumber || null,
    };

    try {
      let response;
      if (profile) {
        response = await shopOwnerService.updateProfile(payload);
      } else {
        response = await shopOwnerService.createProfile(payload);
      }

      if (response.succeeded && response.data) {
        setProfile(response.data);
        setIsEditMode(false);
        setSuccessMessage(profile ? 'Business profile updated successfully!' : 'Business profile created successfully!');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMessage(parseApiError({ response: { data: response } }));
      }
    } catch (err: any) {
      setErrorMessage(parseApiError(err));
    }
  };

  const getVerificationChip = (status: BusinessVerificationStatus) => {
    switch (status) {
      case BusinessVerificationStatus.Approved:
        return (
          <Chip
            icon={<Verified />}
            label="Verified Employer"
            color="success"
            sx={{ fontWeight: 600 }}
          />
        );
      case BusinessVerificationStatus.Rejected:
        return (
          <Chip
            icon={<ErrorOutlined />}
            label="Verification Rejected"
            color="error"
            sx={{ fontWeight: 600 }}
          />
        );
      case BusinessVerificationStatus.Pending:
      default:
        return (
          <Chip
            icon={<Warning />}
            label="Verification Pending"
            color="warning"
            sx={{ fontWeight: 600 }}
          />
        );
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  // Display View Business Profile
  if (profile && !isEditMode) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', width: '100%' }}>
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        <Paper sx={{ p: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Avatar
                sx={{
                  bgcolor: 'secondary.main',
                  width: 64,
                  height: 64,
                }}
              >
                <Store fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#0f2c59' }}>
                  {profile.shopName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Employer Account
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Edit />}
              onClick={() => setIsEditMode(true)}
              sx={{ fontWeight: 700 }}
            >
              Edit Details
            </Button>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {/* Column 1: Contact Details */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack spacing={2.5}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  Contact Representative
                </Typography>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    Representative Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {profile.fullName}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    Direct Email
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {profile.email}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    Phone Number
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {profile.phoneNumber}
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            {/* Column 2: Business Info */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack spacing={2.5}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  Business Information
                </Typography>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    Industry / Business Type
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Business fontSize="small" color="action" /> {profile.businessType}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    Licence Number
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {profile.premisesLicenceNumber || 'Not provided / Exempt'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    Shop Address
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {profile.shopAddress}, {profile.city}, {profile.postcode}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Stack direction="row" spacing={3} sx={{ alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                Verification Status
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload your business registration documents to activate your account.
              </Typography>
            </Box>
            {getVerificationChip(profile.businessVerificationStatus)}
          </Stack>
        </Paper>
      </Box>
    );
  }

  // Display Wizard Form (Create/Edit Mode)
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', width: '100%' }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#0f2c59', mb: 1 }}
        >
          {profile ? 'Edit Business Details' : 'Create Employer Profile'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {profile
            ? 'Update your business information, shop location, and contact details.'
            : 'Fill in your business parameters to unlock the portal and start listing jobs.'}
        </Typography>
      </Box>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
          {errorMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Paper sx={{ p: { xs: 3, md: 4 }, mb: 4 }}>
          <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, mb: 3, color: '#0f2c59' }}>
            1. Authorized Representative Contact
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Full Name"
                {...register('fullName')}
                error={!!errors.fullName}
                helperText={errors.fullName?.message}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Direct Email"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Direct Phone Number"
                {...register('phoneNumber')}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber?.message}
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, mb: 3, color: '#0f2c59' }}>
            2. Business Parameters
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Shop / Business Name"
                {...register('shopName')}
                error={!!errors.shopName}
                helperText={errors.shopName?.message}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Business Type (e.g. Cafe, Retail, Pub)"
                {...register('businessType')}
                error={!!errors.businessType}
                helperText={errors.businessType?.message}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Shop Address"
                {...register('shopAddress')}
                error={!!errors.shopAddress}
                helperText={errors.shopAddress?.message}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="City"
                {...register('city')}
                error={!!errors.city}
                helperText={errors.city?.message}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Postcode"
                {...register('postcode')}
                error={!!errors.postcode}
                helperText={errors.postcode?.message}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Premises Licence Number (Optional)"
                placeholder="Required for alcohol / late night venues"
                {...register('premisesLicenceNumber')}
                error={!!errors.premisesLicenceNumber}
                helperText={errors.premisesLicenceNumber?.message}
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid size={12} sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={watch('consentToFollowUkEmploymentLaw')}
                    onChange={(e) => setValue('consentToFollowUkEmploymentLaw', e.target.checked)}
                  />
                }
                label="I consent to follow all UK employment laws, minimum wage acts, and health and safety requirements"
              />
              {errors.consentToFollowUkEmploymentLaw && (
                <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5, ml: 4 }}>
                  {errors.consentToFollowUkEmploymentLaw.message}
                </Typography>
              )}
            </Grid>
          </Grid>
        </Paper>

        <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', mb: 4 }}>
          {profile && (
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<Cancel />}
              onClick={() => setIsEditMode(false)}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            disabled={isSubmitting}
            sx={{ fontWeight: 700, px: 4 }}
          >
            {isSubmitting ? 'Saving...' : profile ? 'Save Changes' : 'Create Profile'}
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default ShopOwnerProfile;
