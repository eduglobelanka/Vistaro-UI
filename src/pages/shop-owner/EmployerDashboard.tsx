import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Button, Alert, AlertTitle, CircularProgress, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ArrowForward, Store, Description, Assignment, Work } from '@mui/icons-material';
import shopOwnerService from '../../services/shop-owner.service';
import jobPostingService from '../../services/job-posting.service';
import jobApplicationService from '../../services/job-application.service';
import type { ShopOwnerProfileResponseDto } from '../../types/shop-owner';
import { BusinessVerificationStatus } from '../../types/shop-owner';
import useAuth from '../../hooks/useAuth';

export const EmployerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ShopOwnerProfileResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [postCount, setPostCount] = useState(0);
  const [appCount, setAppCount] = useState(0);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await shopOwnerService.getProfile();
      if (response.succeeded && response.data) {
        setProfile(response.data);
        setHasProfile(true);

        // Fetch job postings count
        try {
          const jobsRes = await jobPostingService.getMyJobs();
          if (jobsRes.succeeded && jobsRes.data) {
            setPostCount(jobsRes.data.length);
          }
        } catch {}

        // Fetch received applications count
        try {
          const appsRes = await jobApplicationService.getEmployerApplications();
          if (appsRes.succeeded && appsRes.data) {
            setAppCount(appsRes.data.length);
          }
        } catch {}
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setHasProfile(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const getVerificationAlert = () => {
    if (!profile) return null;

    switch (profile.businessVerificationStatus) {
      case BusinessVerificationStatus.Approved:
        return (
          <Alert severity="success" sx={{ mb: 4, borderRadius: 3 }}>
            <AlertTitle sx={{ fontWeight: 700 }}>Account Fully Verified!</AlertTitle>
            Your business credentials have been approved by the administrators. You are authorized to create job postings and search candidates.
          </Alert>
        );
      case BusinessVerificationStatus.Rejected:
        return (
          <Alert
            severity="error"
            action={
              <Button
                component={RouterLink}
                to="/employer/documents"
                color="inherit"
                size="small"
                variant="outlined"
                sx={{ fontWeight: 700 }}
              >
                Upload Documents
              </Button>
            }
            sx={{ mb: 4, borderRadius: 3 }}
          >
            <AlertTitle sx={{ fontWeight: 700 }}>Account Verification Rejected</AlertTitle>
            Your business documents were rejected. Please review administrative remarks on the document upload screen and upload valid proof of licensing.
          </Alert>
        );
      case BusinessVerificationStatus.Pending:
      default:
        return (
          <Alert
            severity="info"
            action={
              <Button
                component={RouterLink}
                to="/employer/documents"
                color="inherit"
                size="small"
                variant="outlined"
                sx={{ fontWeight: 700 }}
              >
                View Documents
              </Button>
            }
            sx={{ mb: 4, borderRadius: 3 }}
          >
            <AlertTitle sx={{ fontWeight: 700 }}>Account Verification Pending</AlertTitle>
            Your verification documents are currently under review by administrators. You can create drafts but cannot publish active job postings until approved.
          </Alert>
        );
    }
  };

  const getVerificationStatusText = () => {
    if (!profile) return 'No Profile';
    switch (profile.businessVerificationStatus) {
      case BusinessVerificationStatus.Approved:
        return 'Verified';
      case BusinessVerificationStatus.Rejected:
        return 'Rejected';
      case BusinessVerificationStatus.Pending:
      default:
        return 'Pending';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#0f2c59', mb: 1 }}
        >
          Employer Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user?.fullName || 'Employer'}. Manage your listings, approve documents, and hire talent.
        </Typography>
      </Box>

      {/* Profile missing Call to Action */}
      {!hasProfile && (
        <Alert
          severity="warning"
          icon={<Store fontSize="large" />}
          action={
            <Button
              component={RouterLink}
              to="/employer/profile"
              color="inherit"
              size="small"
              variant="outlined"
              sx={{ fontWeight: 700 }}
            >
              Complete Profile
            </Button>
          }
          sx={{ mb: 4, borderRadius: 3, p: 3, '& .MuiAlert-message': { width: '100%' } }}
        >
          <AlertTitle sx={{ fontWeight: 700, fontSize: '1.1rem' }}>Business Profile Incomplete!</AlertTitle>
          Please complete your business details before you can upload licensing documents or manage job postings.
        </Alert>
      )}

      {/* Verification status alerts */}
      {hasProfile && getVerificationAlert()}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 160, position: 'relative', overflow: 'hidden' }}>
            <Typography variant="h6" color="secondary" sx={{ fontWeight: 700 }} gutterBottom>
              My Job Postings
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, my: 1 }}>
              {postCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active postings
            </Typography>
            <Work sx={{ position: 'absolute', right: -10, bottom: -10, fontSize: 100, color: 'rgba(13, 148, 136, 0.05)' }} />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 160, position: 'relative', overflow: 'hidden' }}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }} gutterBottom>
              Received Applications
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, my: 1 }}>
              {appCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Candidates applying
            </Typography>
            <Assignment sx={{ position: 'absolute', right: -10, bottom: -10, fontSize: 100, color: 'rgba(27, 74, 143, 0.05)' }} />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 160, position: 'relative', overflow: 'hidden' }}>
            <Typography variant="h6" sx={{ color: 'warning.main', fontWeight: 700 }} gutterBottom>
              Verification Status
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, my: 1.5 }}>
              {getVerificationStatusText()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {profile?.businessVerificationStatus === BusinessVerificationStatus.Approved ? 'Approved to list jobs' : 'Requires verification'}
            </Typography>
            <Description sx={{ position: 'absolute', right: -10, bottom: -10, fontSize: 100, color: 'rgba(217, 119, 6, 0.05)' }} />
          </Paper>
        </Grid>

        {/* Dashboard quick links */}
        {hasProfile && profile?.businessVerificationStatus === BusinessVerificationStatus.Approved && (
          <Grid size={12}>
            <Paper sx={{ p: 3, mt: 1 }}>
              <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, mb: 2, color: '#0f2c59' }}>
                Quick Actions
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Your account is active. You can now post new job vacancies or browse available candidate directories.
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  component={RouterLink}
                  to="/job-postings/my"
                  variant="contained"
                  color="secondary"
                  endIcon={<ArrowForward />}
                  sx={{ fontWeight: 700 }}
                >
                  Manage Job Posts
                </Button>
                <Button
                  component={RouterLink}
                  to="/employer/students"
                  variant="outlined"
                  color="secondary"
                  sx={{ fontWeight: 700 }}
                >
                  Search Candidates
                </Button>
              </Stack>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default EmployerDashboard;
