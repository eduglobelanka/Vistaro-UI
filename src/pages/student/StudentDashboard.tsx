import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Alert,
  AlertTitle,
  CircularProgress,
  TextField,
  MenuItem,
  Card,
  CardContent,
  Chip,
  Drawer,
  Divider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  CardActionArea,
} from '@mui/material';
import {
  AccountBox,
  Assignment,
  ContactMail,
  Search,
  FilterList,
  WorkOutlined,
  Store,
  LocationOn,
  CheckCircle,
  AttachMoney,
  AccessTime,
} from '@mui/icons-material';
import studentService from '../../services/student.service';
import jobApplicationService from '../../services/job-application.service';
import messagingService from '../../services/messaging.service';
import jobSearchService from '../../services/job-search.service';
import useAuth from '../../hooks/useAuth';
import type { JobSearchResultDto, JobSearchRequestDto } from '../../types/jobs';
import { EmploymentType, ContractType, SalaryType } from '../../types/jobs';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();

  // Core loading states
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  // Statistics counters
  const [appCount, setAppCount] = useState(0);
  const [invitationCount, setInvitationCount] = useState(0);

  // Job Search Feed states
  const [jobs, setJobs] = useState<JobSearchResultDto[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());

  // Search filter states
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [empType, setEmpType] = useState<string>('all');
  const [contract, setContract] = useState<string>('all');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');
  const [minSalary, setMinSalary] = useState<string>('');
  const [maxSalary, setMaxSalary] = useState<string>('');
  const [sortBy, setSortBy] = useState('newest');

  // Selected job details drawer
  const [selectedJob, setSelectedJob] = useState<JobSearchResultDto | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Apply dialog
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [coverMessage, setCoverMessage] = useState('');
  const [applying, setApplying] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchProfileAndStats();
  }, []);

  const fetchProfileAndStats = async () => {
    setLoading(true);
    try {
      const response = await studentService.getProfile();
      if (response.succeeded && response.data) {
        setHasProfile(true);
        
        // Load statistics
        try {
          const appsRes = await jobApplicationService.getMyApplications();
          if (appsRes.succeeded && appsRes.data) {
            setAppCount(appsRes.data.length);
            setAppliedJobIds(new Set(appsRes.data.map((app) => app.jobPostingId)));
          }
        } catch {}

        try {
          const inboxRes = await messagingService.getInbox();
          if (inboxRes.succeeded && inboxRes.data) {
            const count = inboxRes.data.filter(
              (msg) => msg.messageType === 2 && msg.invitationStatus === 2
            ).length;
            setInvitationCount(count);
          }
        } catch {}

        // Load initial jobs
        await triggerSearch(1);
      } else {
        setHasProfile(false);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setHasProfile(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const triggerSearch = async (page: number) => {
    setLoadingJobs(true);
    setErrorMessage(null);

    const payload: JobSearchRequestDto = {
      keyword: keyword.trim() || null,
      jobCategory: category.trim() || null,
      employmentType: empType === 'all' ? null : Number(empType) as EmploymentType,
      contractType: contract === 'all' ? null : Number(contract) as ContractType,
      city: city.trim() || null,
      postcode: postcode.trim() || null,
      minSalary: minSalary ? Number(minSalary) : null,
      maxSalary: maxSalary ? Number(maxSalary) : null,
      pageNumber: page,
      pageSize: 6,
      sortBy: sortBy,
    };

    try {
      const response = await jobSearchService.searchJobs(payload);
      if (response.succeeded && response.data) {
        setJobs(response.data.items);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.pageNumber);
      }
    } catch {
      setErrorMessage('Failed to search job listings.');
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSearch(1);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    triggerSearch(value);
  };

  const handleCardClick = (job: JobSearchResultDto) => {
    setSelectedJob(job);
    setDrawerOpen(true);
  };

  const handleApplyClick = () => {
    setApplyDialogOpen(true);
  };

  const submitApplication = async () => {
    if (!selectedJob) return;
    setApplying(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await jobApplicationService.applyToJob(selectedJob.id, {
        coverMessage: coverMessage.trim() || null,
      });

      if (response.succeeded) {
        setSuccessMessage('Your job application was submitted successfully!');
        setAppliedJobIds((prev) => {
          const next = new Set(prev);
          next.add(selectedJob.id);
          return next;
        });
        setAppCount((prev) => prev + 1);
        setApplyDialogOpen(false);
        setCoverMessage('');
      } else {
        setErrorMessage(response.message || 'Failed to submit application.');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to apply.');
    } finally {
      setApplying(false);
    }
  };

  const getEmpTypeLabel = (type: EmploymentType) => {
    if (type === EmploymentType.PartTime) return 'Part-Time';
    if (type === EmploymentType.FullTime) return 'Full-Time';
    return 'Full & Part Time';
  };

  const getContractLabel = (type: ContractType) => {
    if (type === ContractType.Immediate) return 'Immediate Start';
    if (type === ContractType.Temporary) return 'Temporary';
    return 'Permanent';
  };

  const getSalaryUnit = (type: SalaryType) => {
    if (type === SalaryType.Hourly) return 'hr';
    if (type === SalaryType.Daily) return 'day';
    if (type === SalaryType.Weekly) return 'wk';
    return 'mo';
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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#0f2c59', mb: 1 }}>
            Student Workspace
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {user?.fullName || 'Job Seeker'}. Discover flexible opportunities near your city.
          </Typography>
        </Box>
      </Box>

      {/* Profile missing Call to Action */}
      {!hasProfile && (
        <Alert
          severity="warning"
          icon={<AccountBox fontSize="large" />}
          action={
            <Button
              component={RouterLink}
              to="/student/profile"
              color="inherit"
              size="small"
              variant="outlined"
              sx={{ fontWeight: 700 }}
            >
              Create Profile
            </Button>
          }
          sx={{ mb: 4, borderRadius: 3, p: 3, '& .MuiAlert-message': { width: '100%' } }}
        >
          <AlertTitle sx={{ fontWeight: 700, fontSize: '1.1rem' }}>Your Candidate Profile is Empty!</AlertTitle>
          You must create your candidate profile detailing your university, visa type, and job preferences before you can search or apply for UK job postings.
        </Alert>
      )}

      {hasProfile && (
        <>
          {/* STATS STRIP */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper
                component={RouterLink}
                to="/job-applications/my"
                sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', border: '1px solid #f1f5f9', '&:hover': { borderColor: 'primary.main', boxShadow: '0px 4px 12px rgba(15,23,42,0.05)' }, transition: 'all 0.2s' }}
              >
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>My Applications</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#0f2c59' }}>{appCount}</Typography>
                </Box>
                <Assignment sx={{ fontSize: 32, color: 'primary.main', opacity: 0.8 }} />
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper
                component={RouterLink}
                to="/messages"
                sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', border: '1px solid #f1f5f9', '&:hover': { borderColor: 'secondary.main', boxShadow: '0px 4px 12px rgba(15,23,42,0.05)' }, transition: 'all 0.2s' }}
              >
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>Job Invitations</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#0f2c59' }}>{invitationCount}</Typography>
                </Box>
                <ContactMail sx={{ fontSize: 32, color: 'secondary.main', opacity: 0.8 }} />
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper
                component={RouterLink}
                to="/student/profile"
                sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', border: '1px solid #f1f5f9', '&:hover': { borderColor: 'warning.main', boxShadow: '0px 4px 12px rgba(15,23,42,0.05)' }, transition: 'all 0.2s' }}
              >
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>Profile Verification</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'warning.main' }}>100%</Typography>
                </Box>
                <AccountBox sx={{ fontSize: 32, color: 'warning.main', opacity: 0.8 }} />
              </Paper>
            </Grid>
          </Grid>

          {successMessage && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>{successMessage}</Alert>}
          {errorMessage && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage(null)}>{errorMessage}</Alert>}

          {/* MAIN SEARCH & FEED AREA */}
          <Grid container spacing={3}>
            {/* Left Filter Column */}
            <Grid size={{ xs: 12, md: 3.5 }}>
              <Paper component="form" onSubmit={handleSearchSubmit} sx={{ p: 3, position: 'sticky', top: 24, border: '1px solid #e2e8f0', borderRadius: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1, color: '#0f2c59', mb: 2 }}>
                  <FilterList /> Filter Listings
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  label="Keywords"
                  placeholder="e.g. Barista, Retail"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  size="small"
                  label="Category"
                  placeholder="e.g. Cafe, Office"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Employment Type"
                  value={empType}
                  onChange={(e) => setEmpType(e.target.value)}
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="all">All Employment Types</MenuItem>
                  <MenuItem value={EmploymentType.PartTime}>Part-Time</MenuItem>
                  <MenuItem value={EmploymentType.FullTime}>Full-Time</MenuItem>
                  <MenuItem value={EmploymentType.Both}>Both (Flexible)</MenuItem>
                </TextField>

                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Contract Type"
                  value={contract}
                  onChange={(e) => setContract(e.target.value)}
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="all">All Contract Types</MenuItem>
                  <MenuItem value={ContractType.Immediate}>Immediate Start</MenuItem>
                  <MenuItem value={ContractType.Temporary}>Temporary</MenuItem>
                  <MenuItem value={ContractType.Permanent}>Permanent</MenuItem>
                </TextField>

                <TextField
                  fullWidth
                  size="small"
                  label="City"
                  placeholder="e.g. London"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  size="small"
                  label="Postcode"
                  placeholder="e.g. WC1A"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <Grid container spacing={1}>
                  <Grid size={6}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Min Salary (£)"
                      value={minSalary}
                      onChange={(e) => setMinSalary(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid size={6}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Max Salary (£)"
                      value={maxSalary}
                      onChange={(e) => setMaxSalary(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                </Grid>

                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Sort By"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  sx={{ mb: 3 }}
                >
                  <MenuItem value="newest">Newest First</MenuItem>
                  <MenuItem value="salary_desc">Salary (High to Low)</MenuItem>
                  <MenuItem value="salary_asc">Salary (Low to High)</MenuItem>
                  <MenuItem value="hours_desc">Hours (High to Low)</MenuItem>
                  <MenuItem value="hours_asc">Hours (Low to High)</MenuItem>
                </TextField>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<Search />}
                  sx={{ fontWeight: 700 }}
                >
                  Search Jobs
                </Button>
              </Paper>
            </Grid>

            {/* Right Feed Column */}
            <Grid size={{ xs: 12, md: 8.5 }}>
              {loadingJobs ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress color="primary" />
                </Box>
              ) : jobs.length === 0 ? (
                <Paper sx={{ py: 8, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <WorkOutlined sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 700 }}>
                    No matching jobs found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Adjust your filters to see more listings.
                  </Typography>
                </Paper>
              ) : (
                <>
                  <Grid container spacing={3}>
                    {jobs.map((job) => {
                      const isApplied = appliedJobIds.has(job.id);
                      return (
                        <Grid size={{ xs: 12, sm: 6 }} key={job.id}>
                          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #f1f5f9', boxShadow: '0px 2px 8px rgba(0,0,0,0.01)', borderRadius: 2 }}>
                            <CardActionArea onClick={() => handleCardClick(job)} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                              <CardContent sx={{ p: 3, flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f2c59', lineHeight: 1.3 }}>
                                    {job.jobTitle}
                                  </Typography>
                                </Box>
                                <Typography variant="subtitle2" color="secondary" sx={{ fontWeight: 700, mb: 2 }}>
                                  {job.shopName}
                                </Typography>

                                <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
                                  <Chip label={getEmpTypeLabel(job.employmentType)} size="small" variant="outlined" sx={{ fontWeight: 600, height: 22 }} />
                                  <Chip label={getContractLabel(job.contractType)} size="small" variant="outlined" sx={{ fontWeight: 600, height: 22 }} />
                                </Stack>

                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                  {job.description}
                                </Typography>

                                <Stack spacing={1} sx={{ mt: 'auto' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary">{job.city} ({job.postcode})</Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AttachMoney sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary">
                                      £{job.salaryAmount.toFixed(2)} / {getSalaryUnit(job.salaryType)}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary">{job.hoursPerWeek} hrs/week</Typography>
                                  </Box>
                                </Stack>
                              </CardContent>
                            </CardActionArea>
                            <Box sx={{ p: 2, pt: 0 }}>
                              <Button
                                fullWidth
                                variant={isApplied ? 'outlined' : 'contained'}
                                color={isApplied ? 'success' : 'primary'}
                                disabled={isApplied}
                                startIcon={isApplied ? <CheckCircle /> : undefined}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedJob(job);
                                  handleApplyClick();
                                }}
                                sx={{ fontWeight: 700 }}
                              >
                                {isApplied ? 'Applied' : 'Apply Now'}
                              </Button>
                            </Box>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                      <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                      />
                    </Box>
                  )}
                </>
              )}
            </Grid>
          </Grid>
        </>
      )}

      {/* JOB DETAILS DRAWER */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} slotProps={{ paper: { sx: { width: { xs: '100%', sm: 480 }, p: 4 } } }}>
        {selectedJob && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f2c59', mb: 1 }}>
                {selectedJob.jobTitle}
              </Typography>
              <Typography variant="subtitle1" color="secondary" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Store /> {selectedJob.shopName} ({selectedJob.businessType})
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary', mb: 1 }}>
                Job Description
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary', mb: 4, lineHeight: 1.6 }}>
                {selectedJob.description}
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary', mb: 2 }}>
                Posting Overview
              </Typography>
              <Grid container spacing={2.5} sx={{ mb: 4 }}>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Location</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedJob.location}</Typography>
                  <Typography variant="body2" color="text.secondary">{selectedJob.city}, {selectedJob.postcode}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Rate of Pay</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>£{selectedJob.salaryAmount.toFixed(2)} / {getSalaryUnit(selectedJob.salaryType)}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Employment Type</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{getEmpTypeLabel(selectedJob.employmentType)}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Weekly Commitment</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedJob.hoursPerWeek} hours</Typography>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ pt: 2 }}>
              {appliedJobIds.has(selectedJob.id) ? (
                <Button fullWidth variant="outlined" color="success" disabled startIcon={<CheckCircle />} sx={{ fontWeight: 700 }}>
                  Already Applied
                </Button>
              ) : (
                <Button fullWidth variant="contained" color="primary" onClick={handleApplyClick} sx={{ fontWeight: 700 }}>
                  Apply For This Role
                </Button>
              )}
            </Box>
          </Box>
        )}
      </Drawer>

      {/* APPLY CONFIRMATION DIALOG */}
      <Dialog open={applyDialogOpen} onClose={() => setApplyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
          Submit Job Application
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            You are applying for the role of <strong>{selectedJob?.jobTitle}</strong> at <strong>{selectedJob?.shopName}</strong>. 
            Introduce yourself to the employer with a brief cover message outlining your availability and fit.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Cover Message / Note to Employer (Optional)"
            placeholder="Introduce yourself, mention key retail or barista skills..."
            value={coverMessage}
            onChange={(e) => setCoverMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setApplyDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={submitApplication}
            variant="contained"
            color="primary"
            disabled={applying}
            sx={{ fontWeight: 700 }}
          >
            {applying ? 'Submitting...' : 'Confirm & Apply'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentDashboard;
