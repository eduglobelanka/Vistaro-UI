import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import {
  People,
  Business,
  Description,
  Work,
  CheckCircle,
  Block,
  ArrowForward,
} from '@mui/icons-material';
import adminService from '../../services/admin.service';
import type {
  AdminDashboardStatsDto,
  AdminBusinessDocumentResponseDto,
} from '../../types/admin';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminDashboardStatsDto | null>(null);
  const [pendingDocs, setPendingDocs] = useState<AdminBusinessDocumentResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Rejection Dialog states
  const [rejectOpen, setRejectOpen] = useState(false);
  const [targetDocId, setTargetDocId] = useState<string | null>(null);
  const [adminComment, setAdminComment] = useState('');
  const [submittingReject, setSubmittingReject] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
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

  const handleApproveDocument = async (id: string) => {
    try {
      const res = await adminService.approveBusinessDocument(id);
      if (res.succeeded) {
        setPendingDocs(prev => prev.filter(d => d.id !== id));
        // Refresh stats
        const statsRes = await adminService.getDashboardStats();
        if (statsRes.succeeded && statsRes.data) setStats(statsRes.data);
      }
    } catch {
      setErrorMessage('Failed to approve business document.');
    }
  };

  const openRejectDialog = (id: string) => {
    setTargetDocId(id);
    setAdminComment('');
    setRejectOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!targetDocId || !adminComment.trim()) return;
    setSubmittingReject(true);
    try {
      const res = await adminService.rejectBusinessDocument(targetDocId, adminComment.trim());
      if (res.succeeded) {
        setPendingDocs(prev => prev.filter(d => d.id !== targetDocId));
        setRejectOpen(false);
        // Refresh stats
        const statsRes = await adminService.getDashboardStats();
        if (statsRes.succeeded && statsRes.data) setStats(statsRes.data);
      }
    } catch {
      setErrorMessage('Failed to reject business document.');
    } finally {
      setSubmittingReject(false);
    }
  };

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
          Overview of platform growth, verification backlogs, and real-time activity metrics.
        </Typography>
      </Box>

      {errorMessage && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage(null)}>{errorMessage}</Alert>}

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
        
        {/* User Distribution Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 260 }}>
            <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, color: '#0f2c59', mb: 2 }}>
              Platform User Distribution
            </Typography>
            
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Stack spacing={1} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0d9488' }}>Students / Candidates ({studentPercentage}%)</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f2c59' }}>Shop Owners / Businesses ({ownerPercentage}%)</Typography>
                </Box>
                {/* SVG Progress Bar */}
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

        {/* Platform Content Gauges */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 260 }}>
            <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, color: '#0f2c59', mb: 2 }}>
              Interaction Indices
            </Typography>

            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
              {/* Job Applications */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Unverified Applications</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{stats?.pendingJobApplications}</Typography>
                </Box>
                <Box sx={{ width: '100%', height: 8, borderRadius: 4, bgcolor: '#f1f5f9' }}>
                  <Box sx={{ width: `${Math.min((stats?.pendingJobApplications || 0) * 10, 100)}%`, height: '100%', bgcolor: '#eab308', borderRadius: 4 }} />
                </Box>
              </Box>

              {/* Chat volume */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Exchanged Messages</Typography>
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

      {/* QUICK DOCUMENT VERIFICATION ACTION LIST */}
      <Card sx={{ boxShadow: '0px 1px 3px rgba(15,23,42,0.05)', borderRadius: 2 }}>
        <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
          <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#0f2c59' }}>
            Awaiting Document verification Review ({pendingDocs.length})
          </Typography>
          <Button
            size="small"
            endIcon={<ArrowForward />}
            onClick={() => navigate('/admin/users')}
            sx={{ fontWeight: 700 }}
          >
            Open Registry
          </Button>
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
                    All uploaded verification document backlogs have been cleared.
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
                          onClick={() => openRejectDialog(doc.id)}
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

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} maxWidth="sm" fullWidth>
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
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRejectOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleRejectSubmit}
            color="error"
            variant="contained"
            disabled={!adminComment.trim() || submittingReject}
            sx={{ fontWeight: 700 }}
          >
            {submittingReject ? 'Submitting...' : 'Confirm Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
