import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  Visibility,
  Publish,
  Block,
  MailOutlined,
  WorkOutlined,
  PeopleOutlined,
  Send,
} from '@mui/icons-material';
import jobPostingService from '../../services/job-posting.service';
import jobApplicationService from '../../services/job-application.service';
import shopOwnerService from '../../services/shop-owner.service';
import messagingService from '../../services/messaging.service';
import type {
  JobPostingResponseDto,
  SaveJobPostingDto,
  JobApplicationResponseDto,
} from '../../types/jobs';
import {
  EmploymentType,
  ContractType,
  SalaryType,
  JobPostingStatus,
  JobApplicationStatus,
} from '../../types/jobs';
import { BusinessVerificationStatus } from '../../types/shop-owner';

// Zod validation matching backend requirements
const jobPostingSchema = z.object({
  jobTitle: z.string().min(3, 'Job title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  jobCategory: z.string().min(2, 'Job category is required'),
  employmentType: z.preprocess((val) => Number(val), z.nativeEnum(EmploymentType as any)) as unknown as z.ZodType<EmploymentType>,
  contractType: z.preprocess((val) => Number(val), z.nativeEnum(ContractType as any)) as unknown as z.ZodType<ContractType>,
  salaryType: z.preprocess((val) => Number(val), z.nativeEnum(SalaryType as any)) as unknown as z.ZodType<SalaryType>,
  salaryAmount: z.preprocess((val) => Number(val), z.number().min(0.01, 'Salary must be positive')),
  hoursPerWeek: z.preprocess((val) => Number(val), z.number().min(1, 'Hours must be at least 1').max(168, 'Hours cannot exceed 168')),
  location: z.string().min(3, 'Specific location / store address is required'),
  city: z.string().min(2, 'City is required'),
  postcode: z.string().min(4, 'Enter a valid UK postcode'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  status: z.preprocess((val) => Number(val), z.nativeEnum(JobPostingStatus as any)) as unknown as z.ZodType<JobPostingStatus>,
});

interface JobPostingFormValues {
  jobTitle: string;
  description: string;
  jobCategory: string;
  employmentType: EmploymentType;
  contractType: ContractType;
  salaryType: SalaryType;
  salaryAmount: number;
  hoursPerWeek: number;
  location: string;
  city: string;
  postcode: string;
  startDate: string;
  expiryDate: string;
  status: JobPostingStatus;
}

export const ManageJobs: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [postings, setPostings] = useState<JobPostingResponseDto[]>([]);
  const [applications, setApplications] = useState<JobApplicationResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessVerified, setBusinessVerified] = useState(false);
  const [isVerifiedCheckLoading, setIsVerifiedCheckLoading] = useState(true);
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<JobPostingResponseDto | null>(null);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const [coverLetterOpen, setCoverLetterOpen] = useState(false);
  const [selectedCoverMessage, setSelectedCoverMessage] = useState<string | null>(null);
  const [selectedCandidateName, setSelectedCandidateName] = useState<string>('');

  // Invitation states
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<JobApplicationResponseDto | null>(null);
  const [inviteMessage, setInviteMessage] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<JobPostingFormValues>({
    resolver: zodResolver(jobPostingSchema) as any,
    defaultValues: {
      jobTitle: '',
      description: '',
      jobCategory: '',
      employmentType: EmploymentType.PartTime,
      contractType: ContractType.Immediate,
      salaryType: SalaryType.Hourly,
      salaryAmount: 11.5,
      hoursPerWeek: 16,
      location: '',
      city: '',
      postcode: '',
      startDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: JobPostingStatus.Published,
    },
  });

  useEffect(() => {
    checkVerification();
    fetchData();
  }, []);

  const checkVerification = async () => {
    try {
      const response = await shopOwnerService.getProfile();
      if (response.succeeded && response.data) {
        setBusinessVerified(response.data.businessVerificationStatus === BusinessVerificationStatus.Approved);
      }
    } catch {
      setBusinessVerified(false);
    } finally {
      setIsVerifiedCheckLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const postsRes = await jobPostingService.getMyJobs();
      if (postsRes.succeeded && postsRes.data) {
        setPostings(postsRes.data);
      }

      const appsRes = await jobApplicationService.getEmployerApplications();
      if (appsRes.succeeded && appsRes.data) {
        setApplications(appsRes.data);
      }
    } catch (err: any) {
      setErrorMessage('Failed to load listings data. Ensure your profile is created.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const openCreateDialog = () => {
    setEditingPost(null);
    reset({
      jobTitle: '',
      description: '',
      jobCategory: '',
      employmentType: EmploymentType.PartTime,
      contractType: ContractType.Immediate,
      salaryType: SalaryType.Hourly,
      salaryAmount: 11.5,
      hoursPerWeek: 16,
      location: '',
      city: '',
      postcode: '',
      startDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: JobPostingStatus.Published,
    });
    setFormDialogOpen(true);
  };

  const openEditDialog = (post: JobPostingResponseDto) => {
    setEditingPost(post);
    reset({
      jobTitle: post.jobTitle,
      description: post.description,
      jobCategory: post.jobCategory,
      employmentType: post.employmentType,
      contractType: post.contractType,
      salaryType: post.salaryType,
      salaryAmount: Number(post.salaryAmount),
      hoursPerWeek: Number(post.hoursPerWeek),
      location: post.location,
      city: post.city,
      postcode: post.postcode,
      startDate: post.startDate,
      expiryDate: post.expiryDate,
      status: post.status,
    });
    setFormDialogOpen(true);
  };

  const onSubmitForm = async (data: JobPostingFormValues) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      let response;
      if (editingPost) {
        response = await jobPostingService.updateJob(editingPost.id, data);
      } else {
        response = await jobPostingService.createJob(data);
      }

      if (response.succeeded && response.data) {
        setSuccessMessage(editingPost ? 'Job posting updated successfully.' : 'Job posting created successfully.');
        setFormDialogOpen(false);
        fetchData();
      } else {
        setErrorMessage(response.message || 'Operation failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Error occurred while saving job post.');
    }
  };

  const openDeleteDialog = (id: string) => {
    setSelectedPostId(id);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setSelectedPostId(null);
    setDeleteDialogOpen(false);
  };

  const handleDeletePost = async () => {
    if (!selectedPostId) return;
    setErrorMessage(null);
    try {
      const response = await jobPostingService.deleteJob(selectedPostId);
      if (response.succeeded) {
        setSuccessMessage('Job posting deleted.');
        setPostings((prev) => prev.filter((p) => p.id !== selectedPostId));
      }
    } catch {
      setErrorMessage('Failed to delete job post.');
    } finally {
      closeDeleteDialog();
    }
  };

  const handleUpdatePostStatus = async (post: JobPostingResponseDto, newStatus: JobPostingStatus) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const payload: SaveJobPostingDto = {
      jobTitle: post.jobTitle,
      description: post.description,
      jobCategory: post.jobCategory,
      employmentType: post.employmentType,
      contractType: post.contractType,
      salaryType: post.salaryType,
      salaryAmount: Number(post.salaryAmount),
      hoursPerWeek: Number(post.hoursPerWeek),
      location: post.location,
      city: post.city,
      postcode: post.postcode,
      startDate: post.startDate,
      expiryDate: post.expiryDate,
      status: newStatus,
    };
    try {
      const response = await jobPostingService.updateJob(post.id, payload);
      if (response.succeeded) {
        setSuccessMessage(`Job posting status updated.`);
        fetchData();
      }
    } catch {
      setErrorMessage('Failed to update status.');
    }
  };

  const handleUpdateAppStatus = async (appId: string, newStatus: JobApplicationStatus) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const response = await jobApplicationService.updateApplicationStatus(appId, { status: newStatus });
      if (response.succeeded) {
        setSuccessMessage('Application status updated.');
        setApplications((prev) =>
          prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
        );
      }
    } catch {
      setErrorMessage('Failed to update candidate application status.');
    }
  };

  const openInviteDialog = (app: JobApplicationResponseDto) => {
    setSelectedApp(app);
    setInviteMessage(`Hi ${app.studentFullName}, we reviewed your application for the ${app.jobTitle} position and would love to invite you for an interview chat! Let us know your availability.`);
    setInviteDialogOpen(true);
  };

  const handleSendInvite = async () => {
    if (!selectedApp) return;
    setSendingInvite(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const response = await messagingService.sendJobInvitation({
        studentProfileId: selectedApp.studentProfileId,
        jobPostingId: selectedApp.jobPostingId,
        messageText: inviteMessage.trim()
      });
      if (response.succeeded) {
        setSuccessMessage(`Job invitation sent to ${selectedApp.studentFullName}!`);
        setInviteDialogOpen(false);
      } else {
        setErrorMessage(response.message || 'Failed to send invitation.');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to send job invitation. Make sure you are verified.');
    } finally {
      setSendingInvite(false);
    }
  };

  const openCoverLetter = (message: string | null, name: string) => {
    setSelectedCoverMessage(message);
    setSelectedCandidateName(name);
    setCoverLetterOpen(true);
  };

  const getEmpTypeLabel = (type: EmploymentType) => {
    if (type === EmploymentType.PartTime) return 'Part-Time';
    if (type === EmploymentType.FullTime) return 'Full-Time';
    return 'Full & Part Time';
  };

  const getContractLabel = (type: ContractType) => {
    if (type === ContractType.Immediate) return 'Immediate';
    if (type === ContractType.Temporary) return 'Temporary';
    return 'Permanent';
  };

  const getSalaryUnit = (type: SalaryType) => {
    if (type === SalaryType.Hourly) return 'hr';
    if (type === SalaryType.Daily) return 'day';
    if (type === SalaryType.Weekly) return 'wk';
    return 'mo';
  };

  const getPostStatusChip = (status: JobPostingStatus) => {
    if (status === JobPostingStatus.Published) {
      return <Chip label="Published" color="success" size="small" sx={{ fontWeight: 600 }} />;
    }
    if (status === JobPostingStatus.Closed) {
      return <Chip label="Closed" color="default" size="small" sx={{ fontWeight: 600 }} />;
    }
    return <Chip label="Draft" color="warning" size="small" sx={{ fontWeight: 600 }} />;
  };

  const getAppStatusChip = (status: JobApplicationStatus) => {
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
        return <Chip label="Pending" color="warning" size="small" sx={{ fontWeight: 600 }} />;
    }
  };

  if (loading || isVerifiedCheckLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Box>
          <Typography
            variant="h4"
            sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#0f2c59', mb: 1 }}
          >
            Manage Job Openings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Publish postings, handle applications, and shortlist student candidates.
          </Typography>
        </Box>
        {tabValue === 0 && (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Add />}
            onClick={openCreateDialog}
            disabled={!businessVerified}
            sx={{ fontWeight: 700 }}
          >
            Create Job Posting
          </Button>
        )}
      </Box>

      {!businessVerified && (
        <Alert severity="warning" icon={<Block />} sx={{ mb: 4 }}>
          <strong>Action Blocked:</strong> Your business account verification is pending or rejected. 
          You must upload valid documents under <strong>Upload Verification</strong> and wait for admin approval before you can create active job listings.
        </Alert>
      )}

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

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} color="secondary">
          <Tab icon={<WorkOutlined />} iconPosition="start" label={`Job Listings (${postings.length})`} sx={{ fontWeight: 700 }} />
          <Tab icon={<PeopleOutlined />} iconPosition="start" label={`Received Applications (${applications.length})`} sx={{ fontWeight: 700 }} />
        </Tabs>
      </Box>

      {/* TAB 1: Job Postings */}
      {tabValue === 0 && (
        <Box>
          {postings.length === 0 ? (
            <Paper sx={{ py: 8, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <WorkOutlined sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Job Listings Found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Get started by creating your first job posting.
              </Typography>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<Add />}
                onClick={openCreateDialog}
                disabled={!businessVerified}
                sx={{ fontWeight: 700 }}
              >
                Create Job Posting
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {postings.map((post) => (
                <Grid size={{ xs: 12, md: 6 }} key={post.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, color: '#0f2c59' }}>
                          {post.jobTitle}
                        </Typography>
                        {getPostStatusChip(post.status)}
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{
                        mb: 2.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {post.description}
                      </Typography>

                      <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap', mb: 2 }}>
                        <Chip label={post.jobCategory} size="small" variant="outlined" />
                        <Chip label={getEmpTypeLabel(post.employmentType)} size="small" variant="outlined" />
                        <Chip label={getContractLabel(post.contractType)} size="small" variant="outlined" />
                        <Chip label={`£${Number(post.salaryAmount).toFixed(2)}/${getSalaryUnit(post.salaryType)}`} size="small" color="secondary" variant="outlined" sx={{ fontWeight: 600 }} />
                        <Chip label={`${post.hoursPerWeek} hrs/wk`} size="small" variant="outlined" />
                      </Stack>

                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Location: {post.location}, {post.city} ({post.postcode})
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Start Date: {new Date(post.startDate).toLocaleDateString()} | Expiry: {new Date(post.expiryDate).toLocaleDateString()}
                      </Typography>
                    </CardContent>

                    <Divider />
                    <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', bgcolor: '#f8fafc' }}>
                      <Box>
                        {post.status !== JobPostingStatus.Published && (
                          <IconButton
                            color="success"
                            title="Publish Posting"
                            onClick={() => handleUpdatePostStatus(post, JobPostingStatus.Published)}
                          >
                            <Publish />
                          </IconButton>
                        )}
                        {post.status === JobPostingStatus.Published && (
                          <IconButton
                            color="warning"
                            title="Close Posting"
                            onClick={() => handleUpdatePostStatus(post, JobPostingStatus.Closed)}
                          >
                            <Block />
                          </IconButton>
                        )}
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => openEditDialog(post)}
                        >
                          Edit
                        </Button>
                        <IconButton
                          color="error"
                          onClick={() => openDeleteDialog(post.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Stack>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* TAB 2: Applications */}
      {tabValue === 1 && (
        <Box>
          {applications.length === 0 ? (
            <Paper sx={{ py: 8, textAlign: 'center' }}>
              <PeopleOutlined sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5 }} />
              <Typography variant="h6" color="text.secondary">
                No Applications Received
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Incoming candidate applications will appear here.
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} sx={{ overflowX: 'auto', width: '100%' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Candidate Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Job Applied For</TableCell>
                    <TableCell>Applied Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Cover Message</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{app.studentFullName}</TableCell>
                      <TableCell>{app.studentEmail}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{app.jobTitle}</TableCell>
                      <TableCell>{new Date(app.appliedAt).toLocaleDateString()}</TableCell>
                      <TableCell>{getAppStatusChip(app.status)}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="secondary"
                          title="Read Cover Message"
                          onClick={() => openCoverLetter(app.coverMessage, app.studentFullName)}
                        >
                          <Visibility />
                        </IconButton>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                          <Button
                            size="small"
                            variant="contained"
                            color="secondary"
                            startIcon={<Send />}
                            onClick={() => openInviteDialog(app)}
                            disabled={app.status === JobApplicationStatus.Withdrawn || app.status === JobApplicationStatus.Rejected}
                          >
                            Invite
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircle />}
                            onClick={() => handleUpdateAppStatus(app.id, JobApplicationStatus.Accepted)}
                            disabled={app.status === JobApplicationStatus.Accepted || app.status === JobApplicationStatus.Rejected || app.status === JobApplicationStatus.Withdrawn}
                          >
                            Accept
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={() => handleUpdateAppStatus(app.id, JobApplicationStatus.Shortlisted)}
                            disabled={app.status === JobApplicationStatus.Accepted || app.status === JobApplicationStatus.Rejected || app.status === JobApplicationStatus.Withdrawn || app.status === JobApplicationStatus.Shortlisted}
                          >
                            Shortlist
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            startIcon={<Cancel />}
                            onClick={() => handleUpdateAppStatus(app.id, JobApplicationStatus.Rejected)}
                            disabled={app.status === JobApplicationStatus.Accepted || app.status === JobApplicationStatus.Rejected || app.status === JobApplicationStatus.Withdrawn}
                          >
                            Reject
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Delete Posting Dialog */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
          Delete Posting
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this job posting? This will remove all related candidate views.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="inherit">Cancel</Button>
          <Button onClick={handleDeletePost} color="error" autoFocus sx={{ fontWeight: 700 }}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Cover Letter Dialog */}
      <Dialog open={coverLetterOpen} onClose={() => setCoverLetterOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <MailOutlined color="secondary" /> Cover Letter — {selectedCandidateName}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', py: 1, color: 'text.secondary' }}>
            {selectedCoverMessage || 'The candidate did not attach a cover message.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCoverLetterOpen(false)} color="secondary" sx={{ fontWeight: 700 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invite Candidate Dialog */}
      <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
          Send Job Invitation
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Invite <strong>{selectedApp?.studentFullName}</strong> to interview or chat about your job opening: <strong>{selectedApp?.jobTitle}</strong>. 
            This will initiate a chat conversation log in your inbox.
          </DialogContentText>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Invitation Greeting Message"
            value={inviteMessage}
            onChange={(e) => setInviteMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setInviteDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSendInvite}
            variant="contained"
            color="secondary"
            disabled={sendingInvite}
            startIcon={<Send />}
            sx={{ fontWeight: 700 }}
          >
            {sendingInvite ? 'Sending...' : 'Send Invitation'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create / Edit Posting Form Dialog */}
      <Dialog open={formDialogOpen} onClose={() => setFormDialogOpen(false)} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit(onSubmitForm)} noValidate>
          <DialogTitle sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
            {editingPost ? 'Edit Job Posting' : 'Create Job Posting'}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  fullWidth
                  label="Job Title"
                  {...register('jobTitle')}
                  error={!!errors.jobTitle}
                  helperText={errors.jobTitle?.message}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Job Category (e.g. Retail, Cafe)"
                  {...register('jobCategory')}
                  error={!!errors.jobCategory}
                  helperText={errors.jobCategory?.message}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Job Description & Requirements"
                  {...register('description')}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  select
                  fullWidth
                  label="Employment Type"
                  value={watch('employmentType')}
                  onChange={(e) => setValue('employmentType', Number(e.target.value) as EmploymentType)}
                  error={!!errors.employmentType}
                  helperText={errors.employmentType?.message}
                  sx={{ mb: 2 }}
                >
                  <MenuItem value={EmploymentType.PartTime}>Part-Time</MenuItem>
                  <MenuItem value={EmploymentType.FullTime}>Full-Time</MenuItem>
                  <MenuItem value={EmploymentType.Both}>Both (Flexible)</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  select
                  fullWidth
                  label="Contract Type"
                  value={watch('contractType')}
                  onChange={(e) => setValue('contractType', Number(e.target.value) as ContractType)}
                  error={!!errors.contractType}
                  helperText={errors.contractType?.message}
                  sx={{ mb: 2 }}
                >
                  <MenuItem value={ContractType.Immediate}>Immediate Start</MenuItem>
                  <MenuItem value={ContractType.Temporary}>Temporary</MenuItem>
                  <MenuItem value={ContractType.Permanent}>Permanent</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Hours per Week"
                  {...register('hoursPerWeek')}
                  error={!!errors.hoursPerWeek}
                  helperText={errors.hoursPerWeek?.message}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Salary Payment Interval"
                  value={watch('salaryType')}
                  onChange={(e) => setValue('salaryType', Number(e.target.value) as SalaryType)}
                  error={!!errors.salaryType}
                  helperText={errors.salaryType?.message}
                  sx={{ mb: 2 }}
                >
                  <MenuItem value={SalaryType.Hourly}>Hourly Wage (£)</MenuItem>
                  <MenuItem value={SalaryType.Daily}>Daily Rate (£)</MenuItem>
                  <MenuItem value={SalaryType.Weekly}>Weekly Wage (£)</MenuItem>
                  <MenuItem value={SalaryType.Monthly}>Monthly Salary (£)</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Salary Amount (£)"
                  {...register('salaryAmount')}
                  error={!!errors.salaryAmount}
                  helperText={errors.salaryAmount?.message}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Store / Venue Address Location"
                  placeholder="e.g. 12 High Street Store"
                  {...register('location')}
                  error={!!errors.location}
                  helperText={errors.location?.message}
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

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Start Date"
                  placeholder="YYYY-MM-DD"
                  {...register('startDate')}
                  error={!!errors.startDate}
                  helperText={errors.startDate?.message || 'Format: YYYY-MM-DD'}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Expiry Date"
                  placeholder="YYYY-MM-DD"
                  {...register('expiryDate')}
                  error={!!errors.expiryDate}
                  helperText={errors.expiryDate?.message || 'Format: YYYY-MM-DD'}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  select
                  fullWidth
                  label="Initial Posting Status"
                  value={watch('status')}
                  onChange={(e) => setValue('status', Number(e.target.value) as JobPostingStatus)}
                  error={!!errors.status}
                  helperText={errors.status?.message}
                  sx={{ mb: 2 }}
                >
                  <MenuItem value={JobPostingStatus.Published}>Publish Immediately</MenuItem>
                  <MenuItem value={JobPostingStatus.Draft}>Save as Draft</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setFormDialogOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={isSubmitting}
              sx={{ fontWeight: 700, px: 3 }}
            >
              {isSubmitting ? 'Saving...' : editingPost ? 'Save Changes' : 'Publish Job'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ManageJobs;
