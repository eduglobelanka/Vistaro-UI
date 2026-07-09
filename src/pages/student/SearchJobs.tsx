import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Alert,
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
} from '@mui/material';
import {
  Search,
  FilterList,
  WorkOutlined,
  Store,
  LocationOn,
  ArrowForward,
  CheckCircle,
} from '@mui/icons-material';
import jobSearchService from '../../services/job-search.service';
import jobApplicationService from '../../services/job-application.service';
import type {
  JobSearchResultDto,
  JobSearchRequestDto,
} from '../../types/jobs';
import {
  EmploymentType,
  ContractType,
  SalaryType,
} from '../../types/jobs';

export const SearchJobs: React.FC = () => {
  const [items, setItems] = useState<JobSearchResultDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Applied job tracking
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

  // Apply message dialog
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [coverMessage, setCoverMessage] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchAppliedJobs();
    triggerSearch(1);
  }, []);

  const fetchAppliedJobs = async () => {
    try {
      const response = await jobApplicationService.getMyApplications();
      if (response.succeeded && response.data) {
        const ids = new Set(response.data.map((app) => app.jobPostingId));
        setAppliedJobIds(ids);
      }
    } catch {
      // Ignored
    }
  };

  const triggerSearch = async (page: number) => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

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
      pageSize: 10,
      sortBy: sortBy,
    };

    try {
      const response = await jobSearchService.searchJobs(payload);
      if (response.succeeded && response.data) {
        setItems(response.data.items);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.pageNumber);
      }
    } catch {
      setErrorMessage('Failed to search job listings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSearch(1);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    triggerSearch(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        setApplyDialogOpen(false);
        setCoverMessage('');
      } else {
        setErrorMessage(response.message || 'Failed to submit application.');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to apply. Make sure your student profile is created.');
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

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#0f2c59', mb: 1 }}
        >
          Explore Opportunities
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Find and apply to local part-time and full-time vacancies in the UK.
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

      <Grid container spacing={3}>
        {/* LEFT COLUMN: Filters */}
        <Grid size={{ xs: 12, md: 3.5 }}>
          <Paper component="form" onSubmit={handleSearchSubmit} sx={{ p: 3, position: 'sticky', top: 24 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, color: '#0f2c59', mb: 2 }}>
              <FilterList /> Filter Listings
            </Typography>

            <TextField
              fullWidth
              label="Keywords"
              placeholder="e.g. Barista, Retail"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Category"
              placeholder="e.g. Cafe, Office"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              select
              fullWidth
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
              label="Contract Term"
              value={contract}
              onChange={(e) => setContract(e.target.value)}
              sx={{ mb: 2 }}
            >
              <MenuItem value="all">All Contract Terms</MenuItem>
              <MenuItem value={ContractType.Immediate}>Immediate Start</MenuItem>
              <MenuItem value={ContractType.Temporary}>Temporary</MenuItem>
              <MenuItem value={ContractType.Permanent}>Permanent</MenuItem>
            </TextField>

            <Grid container spacing={1.5}>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Postcode"
                  placeholder="e.g. W1A"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={1.5}>
              <Grid size={6}>
                <TextField
                  fullWidth
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

        {/* RIGHT COLUMN: Search Results */}
        <Grid size={{ xs: 12, md: 8.5 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : items.length === 0 ? (
            <Paper sx={{ py: 8, textAlign: 'center' }}>
              <WorkOutlined sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5 }} />
              <Typography variant="h6" color="text.secondary">
                No matching jobs found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try widening your search terms or location postcode.
              </Typography>
            </Paper>
          ) : (
            <Box>
              <Stack spacing={2.5} sx={{ mb: 4 }}>
                {items.map((job) => (
                  <Card
                    key={job.id}
                    onClick={() => handleCardClick(job)}
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      border: '1px solid transparent',
                      '&:hover': {
                        borderColor: 'primary.light',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.06)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, color: '#0f2c59', mb: 0.5 }}>
                            {job.jobTitle}
                          </Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5, color: 'secondary.main' }}>
                            <Store sx={{ fontSize: 16 }} /> {job.shopName}
                          </Typography>
                        </Box>
                        {appliedJobIds.has(job.id) && (
                          <Chip icon={<CheckCircle />} label="Applied" color="success" size="small" sx={{ fontWeight: 600 }} />
                        )}
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{
                        mb: 2.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {job.description}
                      </Typography>

                      <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap', mb: 2 }}>
                        <Chip label={job.jobCategory} size="small" variant="outlined" />
                        <Chip label={getEmpTypeLabel(job.employmentType)} size="small" variant="outlined" />
                        <Chip label={getContractLabel(job.contractType)} size="small" variant="outlined" />
                        <Chip label={`£${Number(job.salaryAmount).toFixed(2)}/${getSalaryUnit(job.salaryType)}`} size="small" color="primary" variant="outlined" sx={{ fontWeight: 600 }} />
                      </Stack>

                      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationOn sx={{ fontSize: 14 }} /> {job.city} ({job.postcode})
                        </Typography>
                        <Button size="small" endIcon={<ArrowForward />}>
                          View details
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>

              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color="primary" />
                </Box>
              )}
            </Box>
          )}
        </Grid>
      </Grid>

      {/* JOB DETAILS DRAWER */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 500 }, p: 4 } }}
      >
        {selectedJob && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
              <Typography variant="h5" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#0f2c59', mb: 1 }}>
                {selectedJob.jobTitle}
              </Typography>

              <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, color: 'secondary.main', mb: 3 }}>
                <Store /> {selectedJob.shopName} ({selectedJob.businessType})
              </Typography>

              <Divider sx={{ mb: 3 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#0f2c59' }}>
                Job Description
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {selectedJob.description}
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Employment Type</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{getEmpTypeLabel(selectedJob.employmentType)}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Contract Type</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{getContractLabel(selectedJob.contractType)}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Salary Rate</Typography>
                  <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
                    £{Number(selectedJob.salaryAmount).toFixed(2)} / {getSalaryUnit(selectedJob.salaryType)}
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Hours per Week</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{selectedJob.hoursPerWeek} hours</Typography>
                </Grid>
                <Grid size={12}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Work Address Location</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {selectedJob.location}, {selectedJob.city} ({selectedJob.postcode})
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Campaign Dates</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Starts {new Date(selectedJob.startDate).toLocaleDateString()} | Closes {new Date(selectedJob.expiryDate).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ pt: 3, borderTop: 1, borderColor: 'divider' }}>
              {appliedJobIds.has(selectedJob.id) ? (
                <Button variant="contained" color="success" fullWidth disabled startIcon={<CheckCircle />}>
                  Already Applied
                </Button>
              ) : (
                <Stack direction="row" spacing={2}>
                  <Button variant="outlined" color="inherit" fullWidth onClick={() => setDrawerOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="contained" color="primary" fullWidth onClick={handleApplyClick}>
                    Apply Now
                  </Button>
                </Stack>
              )}
            </Box>
          </Box>
        )}
      </Drawer>

      {/* APPLY DIALOG WITH COVER MESSAGE */}
      <Dialog open={applyDialogOpen} onClose={() => setApplyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
          Submit Application
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You are applying for <strong>{selectedJob?.jobTitle}</strong> at <strong>{selectedJob?.shopName}</strong>. 
            You can write a short cover letter below to explain why you are a great fit.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Cover Message (Optional)"
            placeholder="Introduce yourself and list your availability..."
            value={coverMessage}
            onChange={(e) => setCoverMessage(e.target.value)}
            sx={{ mt: 1 }}
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
            sx={{ fontWeight: 700, px: 3 }}
          >
            {applying ? 'Submitting...' : 'Submit Application'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SearchJobs;
