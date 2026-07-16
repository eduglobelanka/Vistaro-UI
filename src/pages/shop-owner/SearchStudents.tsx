import React, { useEffect, useState } from 'react';
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
  Avatar,
} from '@mui/material';
import {
  Search,
  Person,
  School,
  LocationOn,
  AccessTime,
} from '@mui/icons-material';
import shopOwnerService from '../../services/shop-owner.service';
import type { AvailableStudentSearchResultDto } from '../../types/student';
import { EmploymentPreference, VisaType } from '../../types/student';

export const SearchStudents: React.FC = () => {

  // Filter States
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [empPreference, setEmpPreference] = useState<string>('');
  const [visaType, setVisaType] = useState<string>('');
  const [maxHours, setMaxHours] = useState<string>('');

  // Results
  const [students, setStudents] = useState<AvailableStudentSearchResultDto[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 9;

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchCandidates();
  }, [page]);

  const fetchCandidates = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const q = {
        city: city.trim() || null,
        preferredJobCategory: category.trim() || null,
        employmentPreference: empPreference ? Number(empPreference) as EmploymentPreference : null,
        visaType: visaType ? Number(visaType) as VisaType : null,
        maxHoursPerWeek: maxHours ? Number(maxHours) : null,
        pageNumber: page,
        pageSize: pageSize,
        sortBy: 'newest',
      };

      const res = await shopOwnerService.searchStudents(q);
      if (res.succeeded && res.data) {
        setStudents(res.data.items);
        setTotalPages(res.data.totalPages);
      } else {
        setErrorMessage(res.message || 'Failed to search students.');
      }
    } catch {
      setErrorMessage('Failed to connect to search candidate API.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCandidates();
  };

  // Direct messages and initials helper are disabled for candidate search anonymity

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#0f2c59', mb: 1 }}>
          Candidate Search
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Find and recruit talented students available for part-time or flexible work near your business location.
        </Typography>
      </Box>

      {errorMessage && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage(null)}>{errorMessage}</Alert>}

      {/* FILTER SEARCH FORM */}
      <Paper component="form" onSubmit={handleSearchSubmit} sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: '0px 1px 3px rgba(15,23,42,0.05)' }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
            <TextField
              fullWidth
              size="small"
              label="City"
              placeholder="e.g. London"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
            <TextField
              fullWidth
              size="small"
              label="Job Category Preference"
              placeholder="e.g. Barista, Cashier"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Preference</InputLabel>
              <Select
                value={empPreference}
                label="Preference"
                onChange={(e) => setEmpPreference(e.target.value)}
              >
                <MenuItem value="">Any Preference</MenuItem>
                <MenuItem value="1">Part-Time</MenuItem>
                <MenuItem value="2">Full-Time</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Visa Status</InputLabel>
              <Select
                value={visaType}
                label="Visa Status"
                onChange={(e) => setVisaType(e.target.value)}
              >
                <MenuItem value="">Any Visa Status</MenuItem>
                <MenuItem value="1">Student Visa (20hr limit)</MenuItem>
                <MenuItem value="2">Graduate Visa (Flexible)</MenuItem>
                <MenuItem value="3">Other Visa / Citizen</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
            <TextField
              fullWidth
              size="small"
              label="Max Hours Per Week"
              placeholder="e.g. 20"
              value={maxHours}
              onChange={(e) => setMaxHours(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }} sx={{ ml: 'auto' }}>
            <Button
              fullWidth
              type="submit"
              variant="contained"
              startIcon={<Search />}
              sx={{ fontWeight: 700 }}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* RESULTS DISPLAY */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : students.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Person sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 700 }}>
            No candidates matched your search
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try removing filters or expanding your search parameters.
          </Typography>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {students.map((student) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={student.studentProfileId}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0px 4px 12px rgba(0,0,0,0.03)', borderRadius: 2, border: '1px solid #f1f5f9' }}>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Stack direction="row" spacing={2} sx={{ mb: 2.5 }}>
                      <Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48 }}>
                        <Person />
                      </Avatar>
                      <Box sx={{ overflow: 'hidden' }}>
                        <Typography variant="h6" noWrap sx={{ fontWeight: 700, color: '#0f2c59', mb: 0.5 }}>
                          {student.candidateCode}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.85rem' }}>
                          <School sx={{ fontSize: 14 }} /> {student.universityName}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack spacing={1.5} sx={{ mb: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">{student.city}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {student.employmentPreference === 1 ? 'Part-Time' : 'Full-Time'} — Max {student.maxHoursPerWeek} hrs/wk
                        </Typography>
                      </Box>
                    </Stack>

                    {student.preferredJobCategories && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.75, color: 'text.secondary' }}>
                          Job Categories Preference
                        </Typography>
                        <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
                          {student.preferredJobCategories.split(',').map((cat, idx) => (
                            <Chip key={idx} label={cat.trim()} size="small" variant="outlined" color="primary" sx={{ fontSize: '0.75rem', height: 22 }} />
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {student.expectedHourlyRate && (
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'secondary.main', mb: 2 }}>
                        Expected Rate: £{student.expectedHourlyRate.toFixed(2)}/hr
                      </Typography>
                    )}
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Alert severity="info" icon={<Person sx={{ fontSize: 20 }} />} sx={{ fontSize: '0.775rem', py: 0.5, borderRadius: 2 }}>
                      Recruitment is admin-mediated. To contact, invite this candidate via a job posting.
                    </Alert>
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
    </Box>
  );
};

export default SearchStudents;
