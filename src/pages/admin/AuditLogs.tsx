import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  Search,
  Refresh,
  ListAlt,
} from '@mui/icons-material';
import adminService from '../../services/admin.service';
import type { AuditLogResponseDto } from '../../types/admin';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogResponseDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await adminService.getAuditLogs(100); // Fetch latest 100 logs
      if (response.succeeded && response.data) {
        setLogs(response.data);
      } else {
        setErrorMessage(response.message || 'Failed to fetch audit logs.');
      }
    } catch {
      setErrorMessage('Failed to connect to audit logs API.');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('approve') || act.includes('accept') || act.includes('register') || act.includes('create') || act.includes('success')) {
      return 'success';
    }
    if (act.includes('reject') || act.includes('decline') || act.includes('delete') || act.includes('deactivate') || act.includes('fail') || act.includes('revoke')) {
      return 'error';
    }
    if (act.includes('update') || act.includes('modify') || act.includes('edit') || act.includes('sent')) {
      return 'warning';
    }
    return 'primary';
  };

  const filteredLogs = logs.filter((log) => {
    const search = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(search) ||
      log.entity.toLowerCase().includes(search) ||
      log.description.toLowerCase().includes(search) ||
      (log.userId && log.userId.toLowerCase().includes(search))
    );
  });

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#0f2c59', mb: 1 }}>
            Security Audit Trail
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor administrative activities, profile registrations, document verifications, and platform updates.
          </Typography>
        </Box>
        <IconButton onClick={fetchLogs} title="Refresh Logs" sx={{ border: '1px solid #cbd5e1', bgcolor: '#ffffff' }}>
          <Refresh />
        </IconButton>
      </Box>

      {errorMessage && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage(null)}>{errorMessage}</Alert>}

      {/* FILTER CONTROLS */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Filter audit logs by action, user ID, description, entity..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
            }
          }}
          sx={{ bgcolor: '#ffffff' }}
        />
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: '0px 1px 3px rgba(15,23,42,0.05)', borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Entity Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Record ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Operator User ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>IP Address</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <ListAlt sx={{ fontSize: 40, color: 'text.secondary', mb: 1, display: 'block', mx: 'auto' }} />
                    <Typography variant="body2" color="text.secondary">
                      No security audit entries found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.action}
                        color={getActionColor(log.action)}
                        size="small"
                        sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{log.entity}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.775rem', color: 'text.secondary' }}>
                      {log.entityId || '—'}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.775rem', color: 'text.secondary' }}>
                      {log.userId}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>{log.ipAddress || '—'}</TableCell>
                    <TableCell sx={{ fontSize: '0.875rem', color: '#334155' }}>
                      {log.description}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </Box>
  );
};

export default AuditLogs;
