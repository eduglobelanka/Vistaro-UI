import React, { useEffect, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  TextField,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Pagination,
  Stack,
  AppBar,
  Toolbar,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Search,
  WorkOutlined,
  LocationOn,
  AttachMoney,
  AccessTime,
  Login as LoginIcon,
  AppRegistration,
} from '@mui/icons-material';
import useAuth from '../../hooks/useAuth';
import jobSearchService from '../../services/job-search.service';
import type { JobSearchResultDto } from '../../types/jobs';
import { EmploymentType } from '../../types/jobs';

const DUMMY_JOBS: JobSearchResultDto[] = [
  {
    id: 'dummy-1',
    jobTitle: 'Barista & Cafe Assistant',
    description: 'Join our friendly team at Nero Cafe! You will be responsible for preparing high-quality espresso drinks, taking customer orders, managing the cash register, and maintaining Cafe cleanliness. Previous experience is a plus, but full training will be provided. Perfect for students looking for flexible hours.',
    jobCategory: 'Hospitality',
    employmentType: 1, // Part-Time
    contractType: 3, // Permanent
    salaryType: 1, // Hourly
    salaryAmount: 11.50,
    hoursPerWeek: 16,
    location: '24 High Street',
    city: 'London',
    postcode: 'WC1A 1AP',
    startDate: new Date().toISOString(),
    expiryDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    shopName: 'Nero Cafe London',
    businessType: 'Food & Beverage',
    shopCity: 'London',
    shopPostcode: 'WC1A 1AP',
  },
  {
    id: 'dummy-2',
    jobTitle: 'Bookstore Retail Assistant',
    description: 'Waterstones is looking for a passionate book-lover to join our retail floor. Responsibilities include advising customers, stacking bookshelves, processing deliveries, and managing point of sale terminals. Flexible shifts available to accommodate university timetables.',
    jobCategory: 'Retail',
    employmentType: 1, // Part-Time
    contractType: 3, // Permanent
    salaryType: 1, // Hourly
    salaryAmount: 11.20,
    hoursPerWeek: 12,
    location: '12 Gower Street',
    city: 'London',
    postcode: 'WC1E 6EQ',
    startDate: new Date().toISOString(),
    expiryDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    shopName: 'Waterstones Bloomsbury',
    businessType: 'Retail Books',
    shopCity: 'London',
    shopPostcode: 'WC1E 6EQ',
  },
  {
    id: 'dummy-3',
    jobTitle: 'Customer Support Representative',
    description: 'Assist customers with order queries, returns, and product questions. This role is fully local to our Hub and offers flexible evening and weekend shifts. Strong communication skills and empathy are highly valued.',
    jobCategory: 'Customer Service',
    employmentType: 1, // Part-Time
    contractType: 2, // Temporary
    salaryType: 1, // Hourly
    salaryAmount: 12.00,
    hoursPerWeek: 20,
    location: '88 Tech Boulevard',
    city: 'Birmingham',
    postcode: 'B1 1BB',
    startDate: new Date().toISOString(),
    expiryDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    shopName: 'Deliveroo Logistics Hub',
    businessType: 'Technology',
    shopCity: 'Birmingham',
    shopPostcode: 'B1 1BB',
  }
];

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Search & Filter States
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [empType, setEmpType] = useState<string>('all');
  const [jobs, setJobs] = useState<JobSearchResultDto[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 6;

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Authentication prompt dialog
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [selectedJobForApply, setSelectedJobForApply] = useState<JobSearchResultDto | null>(null);

  useEffect(() => {
    fetchPublicJobs();
  }, [page]);

  const fetchPublicJobs = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const q = {
        keyword: keyword.trim() || null,
        city: city.trim() || null,
        employmentType: empType !== 'all' ? Number(empType) as EmploymentType : null,
        pageNumber: page,
        pageSize: pageSize,
        sortBy: 'newest',
      };

      const res = await jobSearchService.searchJobs(q);
      if (res.succeeded && res.data && res.data.items.length > 0) {
        setJobs(res.data.items);
        setTotalPages(res.data.totalPages);
      } else {
        // Fallback to filtered dummy jobs
        let filtered = DUMMY_JOBS;
        if (q.keyword) {
          const k = q.keyword.toLowerCase();
          filtered = filtered.filter(j => j.jobTitle.toLowerCase().includes(k) || j.description.toLowerCase().includes(k));
        }
        if (q.city) {
          const c = q.city.toLowerCase();
          filtered = filtered.filter(j => j.city.toLowerCase().includes(c));
        }
        if (q.employmentType) {
          filtered = filtered.filter(j => j.employmentType === q.employmentType);
        }
        setJobs(filtered);
        setTotalPages(1);
      }
    } catch {
      // Fallback on error
      let filtered = DUMMY_JOBS;
      const kw = keyword.trim();
      const ct = city.trim();
      if (kw) {
        const k = kw.toLowerCase();
        filtered = filtered.filter(j => j.jobTitle.toLowerCase().includes(k) || j.description.toLowerCase().includes(k));
      }
      if (ct) {
        const c = ct.toLowerCase();
        filtered = filtered.filter(j => j.city.toLowerCase().includes(c));
      }
      if (empType !== 'all') {
        const et = Number(empType) as EmploymentType;
        filtered = filtered.filter(j => j.employmentType === et);
      }
      setJobs(filtered);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPublicJobs();
  };

  const handleApplyClick = (job: JobSearchResultDto) => {
    if (!isAuthenticated) {
      setSelectedJobForApply(job);
      setAuthPromptOpen(true);
    } else {
      // If logged in, send them to the protected search/jobs page to apply
      navigate('/jobs/search');
    }
  };

  const handleConfirmLoginRedirect = () => {
    setAuthPromptOpen(false);
    navigate('/login');
  };

  useEffect(() => {
    document.title = 'Vistaro — Local UK Job Matching Platform | vistaro.co.uk';
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc' }}>
      
      {/* PUBLIC HEADER */}
      <AppBar position="static" sx={{ bgcolor: '#ffffff', boxShadow: '0px 1px 3px rgba(15,23,42,0.05)', borderBottom: '1px solid #e2e8f0' }}>
        <Toolbar sx={{ justifyContent: 'space-between', maxWidth: 1200, width: '100%', mx: 'auto', px: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              component="img"
              src="/logo.png"
              alt="Vistaro — vistaro.co.uk"
              sx={{ height: 36, width: 'auto' }}
            />
          </Box>

          <Stack direction="row" spacing={1.5}>
            {isAuthenticated ? (
              <Button
                component={RouterLink}
                to="/dashboard"
                variant="contained"
                color="primary"
                sx={{ fontWeight: 700 }}
              >
                Go to Workspace ({user?.fullName})
              </Button>
            ) : (
              <>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  startIcon={<LoginIcon />}
                  sx={{ fontWeight: 700 }}
                >
                  Log In
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  color="secondary"
                  startIcon={<AppRegistration />}
                  sx={{ fontWeight: 700 }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      {/* HERO BANNER SECTION */}
      <Box sx={{
        background: 'linear-gradient(135deg, #0f2c59 0%, #0d9488 100%)',
        color: '#ffffff',
        py: { xs: 8, md: 10 },
        textAlign: 'center',
      }}>
        <Container maxWidth="md">
          <Typography component="h1" variant="h2" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 900, mb: 2, letterSpacing: -1 }}>
            Vistaro — UK Local Job Matching Platform
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)', mb: 5, fontWeight: 500 }}>
            Connecting university students &amp; verified local employers across the UK on <strong>vistaro.co.uk</strong>.
          </Typography>

          {/* HERO SEARCH BAR */}
          <Paper component="form" onSubmit={handleSearchSubmit} sx={{ p: 2, borderRadius: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, boxShadow: '0px 20px 40px rgba(0,0,0,0.1)' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Job titles, keywords, skills..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <Search color="action" sx={{ mr: 1 }} />
                }
              }}
            />
            <TextField
              placeholder="City (e.g. London)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              sx={{ minWidth: { sm: 200 } }}
            />
            <FormControl sx={{ minWidth: { sm: 180 } }}>
              <InputLabel>Employment</InputLabel>
              <Select
                value={empType}
                label="Employment"
                onChange={(e) => setEmpType(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="1">Part-Time</MenuItem>
                <MenuItem value="2">Full-Time</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" type="submit" size="large" sx={{ fontWeight: 800, px: 4 }}>
              Search
            </Button>
          </Paper>
        </Container>
      </Box>

      {/* JOBS LISTING SECTION */}
      <Container maxWidth="lg" sx={{ py: 8, flexGrow: 1 }}>
        <Typography variant="h4" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#0f2c59', mb: 4 }}>
          Latest Job Postings
        </Typography>

        {errorMessage && <Alert severity="error" sx={{ mb: 4 }}>{errorMessage}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : jobs.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
            <WorkOutlined sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 700 }}>
              No jobs posted yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Check back soon for new work opportunities!
            </Typography>
          </Paper>
        ) : (
          <>
            <Grid container spacing={3}>
              {jobs.map((job) => (
                <Grid size={{ xs: 12, md: 6 }} key={job.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0px 2px 8px rgba(0,0,0,0.02)' }}>
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Stack direction="row" spacing={1.5} sx={{ mb: 2, alignItems: 'flex-start' }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f2c59', mb: 0.5 }}>
                            {job.jobTitle}
                          </Typography>
                          <Typography variant="subtitle2" color="secondary" sx={{ fontWeight: 700 }}>
                            {job.shopName}
                          </Typography>
                        </Box>
                        <Chip
                          label={job.employmentType === 1 ? 'Part-Time' : 'Full-Time'}
                          color="primary"
                          size="small"
                          sx={{ fontWeight: 700 }}
                        />
                      </Stack>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {job.description}
                      </Typography>

                      <Grid container spacing={1.5}>
                        <Grid size={6} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">{job.city}</Typography>
                        </Grid>
                        <Grid size={6} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <AttachMoney sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">£{job.salaryAmount.toFixed(2)}/hr</Typography>
                        </Grid>
                        <Grid size={12} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">{job.hoursPerWeek} hours per week</Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                    <Box sx={{ p: 3, pt: 0 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="primary"
                        onClick={() => handleApplyClick(job)}
                        sx={{ fontWeight: 700 }}
                      >
                        Apply for Job
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, val) => setPage(val)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Container>

      {/* SEO INFORMATION & KEYWORD SECTION FOR SEARCH ENGINES */}
      <Box sx={{ py: 6, bgcolor: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h5" component="h2" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#0f2c59', mb: 2 }}>
                About Vistaro (vistaro.co.uk)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 2 }}>
                <strong>Vistaro</strong> (<a href="https://vistaro.co.uk" style={{ color: '#0d9488', textDecoration: 'none', fontWeight: 600 }}>vistaro.co.uk</a>) is the premier UK job-matching platform designed specifically to connect university students with local verified employers for part-time, flexible, and seasonal employment.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                All recruitment activity passes through Vistaro Admin moderation to ensure candidate privacy, fair wages, and genuine job postings across London, Manchester, Birmingham, Leeds, Edinburgh, and all UK university towns.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h5" component="h2" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#0f2c59', mb: 2 }}>
                UK Student Employment &amp; Hiring
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 2 }}>
                Whether you are a university student searching for part-time barista, retail, or customer service shifts, or a local shop owner looking to hire reliable student talent, <strong>Vistaro</strong> provides an end-to-end recruitment workspace.
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 1, flexWrap: 'wrap' }}>
                <Chip label="Part-Time Student Jobs UK" size="small" variant="outlined" />
                <Chip label="London Student Recruitment" size="small" variant="outlined" />
                <Chip label="Verified UK Shop Owners" size="small" variant="outlined" />
                <Chip label="vistaro.co.uk" size="small" color="secondary" />
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* FOOTER */}
      <Box sx={{ py: 4, bgcolor: '#0f2c59', color: '#ffffff', textAlign: 'center' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            © {new Date().getFullYear()} <strong>Vistaro</strong> (<a href="https://vistaro.co.uk" style={{ color: '#3db5a0', textDecoration: 'none' }}>vistaro.co.uk</a>). See Opportunity. Build Futures. All rights reserved.
          </Typography>
        </Container>
      </Box>

      {/* AUTH PROMPT DIALOG */}
      <Dialog open={authPromptOpen} onClose={() => setAuthPromptOpen(false)}>
        <DialogTitle sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
          Login Required to Apply
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            You need to be logged in as a candidate to apply for <strong>{selectedJobForApply?.jobTitle}</strong>. Creating an account takes less than a minute!
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAuthPromptOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmLoginRedirect}
            variant="contained"
            color="primary"
            sx={{ fontWeight: 700 }}
          >
            Log In or Register
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Landing;
