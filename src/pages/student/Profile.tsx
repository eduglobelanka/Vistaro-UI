import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link as RouterLink } from 'react-router-dom';
import * as z from 'zod';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Switch,
  Chip,
  Divider,
  Paper,
  Stack,
  Avatar,
  Card,
} from '@mui/material';
import {
  School,
  Work,
  CheckCircle,
  Edit,
  Cancel,
  Info,
} from '@mui/icons-material';
import studentService from '../../services/student.service';
import type {
  StudentProfileResponseDto,
  SaveStudentProfileDto,
} from '../../types/student';
import {
  VisaType,
  EmploymentPreference,
} from '../../types/student';
import useAuth from '../../hooks/useAuth';

// Zod Schema for validation
const studentProfileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(150, 'Name must be less than 150 characters'),
  email: z.string().email('Enter a valid email address'),
  phoneNumber: z.string().min(8, 'Phone number must be at least 8 digits'),
  universityName: z.string().min(2, 'University name must be at least 2 characters'),
  city: z.string().min(2, 'City is required'),
  postcode: z.string().min(4, 'Enter a valid UK postcode'),
  visaType: z.coerce.number().min(1).max(5),
  employmentPreference: z.coerce.number().min(1).max(2),
  rightToWorkShareCode: z.string().optional().nullable(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  maxHoursPerWeek: z.preprocess((val) => Number(val), z.number().min(0).max(168, 'Hours cannot exceed 168')),
  consentToShareProfile: z.boolean().refine(val => val === true, 'You must consent to proceed'),
  isAvailableForWork: z.boolean(),
  preferredJobCategories: z.string().optional().nullable(),
  preferredSearchRadius: z.preprocess((val) => (val === '' ? null : val === undefined ? undefined : Number(val)), z.number().min(0).optional().nullable()),
  expectedHourlyRate: z.preprocess((val) => (val === '' ? null : val === undefined ? undefined : Number(val)), z.number().min(0).optional().nullable()),
});

// Explicit interface matching SaveStudentProfileDto to satisfy typescript compiler
interface StudentProfileFormValues {
  fullName: string;
  email: string;
  phoneNumber: string;
  universityName: string;
  city: string;
  postcode: string;
  visaType: VisaType;
  employmentPreference: EmploymentPreference;
  rightToWorkShareCode?: string | null;
  dateOfBirth: string;
  maxHoursPerWeek: number;
  consentToShareProfile: boolean;
  isAvailableForWork: boolean;
  preferredJobCategories?: string | null;
  preferredSearchRadius?: number | null;
  expectedHourlyRate?: number | null;
}

