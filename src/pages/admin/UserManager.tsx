import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Pagination,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  Check,
  Close,
  Delete,
  Block,
  CheckCircle,
  Search,
  Refresh,
} from '@mui/icons-material';
import adminService from '../../services/admin.service';
import type {
  AdminUserResponseDto,
  AdminShopOwnerResponseDto,
  AdminBusinessDocumentResponseDto,
  AdminJobPostingResponseDto,
} from '../../types/admin';
import { BusinessVerificationStatus, DocumentVerificationStatus } from '../../types/admin';
import { JobPostingStatus } from '../../types/jobs';
import { parseApiError } from '../../services/api-client';

export const UserManager: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);

  // Queries
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Data states
  const [users, setUsers] = useState<AdminUserResponseDto[]>([]);
  const [shopOwners, setShopOwners] = useState<AdminShopOwnerResponseDto[]>([]);
  const [documents, setDocuments] = useState<AdminBusinessDocumentResponseDto[]>([]);
  const [jobPostings, setJobPostings] = useState<AdminJobPostingResponseDto[]>([]);

  // Loading / Error
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dialog actions
  const [deleteUserOpen, setDeleteUserOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectType, setRejectType] = useState<'owner' | 'document' | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [adminComment, setAdminComment] = useState('');
  const [submittingReject, setSubmittingReject] = useState(false);

  useEffect(() => {
    setPage(1);
    fetchData();
  }, [currentTab]);

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const q = {
        search: searchQuery.trim() || undefined,
        pageNumber: page,
        pageSize: pageSize,
      };

      if (currentTab === 0) {
        const res = await adminService.getUsers(q);
        if (res.succeeded && res.data) {
          setUsers(res.data.items);
          setTotalPages(res.data.totalPages);
        }
      } else if (currentTab === 1) {
        const res = await adminService.getShopOwners(q);
        if (res.succeeded && res.data) {
          setShopOwners(res.data.items);
          setTotalPages(res.data.totalPages);
        }
      } else if (currentTab === 2) {
        const res = await adminService.getBusinessDocuments(q);
        if (res.succeeded && res.data) {
          setDocuments(res.data.items);
          setTotalPages(res.data.totalPages);
        }
      } else if (currentTab === 3) {
        const res = await adminService.getJobPostings(q);
        if (res.succeeded && res.data) {
          setJobPostings(res.data.items);
          setTotalPages(res.data.totalPages);
        }
      }
    } catch {
      setErrorMessage('Failed to load system management items.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  // --- Tab 0: User actions ---
  const handleToggleUserActive = async (user: AdminUserResponseDto) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = user.isActive
        ? await adminService.deactivateUser(user.id)
        : await adminService.activateUser(user.id);
      if (res.succeeded) {
        setSuccessMessage(`User status updated successfully.`);
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !user.isActive } : u));
      }
    } catch (err: any) {
      setErrorMessage(parseApiError(err));
    }
  };

  const confirmDeleteUser = (id: string) => {
    setTargetUserId(id);
    setDeleteUserOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!targetUserId) return;
    setDeleteUserOpen(false);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await adminService.deleteUser(targetUserId);
      if (res.succeeded) {
        setSuccessMessage('User account deleted.');
        setUsers(prev => prev.filter(u => u.id !== targetUserId));
      }
    } catch {
      setErrorMessage('Failed to delete user.');
    }
  };

  // --- Tab 1: Shop Owner verifications ---
  const handleApproveShopOwner = async (id: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await adminService.approveShopOwner(id);
      if (res.succeeded) {
        setSuccessMessage('Shop owner verification approved.');
        setShopOwners(prev => prev.map(o => o.id === id ? { ...o, businessVerificationStatus: BusinessVerificationStatus.Approved } : o));
      }
    } catch {
      setErrorMessage('Failed to approve shop owner.');
    }
  };

  const openRejectShopOwnerDialog = (id: string) => {
    setRejectType('owner');
    setTargetId(id);
    setAdminComment('');
    setRejectOpen(true);
  };

  // --- Tab 2: Document verifications ---
  const handleApproveDocument = async (id: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await adminService.approveBusinessDocument(id);
      if (res.succeeded) {
        setSuccessMessage('Business document approved.');
        setDocuments(prev => prev.map(d => d.id === id ? { ...d, verificationStatus: DocumentVerificationStatus.Approved } : d));
      }
    } catch {
      setErrorMessage('Failed to approve business document.');
    }
  };

  const openRejectDocumentDialog = (id: string) => {
    setRejectType('document');
    setTargetId(id);
    setAdminComment('');
    setRejectOpen(true);
  };

  // Reject Submit Handler
  const handleRejectSubmit = async () => {
    if (!targetId || !adminComment.trim()) return;
    setSubmittingReject(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      if (rejectType === 'owner') {
        const res = await adminService.rejectShopOwner(targetId, adminComment.trim());
        if (res.succeeded) {
          setSuccessMessage('Shop owner rejected with comments.');
          setShopOwners(prev => prev.map(o => o.id === targetId ? { ...o, businessVerificationStatus: BusinessVerificationStatus.Rejected, adminComment: adminComment.trim() } : o));
          setRejectOpen(false);
        }
      } else if (rejectType === 'document') {
        const res = await adminService.rejectBusinessDocument(targetId, adminComment.trim());
        if (res.succeeded) {
          setSuccessMessage('Business document rejected with comments.');
          setDocuments(prev => prev.map(d => d.id === targetId ? { ...d, verificationStatus: DocumentVerificationStatus.Rejected, adminComment: adminComment.trim() } : d));
          setRejectOpen(false);
        }
      }
    } catch {
      setErrorMessage('Failed to submit rejection action.');
    } finally {
      setSubmittingReject(false);
    }
  };

  // --- Tab 3: Job actions ---
  const handleApproveJob = async (id: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await adminService.approveJobPosting(id);
      if (res.succeeded) {
        setSuccessMessage('Job posting approved & published.');
        setJobPostings(prev => prev.map(j => j.id === id ? { ...j, status: JobPostingStatus.Published } : j));
      }
    } catch {
      setErrorMessage('Failed to approve job posting.');
    }
  };

  const handleCloseJob = async (id: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await adminService.closeJobPosting(id);
      if (res.succeeded) {
        setSuccessMessage('Job posting closed.');
        setJobPostings(prev => prev.map(j => j.id === id ? { ...j, status: JobPostingStatus.Closed } : j));
      }
    } catch {
      setErrorMessage('Failed to close job posting.');
    }
  };

  const handleDeleteJob = async (id: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await adminService.deleteJobPosting(id);
      if (res.succeeded) {
        setSuccessMessage('Job posting deleted.');
        setJobPostings(prev => prev.filter(j => j.id !== id));
      }
    } catch {
      setErrorMessage('Failed to delete job posting.');
    }
  };

  const getBusinessStatusChip = (status: BusinessVerificationStatus) => {
    switch (status) {
      case BusinessVerificationStatus.Approved:
        return <Chip label="Approved" color="success" size="small" sx={{ fontWeight: 600 }} />;
      case BusinessVerificationStatus.Rejected:
        return <Chip label="Rejected" color="error" size="small" sx={{ fontWeight: 600 }} />;
      default:
        return <Chip label="Pending" color="warning" size="small" sx={{ fontWeight: 600 }} />;
    }
  };

  const getDocStatusChip = (status: DocumentVerificationStatus) => {
    switch (status) {
      case DocumentVerificationStatus.Approved:
        return <Chip label="Approved" color="success" size="small" sx={{ fontWeight: 600 }} />;
      case DocumentVerificationStatus.Rejected:
        return <Chip label="Rejected" color="error" size="small" sx={{ fontWeight: 600 }} />;
      default:
        return <Chip label="Pending" color="warning" size="small" sx={{ fontWeight: 600 }} />;
    }
  };

  const getJobStatusChip = (status: typeof JobPostingStatus[keyof typeof JobPostingStatus]) => {
    switch (status) {
      case JobPostingStatus.Published:
        return <Chip label="Published" color="success" size="small" sx={{ fontWeight: 600 }} />;
      case JobPostingStatus.Closed:
        return <Chip label="Closed" color="default" size="small" sx={{ fontWeight: 600 }} />;
      default:
        return <Chip label="Draft / Pending" color="warning" size="small" sx={{ fontWeight: 600 }} />;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#0f2c59', mb: 1 }}>
            User & Content Manager
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage system configurations, profiles, business document reviews, and platform listings.
          </Typography>
        </Box>
        <IconButton onClick={fetchData} title="Refresh Table" sx={{ border: '1px solid #cbd5e1', bgcolor: '#ffffff' }}>
          <Refresh />
        </IconButton>
      </Box>

      {successMessage && <Alert severity="success" onClose={() => setSuccessMessage(null)} sx={{ mb: 3 }}>{successMessage}</Alert>}
      {errorMessage && <Alert severity="error" onClose={() => setErrorMessage(null)} sx={{ mb: 3 }}>{errorMessage}</Alert>}

      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} indicatorColor="primary" textColor="primary" variant="fullWidth">
          <Tab label="System Users" sx={{ fontWeight: 700 }} />
          <Tab label="Shop Owner Verifications" sx={{ fontWeight: 700 }} />
          <Tab label="Uploaded Documents" sx={{ fontWeight: 700 }} />
          <Tab label="Platform Job Posts" sx={{ fontWeight: 700 }} />
        </Tabs>
      </Paper>

      {/* SEARCH AND FILTERS */}
      <Box component="form" onSubmit={handleSearch} sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by name, shop name, category, city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ bgcolor: '#ffffff' }}
        />
        <Button variant="contained" type="submit" startIcon={<Search />} sx={{ fontWeight: 700 }}>
          Search
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: '0px 1px 3px rgba(15,23,42,0.05)', borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <Table>
            {/* TAB 0: SYSTEM USERS */}
            {currentTab === 0 && (
              <>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Full Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Roles</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Active Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Created At</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow><TableCell colSpan={7} align="center">No user accounts found.</TableCell></TableRow>
                  ) : (
                    users.map((u) => (
                      <TableRow key={u.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{u.fullName}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>{u.phoneNumber || '—'}</TableCell>
                        <TableCell>
                          {u.roles.map(r => (
                            <Chip key={r} label={r} size="small" variant="outlined" color="primary" sx={{ mr: 0.5 }} />
                          ))}
                        </TableCell>
                        <TableCell>
                          <Chip label={u.isActive ? 'Active' : 'Deactivated'} color={u.isActive ? 'success' : 'default'} size="small" sx={{ fontWeight: 600 }} />
                        </TableCell>
                        <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                            <Button
                              size="small"
                              variant="outlined"
                              color={u.isActive ? 'warning' : 'success'}
                              onClick={() => handleToggleUserActive(u)}
                            >
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                            <IconButton color="error" size="small" onClick={() => confirmDeleteUser(u.id)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </>
            )}

            {/* TAB 1: SHOP OWNER VERIFICATIONS */}
            {currentTab === 1 && (
              <>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Full Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Shop Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Business Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>City</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Verification Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Created At</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shopOwners.length === 0 ? (
                    <TableRow><TableCell colSpan={7} align="center">No shop owners registered yet.</TableCell></TableRow>
                  ) : (
                    shopOwners.map((o) => (
                      <TableRow key={o.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{o.fullName}</TableCell>
                        <TableCell>{o.shopName}</TableCell>
                        <TableCell>{o.businessType}</TableCell>
                        <TableCell>{o.city}</TableCell>
                        <TableCell>
                          {getBusinessStatusChip(o.businessVerificationStatus)}
                          {o.adminComment && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              Comment: {o.adminComment}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<Check />}
                              onClick={() => handleApproveShopOwner(o.id)}
                              disabled={o.businessVerificationStatus === BusinessVerificationStatus.Approved}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<Close />}
                              onClick={() => openRejectShopOwnerDialog(o.id)}
                              disabled={o.businessVerificationStatus === BusinessVerificationStatus.Rejected}
                            >
                              Reject
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </>
            )}

            {/* TAB 2: UPLOADED DOCUMENTS */}
            {currentTab === 2 && (
              <>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Shop Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>File Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Content Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Size (KB)</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Uploaded Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.length === 0 ? (
                    <TableRow><TableCell colSpan={7} align="center">No uploaded documents registered.</TableCell></TableRow>
                  ) : (
                    documents.map((d) => (
                      <TableRow key={d.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{d.shopName}</TableCell>
                        <TableCell>{d.originalFileName}</TableCell>
                        <TableCell>{d.contentType}</TableCell>
                        <TableCell>{(d.fileSize / 1024).toFixed(1)} KB</TableCell>
                        <TableCell>{new Date(d.uploadedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {getDocStatusChip(d.verificationStatus)}
                          {d.adminComment && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              Comment: {d.adminComment}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircle />}
                              onClick={() => handleApproveDocument(d.id)}
                              disabled={d.verificationStatus === DocumentVerificationStatus.Approved}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<Block />}
                              onClick={() => openRejectDocumentDialog(d.id)}
                              disabled={d.verificationStatus === DocumentVerificationStatus.Rejected}
                            >
                              Reject
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </>
            )}

            {/* TAB 3: PLATFORM JOB POSTS */}
            {currentTab === 3 && (
              <>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Shop Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Job Title</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>City</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Created At</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {jobPostings.length === 0 ? (
                    <TableRow><TableCell colSpan={7} align="center">No platform job listings found.</TableCell></TableRow>
                  ) : (
                    jobPostings.map((j) => (
                      <TableRow key={j.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{j.shopName}</TableCell>
                        <TableCell>{j.jobTitle}</TableCell>
                        <TableCell>{j.jobCategory}</TableCell>
                        <TableCell>{j.city}</TableCell>
                        <TableCell>{getJobStatusChip(j.status)}</TableCell>
                        <TableCell>{new Date(j.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => handleApproveJob(j.id)}
                              disabled={j.status === JobPostingStatus.Published}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="warning"
                              onClick={() => handleCloseJob(j.id)}
                              disabled={j.status === JobPostingStatus.Closed}
                            >
                              Close
                            </Button>
                            <IconButton color="error" size="small" onClick={() => handleDeleteJob(j.id)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </>
            )}

          </Table>
        )}
      </TableContainer>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, val) => setPage(val)}
            color="primary"
          />
        </Box>
      )}

      {/* Delete User Confirmation Dialog */}
      <Dialog open={deleteUserOpen} onClose={() => setDeleteUserOpen(false)}>
        <DialogTitle sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
          Delete User Account
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete this user account? All related profiles, listings, and applications will be marked inactive. This action is irreversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteUserOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained" sx={{ fontWeight: 700 }}>
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Comments Input Dialog */}
      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
          Submit Rejection Audit Comment
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please write the reason for rejecting this {rejectType === 'owner' ? 'shop owner profile' : 'business verification document'}. The owner will review this feedback to submit a fix.
          </DialogContentText>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Audit / Rejection Reason"
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

export default UserManager;
