
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Avatar,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Pagination,
} from '@mui/material';
import {
  People,
  Business,
  Description,
  Work,
  CheckCircle,
  Block,
  Assignment,
  Schedule,
  Message,
  LockOpen,
  ListAlt,
  Refresh,
} from '@mui/icons-material';
import adminService from '../../services/admin.service';
import adminRecruitmentApi from '../../services/adminRecruitmentApi';
import moderatedMessagesApi from '../../services/moderatedMessagesApi';
import contactReleaseApi from '../../services/contactReleaseApi';
import type {
  AdminDashboardStatsDto,
  AdminBusinessDocumentResponseDto,
  AuditLogResponseDto,
} from '../../types/admin';
import type { AdminJobApplicationResponseDto } from '../../types/recruitment';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStatsDto | null>(null);
  const [pendingDocs, setPendingDocs] = useState<AdminBusinessDocumentResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState(0);

  // Document Rejection Dialog states
  const [rejectDocOpen, setRejectDocOpen] = useState(false);
  const [targetDocId, setTargetDocId] = useState<string | null>(null);
  const [adminCommentDoc, setAdminCommentDoc] = useState('');
  const [submittingDocReject, setSubmittingDocReject] = useState(false);

  // --- New Admin recruitment states ---
  // Pending Applications
  const [pendingApps, setPendingApps] = useState<AdminJobApplicationResponseDto[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);

  // Interview Requests
  const [pendingInterviews, setPendingInterviews] = useState<AdminJobApplicationResponseDto[]>([]);
  const [loadingInterviews, setLoadingInterviews] = useState(false);

  // Pending Messages
  const [pendingMessages, setPendingMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // All applications (for contact release review)
  const [allApplications, setAllApplications] = useState<any[]>([]);
  const [loadingAllApps, setLoadingAllApps] = useState(false);
  const [appsPage, setAppsPage] = useState(1);
  const [appsTotalPages, setAppsTotalPages] = useState(1);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogResponseDto[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // --- Dialog control states ---
  // App review (Approve / Reject / More Info)
  const [appReviewOpen, setAppReviewOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<AdminJobApplicationResponseDto | null>(null);
  const [appReviewAction, setAppReviewAction] = useState<'approve' | 'reject' | 'info'>('approve');
  const [appReviewComment, setAppReviewComment] = useState('');
  const [submittingAppReview, setSubmittingAppReview] = useState(false);

  // Interview Approval
  const [interviewApproveOpen, setInterviewApproveOpen] = useState(false);
  const [selectedInterviewApp, setSelectedInterviewApp] = useState<AdminJobApplicationResponseDto | null>(null);
  const [submittingInterview, setSubmittingInterview] = useState(false);

  // Message rejection
  const [msgRejectOpen, setMsgRejectOpen] = useState(false);
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);
  const [msgRejectionReason, setMsgRejectionReason] = useState('');
  const [submittingMsgReject, setSubmittingMsgReject] = useState(false);

  // Contact Release Approval / Denial Dialog
  const [contactReleaseOpen, setContactReleaseOpen] = useState(false);
  const [selectedContactApp, setSelectedContactApp] = useState<any | null>(null);
  const [contactReleaseAction, setContactReleaseAction] = useState<'approve' | 'deny'>('approve');
  const [contactReleaseReason, setContactReleaseReason] = useState('');
  const [submittingContactRelease, setSubmittingContactRelease] = useState(false);

  useEffect(() => {
    fetchDashboardOverview();
    fetchPendingApplications();
    fetchPendingInterviews();
    fetchPendingMessages();
  }, []);

  // Fetch data based on selected tab
  useEffect(() => {
    if (activeTab === 1) {
      fetchPendingApplications();
    } else if (activeTab === 2) {
      fetchPendingInterviews();
    } else if (activeTab === 3) {
      fetchPendingMessages();
    } else if (activeTab === 4) {
      fetchContactReleaseApplications();
    } else if (activeTab === 5) {
      fetchAuditLogs();
    }
  }, [activeTab, appsPage]);

  const fetchDashboardOverview = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const statsRes = await adminService.getDashboardStats();
      const docsRes = await adminService.getBusinessDocuments({
        pageNumber: 1,
        pageSize: 5,
        status: 'Pending',
      });

      if (statsRes.succeeded && statsRes.data) {
        setStats(statsRes.data);
      }
      if (docsRes.succeeded && docsRes.data) {
        setPendingDocs(docsRes.data.items);
      }
    } catch {
      setErrorMessage('Failed to connect to administrative metrics APIs.');
    } finally {
      setLoading(false);
    }
  };

  // --- Fetch methods ---
  const fetchPendingApplications = async () => {
    setLoadingApps(true);
    try {
      const res = await adminRecruitmentApi.getPendingApplications();
      if (res.succeeded && res.data) {
        setPendingApps(res.data);
      }
    } catch {
      setErrorMessage('Failed to load pending applications.');
    } finally {
      setLoadingApps(false);
    }
  };

  const fetchPendingInterviews = async () => {
    setLoadingInterviews(true);
    try {
      const res = await adminRecruitmentApi.getPendingInterviews();
      if (res.succeeded && res.data) {
        setPendingInterviews(res.data);
      }
    } catch {
      setErrorMessage('Failed to load pending interview requests.');
    } finally {
      setLoadingInterviews(false);
    }
  };

  const fetchPendingMessages = async () => {
    setLoadingMessages(true);
    try {
      const res = await moderatedMessagesApi.getPendingMessages();
      if (res.succeeded && res.data) {
        setPendingMessages(res.data);
      }
    } catch {
      setErrorMessage('Failed to load pending messages.');
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchContactReleaseApplications = async () => {
    setLoadingAllApps(true);
    try {
      const res = await adminService.getJobApplications({
        pageNumber: appsPage,
        pageSize: 10,
      });
      if (res.succeeded && res.data) {
        setAllApplications(res.data.items);
        setAppsTotalPages(res.data.totalPages);
      }
    } catch {
      setErrorMessage('Failed to load job applications for contact release review.');
    } finally {
      setLoadingAllApps(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await adminRecruitmentApi.getAuditLogs(100);
      if (res.succeeded && res.data) {
        setAuditLogs(res.data);
      }
    } catch {
      setErrorMessage('Failed to load audit logs.');
    } finally {
      setLoadingLogs(false);
    }
  };

  // --- Action Handlers ---
  const handleApproveDocument = async (id: string) => {
    try {
      const res = await adminService.approveBusinessDocument(id);
      if (res.succeeded) {
        setPendingDocs(prev => prev.filter(d => d.id !== id));
        fetchDashboardOverview();
        setSuccessMessage('Business document approved.');
      }
    } catch {
      setErrorMessage('Failed to approve business document.');
    }
  };

  const openRejectDocDialog = (id: string) => {
    setTargetDocId(id);
    setAdminCommentDoc('');
    setRejectDocOpen(true);
  };

  const handleRejectDocSubmit = async () => {
    if (!targetDocId || !adminCommentDoc.trim()) return;
    setSubmittingDocReject(true);
    try {
      const res = await adminService.rejectBusinessDocument(targetDocId, adminCommentDoc.trim());
      if (res.succeeded) {
        setPendingDocs(prev => prev.filter(d => d.id !== targetDocId));
        setRejectDocOpen(false);
        fetchDashboardOverview();
        setSuccessMessage('Business document rejected.');
      }
    } catch {
      setErrorMessage('Failed to reject business document.');
    } finally {
      setSubmittingDocReject(false);
    }
  };

  // --- New Recruitment Handlers ---
  const openAppReviewDialog = (app: AdminJobApplicationResponseDto, action: 'approve' | 'reject' | 'info') => {
    setSelectedApp(app);
    setAppReviewAction(action);
    setAppReviewComment('');
    setAppReviewOpen(true);
  };

  const handleAppReviewSubmit = async () => {
    if (!selectedApp) return;
    setSubmittingAppReview(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      let res;
      const data = { adminComment: appReviewComment.trim() };
      
      if (appReviewAction === 'approve') {
        res = await adminRecruitmentApi.approveApplicationForEmployer(selectedApp.id, data);
      } else if (appReviewAction === 'reject') {
        res = await adminRecruitmentApi.rejectApplication(selectedApp.id, data);
      } else {
        res = await adminRecruitmentApi.requestMoreInformation(selectedApp.id, data);
      }

      if (res.succeeded) {
        setSuccessMessage(`Application review completed: ${appReviewAction.toUpperCase()}`);
        setAppReviewOpen(false);
        fetchPendingApplications();
      } else {
        setErrorMessage(res.message || 'Operation failed.');
      }
    } catch {
      setErrorMessage('Failed to submit application review.');
    } finally {
      setSubmittingAppReview(false);
    }
  };

  const openInterviewDialog = (app: AdminJobApplicationResponseDto) => {
    setSelectedInterviewApp(app);
    setInterviewApproveOpen(true);
  };

  const handleApproveInterview = async () => {
    if (!selectedInterviewApp) return;
    setSubmittingInterview(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await adminRecruitmentApi.approveInterview(selectedInterviewApp.id);
      if (res.succeeded) {
        setSuccessMessage('Interview request approved successfully.');
        setInterviewApproveOpen(false);
        fetchPendingInterviews();
      } else {
        setErrorMessage(res.message || 'Failed to approve interview.');
      }
    } catch {
      setErrorMessage('Error occurred while approving interview.');
    } finally {
      setSubmittingInterview(false);
    }
  };

  const handleApproveMessage = async (id: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await moderatedMessagesApi.approveMessage(id);
      if (res.succeeded) {
        setSuccessMessage('Message approved for delivery.');
        fetchPendingMessages();
      } else {
        setErrorMessage(res.message || 'Failed to approve message.');
      }
    } catch {
      setErrorMessage('Error occurred while approving message.');
    }
  };

  const openMsgRejectDialog = (id: string) => {
    setSelectedMsgId(id);
    setMsgRejectionReason('');
    setMsgRejectOpen(true);
  };

  const handleRejectMessage = async () => {
    if (!selectedMsgId || !msgRejectionReason.trim()) return;
    setSubmittingMsgReject(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await moderatedMessagesApi.rejectMessage(selectedMsgId, {
        rejectionReason: msgRejectionReason.trim(),
      });
      if (res.succeeded) {
        setSuccessMessage('Message rejected.');
        setMsgRejectOpen(false);
        fetchPendingMessages();
      } else {
        setErrorMessage(res.message || 'Failed to reject message.');
      }
    } catch {
      setErrorMessage('Error occurred while rejecting message.');
    } finally {
      setSubmittingMsgReject(false);
    }
  };

  const openContactReleaseDialog = (app: any, action: 'approve' | 'deny') => {
    setSelectedContactApp(app);
    setContactReleaseAction(action);
    setContactReleaseReason('');
    setContactReleaseOpen(true);
  };

  const handleContactReleaseSubmit = async () => {
    if (!selectedContactApp) return;
    setSubmittingContactRelease(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      let res;
      if (contactReleaseAction === 'approve') {
        res = await contactReleaseApi.approveContactRelease(selectedContactApp.id, {
          releasedFields: 'StudentEmail,StudentPhoneNumber',
          reason: contactReleaseReason.trim() || 'Approved by Admin for recruitment coordination',
        });
      } else {
        res = await contactReleaseApi.denyContactRelease(selectedContactApp.id, {
          adminComment: contactReleaseReason.trim() || 'Contact details release request denied.',
        });
      }

      if (res.succeeded) {
        setSuccessMessage(`Contact release decision processed: ${contactReleaseAction.toUpperCase()}`);
        setContactReleaseOpen(false);
        fetchContactReleaseApplications();
      } else {
        setErrorMessage(res.message || 'Failed to submit contact release decision.');
      }
    } catch {
      setErrorMessage('Error occurred while submitting contact release decision.');
    } finally {
      setSubmittingContactRelease(false);
    }
  };

  // Status mapping to user-friendly labels
  const STATUS_LABELS: Record<number, string> = {
    1: 'Submitted to Vistaro',
    2: 'Under Admin Review',
    3: 'More Info Required',
    4: 'Approved for Review',
    5: 'Rejected by Admin',
    6: 'Employer Reviewing',
    7: 'Shortlisted',
    8: 'Interview Requested',
    9: 'Interview Approved',
    10: 'Conditional Offer',
    11: 'Offer Accepted',
    12: 'Hired',
    13: 'Rejected by Employer',
    14: 'Withdrawn',
  };

  const getStatusLabel = (status: number) => STATUS_LABELS[status] || 'Unknown';

  if (loading && !stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  // Calculate distributions
  const studentCount = stats?.students || 0;
  const ownerCount = stats?.shopOwners || 0;
  const activeUserTotal = stats?.activeUsers || 1;
  const studentPercentage = Math.round((studentCount / activeUserTotal) * 100);
  const ownerPercentage = Math.round((ownerCount / activeUserTotal) * 100);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#0f2c59', mb: 1 }}
        >
          Admin Console
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Overview of platform growth, recruitment workflows, and real-time moderation backlog.
        </Typography>
      </Box>

      {errorMessage && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage(null)}>{errorMessage}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>{successMessage}</Alert>}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} color="secondary" variant="scrollable" scrollButtons="auto">
          <Tab icon={<People />} iconPosition="start" label="Overview & Docs" sx={{ fontWeight: 700 }} />
          <Tab icon={<Assignment />} iconPosition="start" label={`Pending Applications (${pendingApps.length})`} sx={{ fontWeight: 700 }} />
          <Tab icon={<Schedule />} iconPosition="start" label={`Interview Requests (${pendingInterviews.length})`} sx={{ fontWeight: 700 }} />
          <Tab icon={<Message />} iconPosition="start" label={`Pending Messages (${pendingMessages.length})`} sx={{ fontWeight: 700 }} />
          <Tab icon={<LockOpen />} iconPosition="start" label="Contact Release" sx={{ fontWeight: 700 }} />
          <Tab icon={<ListAlt />} iconPosition="start" label="Security Audits" sx={{ fontWeight: 700 }} />
        </Tabs>
      </Box>

      {/* TAB 0: OVERVIEW & DOCS */}
      {activeTab === 0 && (
        <Box>
          {/* METRIC CARD GRID */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Total Users */}
            <Grid size={{ xs: 12, sm: 6, md: 3.2 }}>
              <Card sx={{ borderLeft: '5px solid #002c6c', boxShadow: '0px 1px 3px rgba(15,23,42,0.05)' }}>
                <CardContent sx={{ py: 2.5, px: 3 }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Total Accounts
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, color: '#0f2c59' }}>
                        {stats?.totalUsers}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(0, 44, 108, 0.1)', color: '#002c6c', width: 48, height: 48 }}>
                      <People />
                    </Avatar>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Active logins: <strong>{stats?.activeUsers}</strong>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Shop Owners pending approval */}
            <Grid size={{ xs: 12, sm: 6, md: 2.9 }}>
              <Card sx={{ borderLeft: '5px solid #eab308', boxShadow: '0px 1px 3px rgba(15,23,42,0.05)' }}>
                <CardContent sx={{ py: 2.5, px: 3 }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Pending Shops
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, color: '#eab308' }}>
                        {stats?.pendingShopOwners}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(234, 179, 8, 0.1)', color: '#eab308', width: 48, height: 48 }}>
                      <Business />
                    </Avatar>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Approved businesses: <strong>{stats?.approvedShopOwners}</strong>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Pending documents */}
            <Grid size={{ xs: 12, sm: 6, md: 2.9 }}>
              <Card sx={{ borderLeft: '5px solid #06b6d4', boxShadow: '0px 1px 3px rgba(15,23,42,0.05)' }}>
                <CardContent sx={{ py: 2.5, px: 3 }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Review Backlog
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, color: '#06b6d4' }}>
                        {stats?.pendingBusinessDocuments}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', width: 48, height: 48 }}>
                      <Description />
                    </Avatar>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Business license documents
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Published job posts */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ borderLeft: '5px solid #0d9488', boxShadow: '0px 1px 3px rgba(15,23,42,0.05)' }}>
                <CardContent sx={{ py: 2.5, px: 3 }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Active Listings
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, color: '#0d9488' }}>
                        {stats?.publishedJobPostings}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(13, 148, 136, 0.1)', color: '#0d9488', width: 48, height: 48 }}>
                      <Work />
                    </Avatar>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Exchanged chat records: <strong>{stats?.activeMessages}</strong>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* ANALYTICS CHARTS PANEL */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 260 }}>
                <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, color: '#0f2c59', mb: 2 }}>
                  Platform User Distribution
                </Typography>
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0d9488' }}>Students ({studentPercentage}%)</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f2c59' }}>Employers ({ownerPercentage}%)</Typography>
                    </Box>
                    <Box sx={{ width: '100%', height: 16, borderRadius: 8, overflow: 'hidden', display: 'flex', bgcolor: '#f1f5f9' }}>
                      <Box sx={{ width: `${studentPercentage}%`, height: '100%', bgcolor: '#0d9488' }} />
                      <Box sx={{ width: `${ownerPercentage}%`, height: '100%', bgcolor: '#0f2c59' }} />
                    </Box>
                  </Stack>
                  <Grid container spacing={2}>
                    <Grid size={6}>
                      <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', bgcolor: 'rgba(13, 148, 136, 0.02)' }}>
                        <Typography variant="caption" color="text.secondary">Students</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0d9488' }}>{stats?.students}</Typography>
                      </Paper>
                    </Grid>
                    <Grid size={6}>
                      <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', bgcolor: 'rgba(15, 44, 89, 0.02)' }}>
                        <Typography variant="caption" color="text.secondary">Shop Owners</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f2c59' }}>{stats?.shopOwners}</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 260 }}>
                <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, color: '#0f2c59', mb: 2 }}>
                  Recruitment Workflow Backlog
                </Typography>
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Unverified Applications</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{stats?.pendingJobApplications}</Typography>
                    </Box>
                    <Box sx={{ width: '100%', height: 8, borderRadius: 4, bgcolor: '#f1f5f9' }}>
                      <Box sx={{ width: `${Math.min((stats?.pendingJobApplications || 0) * 10, 100)}%`, height: '100%', bgcolor: '#eab308', borderRadius: 4 }} />
                    </Box>
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Messages Exchanged</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{stats?.activeMessages}</Typography>
                    </Box>
                    <Box sx={{ width: '100%', height: 8, borderRadius: 4, bgcolor: '#f1f5f9' }}>
                      <Box sx={{ width: `${Math.min((stats?.activeMessages || 0) * 5, 100)}%`, height: '100%', bgcolor: '#3b82f6', borderRadius: 4 }} />
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* DOCUMENT REVIEW queue */}
          <Card sx={{ boxShadow: '0px 1px 3px rgba(15,23,42,0.05)', borderRadius: 2 }}>
            <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
              <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#0f2c59' }}>
                Awaiting Business Verification Document Reviews ({pendingDocs.length})
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Shop Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>File Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Content Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Uploaded Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingDocs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        All uploaded business verification document backlogs have been cleared.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingDocs.map((doc) => (
                      <TableRow key={doc.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{doc.shopName}</TableCell>
                        <TableCell>{doc.originalFileName}</TableCell>
                        <TableCell>{doc.contentType}</TableCell>
                        <TableCell>{new Date(doc.uploadedAt).toLocaleDateString()}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircle />}
                              onClick={() => handleApproveDocument(doc.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<Block />}
                              onClick={() => openRejectDocDialog(doc.id)}
                            >
                              Reject
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>
      )}

      {/* TAB 1: PENDING APPLICATIONS */}
      {activeTab === 1 && (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#0f2c59' }}>
              Pending Job Applications Moderation Review
            </Typography>
            <IconButton onClick={fetchPendingApplications} color="primary" sx={{ border: '1px solid #cbd5e1' }}>
              <Refresh />
            </IconButton>
          </Box>
          
          {loadingApps ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : pendingApps.length === 0 ? (
            <Typography variant="body1" sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
              No pending job applications awaiting moderation review.
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Candidate Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Shop / Employer</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Job Title</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date Applied</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingApps.map((app) => (
                    <TableRow key={app.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{app.studentFullName}</TableCell>
                      <TableCell>{app.shopName}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{app.jobTitle}</TableCell>
                      <TableCell>{new Date(app.appliedAt).toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => openAppReviewDialog(app, 'approve')}
                          >
                            Approve for Employer
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            onClick={() => openAppReviewDialog(app, 'info')}
                          >
                            Need Info
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            onClick={() => openAppReviewDialog(app, 'reject')}
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
        </Paper>
      )}

      {/* TAB 2: INTERVIEW REQUESTS */}
      {activeTab === 2 && (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#0f2c59' }}>
              Pending Employer Interview Approval Requests
            </Typography>
            <IconButton onClick={fetchPendingInterviews} color="primary" sx={{ border: '1px solid #cbd5e1' }}>
              <Refresh />
            </IconButton>
          </Box>

          {loadingInterviews ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : pendingInterviews.length === 0 ? (
            <Typography variant="body1" sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
              No pending interview approval requests.
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Job Title</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Shop / Employer</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Candidate Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Requested On</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingInterviews.map((app) => (
                    <TableRow key={app.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{app.jobTitle}</TableCell>
                      <TableCell>{app.shopName}</TableCell>
                      <TableCell>{app.studentFullName}</TableCell>
                      <TableCell>{app.updatedAt ? new Date(app.updatedAt).toLocaleDateString() : '—'}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          startIcon={<CheckCircle />}
                          onClick={() => openInterviewDialog(app)}
                        >
                          Approve Interview
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* TAB 3: PENDING MESSAGES */}
      {activeTab === 3 && (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#0f2c59' }}>
              Pending Candidate-Employer Moderated Messages Queue
            </Typography>
            <IconButton onClick={fetchPendingMessages} color="primary" sx={{ border: '1px solid #cbd5e1' }}>
              <Refresh />
            </IconButton>
          </Box>

          {loadingMessages ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : pendingMessages.length === 0 ? (
            <Typography variant="body1" sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
              No pending messages in moderation queue.
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Message Text</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Sender ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Receiver ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Sent Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingMessages.map((msg) => (
                    <TableRow key={msg.id} hover>
                      <TableCell sx={{ fontWeight: 500, maxWidth: 300, wordWrap: 'break-word' }}>
                        {msg.messageText}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>{msg.senderUserId}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>{msg.receiverUserId}</TableCell>
                      <TableCell>{new Date(msg.createdAt).toLocaleString()}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleApproveMessage(msg.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => openMsgRejectDialog(msg.id)}
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
        </Paper>
      )}

      {/* TAB 4: CONTACT RELEASE REVIEW */}
      {activeTab === 4 && (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#0f2c59' }}>
              Candidate Contact Details Release Dashboard
            </Typography>
            <IconButton onClick={fetchContactReleaseApplications} color="primary" sx={{ border: '1px solid #cbd5e1' }}>
              <Refresh />
            </IconButton>
          </Box>

          {loadingAllApps ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : allApplications.length === 0 ? (
            <Typography variant="body1" sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
              No applications found in system registry.
            </Typography>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Candidate Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Shop / Employer</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Job Title</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Contact Released</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allApplications.map((app) => (
                      <TableRow key={app.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{app.studentFullName}</TableCell>
                        <TableCell>{app.shopName}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{app.jobTitle}</TableCell>
                        <TableCell>{getStatusLabel(app.status)}</TableCell>
                        <TableCell>
                          {app.contactReleasedAt ? (
                            <Chip label={`Released on ${new Date(app.contactReleasedAt).toLocaleDateString()}`} color="success" size="small" />
                          ) : (
                            <Chip label="Hidden / Locked" color="default" size="small" />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                            {!app.contactReleasedAt && (
                              <>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="warning"
                                  onClick={() => openContactReleaseDialog(app, 'approve')}
                                >
                                  Release Details
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  onClick={() => openContactReleaseDialog(app, 'deny')}
                                >
                                  Deny Request
                                </Button>
                              </>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {appsTotalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={appsTotalPages}
                    page={appsPage}
                    onChange={(_, val) => setAppsPage(val)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </Paper>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 5 && (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#0f2c59' }}>
              Security Audit Trails Log
            </Typography>
            <IconButton onClick={fetchAuditLogs} color="primary" sx={{ border: '1px solid #cbd5e1' }}>
              <Refresh />
            </IconButton>
          </Box>

          {loadingLogs ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : auditLogs.length === 0 ? (
            <Typography variant="body1" sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
              No audit log entries available.
            </Typography>
          ) : (
            <TableContainer sx={{ maxHeight: 500 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Entity Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Operator User ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip label={log.action} size="small" color="primary" sx={{ fontWeight: 700 }} />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{log.entity}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{log.userId}</TableCell>
                      <TableCell sx={{ fontSize: '0.85rem' }}>{log.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* --- Dialogs --- */}
      {/* Reject Doc Dialog */}
      <Dialog open={rejectDocOpen} onClose={() => setRejectDocOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
          Submit Document Rejection Audit Reason
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Write feedback detailing why this business document was rejected.
          </DialogContentText>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Rejection Comments"
            value={adminCommentDoc}
            onChange={(e) => setAdminCommentDoc(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRejectDocOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleRejectDocSubmit}
            color="error"
            variant="contained"
            disabled={!adminCommentDoc.trim() || submittingDocReject}
            sx={{ fontWeight: 700 }}
          >
            {submittingDocReject ? 'Submitting...' : 'Confirm Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* App Review Dialog */}
      <Dialog open={appReviewOpen} onClose={() => setAppReviewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
          Submit Application Review Decision
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Provide comments regarding the decision for candidate <strong>{selectedApp?.studentFullName}</strong>'s application at <strong>{selectedApp?.shopName}</strong>.
          </DialogContentText>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Administrative Comments"
            placeholder="Type comment remarks here..."
            value={appReviewComment}
            onChange={(e) => setAppReviewComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAppReviewOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleAppReviewSubmit}
            color={appReviewAction === 'approve' ? 'success' : appReviewAction === 'reject' ? 'error' : 'warning'}
            variant="contained"
            disabled={submittingAppReview}
            sx={{ fontWeight: 700 }}
          >
            {submittingAppReview 
              ? 'Submitting...' 
              : appReviewAction === 'approve' 
              ? 'Approve for Employer' 
              : appReviewAction === 'reject' 
              ? 'Reject' 
              : 'Request More Information'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Interview Approval Confirmation Dialog */}
      <Dialog open={interviewApproveOpen} onClose={() => setInterviewApproveOpen(false)}>
        <DialogTitle sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
          Approve Interview Request
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to approve the interview request for candidate <strong>{selectedInterviewApp?.studentFullName}</strong> at <strong>{selectedInterviewApp?.shopName}</strong>?
            This will authorize the candidate to schedule and respond.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setInterviewApproveOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleApproveInterview}
            color="primary"
            variant="contained"
            disabled={submittingInterview}
            sx={{ fontWeight: 700 }}
          >
            {submittingInterview ? 'Approving...' : 'Confirm Approve'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Message Rejection Dialog */}
      <Dialog open={msgRejectOpen} onClose={() => setMsgRejectOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
          Moderated Message Rejection Reason
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please write the rejection reason. This comment will be logged on the audit record and returned to the sender.
          </DialogContentText>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Rejection Reason"
            value={msgRejectionReason}
            onChange={(e) => setMsgRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setMsgRejectOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleRejectMessage}
            color="error"
            variant="contained"
            disabled={submittingMsgReject || !msgRejectionReason.trim()}
            sx={{ fontWeight: 700 }}
          >
            {submittingMsgReject ? 'Submitting...' : 'Confirm Reject Message'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contact Release Approval Dialog */}
      <Dialog open={contactReleaseOpen} onClose={() => setContactReleaseOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
          {contactReleaseAction === 'approve' ? 'Approve Contact Release' : 'Deny Contact Release'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {contactReleaseAction === 'approve'
              ? `You are releasing student contact details (Email, Phone) to employer ${selectedContactApp?.shopName}.`
              : `You are denying contact release to employer ${selectedContactApp?.shopName}.`}
          </DialogContentText>
          <TextField
            fullWidth
            multiline
            rows={4}
            label={contactReleaseAction === 'approve' ? 'Release Reason / Audit comments' : 'Denial Reason'}
            placeholder={contactReleaseAction === 'approve' ? 'Approved for interview scheduling...' : 'Denied due to incomplete interview coordination...'}
            value={contactReleaseReason}
            onChange={(e) => setContactReleaseReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setContactReleaseOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleContactReleaseSubmit}
            color={contactReleaseAction === 'approve' ? 'warning' : 'error'}
            variant="contained"
            disabled={submittingContactRelease}
            sx={{ fontWeight: 700 }}
          >
            {submittingContactRelease ? 'Submitting...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default AdminDashboard;