export const StudentProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfileResponseDto | null>(null);
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
  } = useForm<StudentProfileFormValues>({
    resolver: zodResolver(studentProfileSchema) as any,
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      universityName: '',
      city: '',
      postcode: '',
      visaType: VisaType.StudentVisa,
      employmentPreference: EmploymentPreference.PartTime,
      rightToWorkShareCode: '',
      dateOfBirth: '',
      maxHoursPerWeek: 20,
      consentToShareProfile: true,
      isAvailableForWork: true,
      preferredJobCategories: '',
      preferredSearchRadius: 10,
      expectedHourlyRate: 12,
    },
  });

  const selectedVisaType = watch('visaType');
  const maxHours = watch('maxHoursPerWeek');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await studentService.getProfile();
      if (response.succeeded && response.data) {
        setProfile(response.data);
        reset({
          fullName: response.data.fullName,
          email: response.data.email,
          phoneNumber: response.data.phoneNumber,
          universityName: response.data.universityName,
          city: response.data.city,
          postcode: response.data.postcode,
          visaType: response.data.visaType,
          employmentPreference: response.data.employmentPreference,
          rightToWorkShareCode: '',
          dateOfBirth: response.data.dateOfBirth,
          maxHoursPerWeek: response.data.maxHoursPerWeek,
          consentToShareProfile: response.data.consentToShareProfile,
          isAvailableForWork: response.data.isAvailableForWork,
          preferredJobCategories: response.data.preferredJobCategories || '',
          preferredSearchRadius: response.data.preferredSearchRadius || 10,
          expectedHourlyRate: response.data.expectedHourlyRate || 12,
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

  const onSubmit = async (data: StudentProfileFormValues) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const payload: SaveStudentProfileDto = {
      ...data,
      rightToWorkShareCode: data.rightToWorkShareCode || null,
      preferredJobCategories: data.preferredJobCategories || null,
      preferredSearchRadius: data.preferredSearchRadius || null,
      expectedHourlyRate: data.expectedHourlyRate || null,
    };

    try {
      let response;
      if (profile) {
        response = await studentService.updateProfile(payload);
      } else {
        response = await studentService.createProfile(payload);
      }

      if (response.succeeded && response.data) {
        setProfile(response.data);
        setIsEditMode(false);
        setSuccessMessage(profile ? 'Profile updated successfully!' : 'Profile created successfully!');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMessage(response.message || 'Operation failed.');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Failed to save profile details. Please try again.';
      setErrorMessage(errorMsg);
    }
  };

  const getVisaLabel = (type: VisaType) => {
    switch (type) {
      case VisaType.StudentVisa:
        return 'Student Visa (Max 20 Hours Term-Time)';
      case VisaType.GraduateVisa:
        return 'Graduate Visa (Post-Study Work)';
      case VisaType.OtherVisa:
        return 'Other Working Visa';
      case VisaType.NeedsRightToWorkVerification:
        return 'Needs Right to Work Verification';
      case VisaType.PreferNotToSayUntilVerified:
        return 'Prefer Not to Say';
      default:
        return 'Unknown';
    }
  };

  const getEmpLabel = (pref: EmploymentPreference) => {
    return pref === EmploymentPreference.PartTime ? 'Part-Time' : 'Full-Time';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  // Display View Profile Screen
  if (profile && !isEditMode) {
    const userInitials = profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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
                  bgcolor: 'primary.main',
                  width: 64,
                  height: 64,
                  fontSize: '1.5rem',
                  fontWeight: 700,
                }}
              >
                {userInitials}
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#0f2c59' }}>
                  {profile.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Job Seeker Profile
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
              Edit Profile
            </Button>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {/* Column 1: Contact info */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    Email Address
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
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    Date of Birth
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {profile.dateOfBirth}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    Location
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {profile.city}, {profile.postcode}
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            {/* Column 2: Academic & Preferences */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    University / College
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <School fontSize="small" color="action" /> {profile.universityName}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    Visa Type
                  </Typography>
                  <Chip
                    label={getVisaLabel(profile.visaType)}
                    color="primary"
                    variant="outlined"
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    Employment Preference
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Work fontSize="small" color="action" /> {getEmpLabel(profile.employmentPreference)} ({profile.maxHoursPerWeek} hrs/week max)
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    Work Availability Status
                  </Typography>
                  <Chip
                    label={profile.isAvailableForWork ? 'Available for Work' : 'Not Available'}
                    color={profile.isAvailableForWork ? 'success' : 'default'}
                    icon={profile.isAvailableForWork ? <CheckCircle /> : undefined}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Job details */}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#0f2c59' }}>
            Job Search Preferences
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: '#f8fafc' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                  Expected Hourly Rate
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main', mt: 0.5 }}>
                  {profile.expectedHourlyRate ? `£${Number(profile.expectedHourlyRate).toFixed(2)}/hr` : 'Not Specified'}
                </Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: '#f8fafc' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                  Preferred Radius
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>
                  {profile.preferredSearchRadius ? `${profile.preferredSearchRadius} miles` : 'Flexible'}
                </Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: '#f8fafc' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                  Job Categories
                </Typography>
                <Typography variant="h6" noWrap sx={{ fontWeight: 700, mt: 0.5, fontSize: '1rem' }}>
                  {profile.preferredJobCategories || 'All Categories'}
                </Typography>
              </Card>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Quick Actions Panel */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary', mb: 1.5 }}>
              Candidate Hub Quick Links
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                component={RouterLink}
                to="/student/dashboard"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ py: 1.2, fontWeight: 700 }}
              >
                Search & Apply for Jobs
              </Button>
              <Button
                component={RouterLink}
                to="/job-applications/my"
                variant="outlined"
                color="primary"
                fullWidth
                sx={{ py: 1.2, fontWeight: 700 }}
              >
                Track My Applications
              </Button>
              <Button
                component={RouterLink}
                to="/messages"
                variant="outlined"
                color="secondary"
                fullWidth
                sx={{ py: 1.2, fontWeight: 700 }}
              >
                Open Chat Inbox
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
    );
  }

  // Display Form (Create/Edit Wizard Mode)
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', width: '100%' }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#0f2c59', mb: 1 }}
        >
          {profile ? 'Edit Student Profile' : 'Create Student Profile'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {profile
            ? 'Update your personal details, academic status, and job seeker preferences.'
            : 'Fill in your details below to activate your candidate profile and start searching for jobs.'}
        </Typography>
      </Box>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      {selectedVisaType === VisaType.StudentVisa && maxHours > 20 && (
        <Alert severity="warning" icon={<Info />} sx={{ mb: 3 }}>
          <strong>Compliance Notice:</strong> Standard Student Visas in the UK typically restrict working hours to a maximum of <strong>20 hours per week</strong> during term-time.
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Paper sx={{ p: { xs: 3, md: 4 }, mb: 4 }}>
          <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, mb: 3, color: '#0f2c59' }}>
            1. Personal & Contact Information
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
                label="Email Address"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Phone Number"
                {...register('phoneNumber')}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber?.message}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Date of Birth"
                placeholder="YYYY-MM-DD"
                {...register('dateOfBirth')}
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth?.message || 'Format: YYYY-MM-DD'}
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
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, mb: 3, color: '#0f2c59' }}>
            2. Academic Status & Work Authorization
          </Typography>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                fullWidth
                label="University or College Name"
                {...register('universityName')}
                error={!!errors.universityName}
                helperText={errors.universityName?.message}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Visa Status"
                value={selectedVisaType}
                onChange={(e) => setValue('visaType', Number(e.target.value) as VisaType)}
                error={!!errors.visaType}
                helperText={errors.visaType?.message}
                sx={{ mb: 2 }}
              >
                <MenuItem value={VisaType.StudentVisa}>Student Visa</MenuItem>
                <MenuItem value={VisaType.GraduateVisa}>Graduate Visa (Post-Study)</MenuItem>
                <MenuItem value={VisaType.OtherVisa}>Other Working Visa</MenuItem>
                <MenuItem value={VisaType.NeedsRightToWorkVerification}>Needs Verification</MenuItem>
                <MenuItem value={VisaType.PreferNotToSayUntilVerified}>Prefer Not to Say</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Right to Work Share Code (Optional)"
                placeholder="e.g. 9-digit code"
                {...register('rightToWorkShareCode')}
                error={!!errors.rightToWorkShareCode}
                helperText={errors.rightToWorkShareCode?.message}
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, mb: 3, color: '#0f2c59' }}>
            3. Job Preferences & Availability
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Employment Type"
                value={watch('employmentPreference')}
                onChange={(e) => setValue('employmentPreference', Number(e.target.value) as EmploymentPreference)}
                error={!!errors.employmentPreference}
                helperText={errors.employmentPreference?.message}
                sx={{ mb: 2 }}
              >
                <MenuItem value={EmploymentPreference.PartTime}>Part-Time Only</MenuItem>
                <MenuItem value={EmploymentPreference.FullTime}>Full-Time / Flexible</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Max Working Hours per Week"
                {...register('maxHoursPerWeek')}
                error={!!errors.maxHoursPerWeek}
                helperText={errors.maxHoursPerWeek?.message}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="Expected Hourly Rate (£)"
                {...register('expectedHourlyRate')}
                error={!!errors.expectedHourlyRate}
                helperText={errors.expectedHourlyRate?.message}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="Search Radius (Miles)"
                {...register('preferredSearchRadius')}
                error={!!errors.preferredSearchRadius}
                helperText={errors.preferredSearchRadius?.message}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Job Categories (e.g. Retail, Bar)"
                {...register('preferredJobCategories')}
                error={!!errors.preferredJobCategories}
                helperText={errors.preferredJobCategories?.message}
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid size={12} sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={watch('isAvailableForWork')}
                    onChange={(e) => setValue('isAvailableForWork', e.target.checked)}
                  />
                }
                label="I am immediately available for work"
              />
            </Grid>

            <Grid size={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={watch('consentToShareProfile')}
                    onChange={(e) => setValue('consentToShareProfile', e.target.checked)}
                  />
                }
                label="I consent to share my profile details with verified employers in the UK"
              />
              {errors.consentToShareProfile && (
                <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5, ml: 4 }}>
                  {errors.consentToShareProfile.message}
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
            color="primary"
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

export default StudentProfile;
