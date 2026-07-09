import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Chip,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Stack,
  Divider,
} from '@mui/material';
import {
  AssignmentTurnedIn,
  Store,
  LocationOn,
  CalendarToday,
  RemoveCircleOutlined,
  Visibility,
  MailOutlined,
} from '@mui/icons-material';
import jobApplicationService from '../../services/job-application.service';
import type { JobApplicationResponseDto } from '../../types/jobs';
import { JobApplicationStatus } from '../../types/jobs';

export const MyApplications: React.FC = () => {
  const [applications, setApplications] = useState<JobApplicationResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Dialogs
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState<string>('');

  const [coverMessageOpen, setCoverMessageOpen] = useState(false);
  const [selectedCoverMessage, setSelectedCoverMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await jobApplicationService.getMyApplications();
      if (response.succeeded && response.data) {
        setApplications(response.data);
      }
    } catch {
      setErrorMessage('Failed to fetch your applications.');
    } finally {
      setLoading(false);
    }
  };

  const openWithdrawDialog = (id: string, title: string) => {
    setSelectedAppId(id);
    setSelectedJobTitle(title);
    setWithdrawDialogOpen(true);
  };

  const closeWithdrawDialog = () => {
    setSelectedAppId(null);
    setSelectedJobTitle('');
    setWithdrawDialogOpen(false);
  };

  const handleWithdraw = async () => {
    if (!selectedAppId) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const response = await jobApplicationService.withdrawApplication(selectedAppId);
      if (response.succeeded) {
        setSuccessMessage(`You have successfully withdrawn your application for ${selectedJobTitle}.`);
        setApplications((prev) =>
          prev.map((app) =>
            app.id === selectedAppId ? { ...app, status: JobApplicationStatus.Withdrawn } : app
          )
        );
      } else {
        setErrorMessage(response.message || 'Failed to withdraw application.');
      }
    } catch {
      setErrorMessage('Error occurred while withdrawing application.');
    } finally {
      closeWithdrawDialog();
    }
  };

  const openCoverLetter = (message: string | null) => {
    setSelectedCoverMessage(message);
    setCoverMessageOpen(true);
  };

  const getStatusChip = (status: JobApplicationStatus) => {
    switch (status) {
      case JobApplicationStatus.Accepted:
        return <Chip label="Accepted" color="success" size="small" sx={{ fontWeight: 600 }} />;
      case JobApplicationStatus.Rejected:
        return <Chip label="Rejected" color="error" size="small" sx={{ fontWeight: 600 }} />;
      case JobApplicationStatus.Shortlisted:
        return <Chip label="Shortlisted" color="primary" size="small" sx={{ fontWeight: 600 }} />;
      case JobApplicationStatus.Withdrawn:
        return <Chip label="Withdrawn" color="default" size="small" sx={{ fontWeight: 600 }} />;
      case JobApplicationStatus.Pending:
      default:
        return <Chip label="Pending Review" color="warning" size="small" sx={{ fontWeight: 600 }} />;
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
    <Box sx={{ maxWidth: 850, mx: 'auto', width: '100%' }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#0f2c59', mb: 1 }}
        >
          My Applications
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track the status of your job submissions and manage withdrawals.
        </Typography>
      </Box>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {applications.length === 0 ? (
        <Paper sx={{ py: 8, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <AssignmentTurnedIn sx={{ fontSize: 56, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Applications Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            You haven't submitted any job applications yet. Complete your profile and browse active listings to apply!
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {applications.map((app) => (
            <Grid size={12} key={app.id}>
              <Card sx={{ borderLeft: '5px solid', borderColor: app.status === JobApplicationStatus.Accepted ? 'success.main' : app.status === JobApplicationStatus.Rejected ? 'error.main' : 'primary.light' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, color: '#0f2c59', mb: 0.5 }}>
                        {app.jobTitle}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5, color: 'secondary.main' }}>
                        <Store sx={{ fontSize: 16 }} /> {app.shopName}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {getStatusChip(app.status)}
                    </Box>
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>City</Typography>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 500 }}>
                        <LocationOn sx={{ fontSize: 14 }} /> {app.jobCity}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Applied On</Typography>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 500 }}>
                        <CalendarToday sx={{ fontSize: 14 }} /> {new Date(app.appliedAt).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Category</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {app.jobCategory}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={() => openCoverLetter(app.coverMessage)}
                    >
                      View Cover Letter
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      variant="contained"
                      startIcon={<RemoveCircleOutlined />}
                      onClick={() => openWithdrawDialog(app.id, app.jobTitle)}
                      disabled={app.status === JobApplicationStatus.Withdrawn || app.status === JobApplicationStatus.Accepted || app.status === JobApplicationStatus.Rejected}
                    >
                      Withdraw
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* WITHDRAW CONFIRMATION DIALOG */}
      <Dialog open={withdrawDialogOpen} onClose={closeWithdrawDialog}>
        <DialogTitle sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
          Withdraw Application
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to withdraw your application for <strong>{selectedJobTitle}</strong>? 
            This action is final and the employer will be notified of your withdrawal.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeWithdrawDialog} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleWithdraw} color="error" variant="contained" sx={{ fontWeight: 700 }}>
            Withdraw
          </Button>
        </DialogActions>
      </Dialog>

      {/* VIEW COVER LETTER DIALOG */}
      <Dialog open={coverMessageOpen} onClose={() => setCoverMessageOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <MailOutlined color="primary" /> My Submitted Cover Letter
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', py: 1, color: 'text.secondary' }}>
            {selectedCoverMessage || 'You did not attach a cover message to this application.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCoverMessageOpen(false)} color="primary" sx={{ fontWeight: 700 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyApplications;
