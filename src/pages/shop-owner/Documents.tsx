import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Verified,
  Warning,
  ErrorOutlined,
  AttachFile,
  Info,
} from '@mui/icons-material';
import shopOwnerService from '../../services/shop-owner.service';
import type {
  BusinessDocumentResponseDto,
} from '../../types/shop-owner';
import {
  DocumentVerificationStatus,
} from '../../types/shop-owner';

export const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<BusinessDocumentResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await shopOwnerService.getDocuments();
      if (response.succeeded && response.data) {
        setDocuments(response.data);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setErrorMessage('Please complete your Business Profile details first before uploading verification files.');
      } else {
        setErrorMessage('Failed to load business documents.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 5MB limit.');
      return;
    }

    setUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await shopOwnerService.uploadDocument(file);
      if (response.succeeded && response.data) {
        setSuccessMessage('Document uploaded successfully.');
        setDocuments((prev) => [response.data!, ...prev]);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setErrorMessage(response.message || 'Failed to upload document.');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Failed to upload document. Ensure profile is created first.';
      setErrorMessage(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const openDeleteDialog = (id: string) => {
    setSelectedDocId(id);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setSelectedDocId(null);
    setDeleteDialogOpen(false);
  };

  const handleDeleteDocument = async () => {
    if (!selectedDocId) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const response = await shopOwnerService.deleteDocument(selectedDocId);
      if (response.succeeded) {
        setSuccessMessage('Document deleted successfully.');
        setDocuments((prev) => prev.filter((doc) => doc.id !== selectedDocId));
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to delete the document.';
      setErrorMessage(errorMsg);
    } finally {
      closeDeleteDialog();
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const getStatusChip = (status: DocumentVerificationStatus) => {
    switch (status) {
      case DocumentVerificationStatus.Approved:
        return (
          <Chip
            icon={<Verified />}
            label="Approved"
            color="success"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        );
      case DocumentVerificationStatus.Rejected:
        return (
          <Chip
            icon={<ErrorOutlined />}
            label="Rejected"
            color="error"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        );
      case DocumentVerificationStatus.Pending:
      default:
        return (
          <Chip
            icon={<Warning />}
            label="Pending Review"
            color="warning"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        );
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', width: '100%' }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#0f2c59', mb: 1 }}
        >
          Business Verification Documents
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Upload documents proving your business registration (e.g. business registration utility bills, premises license).
          Approved documents are required to post jobs.
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
        {/* Upload Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 250,
              height: '100%',
              border: '2px dashed',
              borderColor: 'rgba(13, 148, 136, 0.4)',
              cursor: 'pointer',
              backgroundColor: 'rgba(13, 148, 136, 0.02)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: 'secondary.main',
                backgroundColor: 'rgba(13, 148, 136, 0.05)',
              },
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            {uploading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CircularProgress color="secondary" size={40} sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Uploading files...
                </Typography>
              </Box>
            ) : (
              <>
                <CloudUpload color="secondary" sx={{ fontSize: 56, mb: 2 }} />
                <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, mb: 1 }}>
                  Upload Document
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Supports PDF, JPG, PNG up to 5MB. Click to browse.
                </Typography>
              </>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 4, minHeight: 250, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, color: '#0f2c59', mb: 1.5 }}>
              <Info color="primary" /> Verification Policies
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              To maintain the integrity of our platform, shop owners must provide valid identification and business credentials.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ pl: 2, borderLeft: '3px solid #0d9488' }}>
              • Document reviews typically take <strong>24 to 48 hours</strong>.<br />
              • Once verified, your status changes to <strong>Approved</strong>, letting you immediately publish job listings.<br />
              • Rejection reasons will be listed in the table comments.
            </Typography>
          </Paper>
        </Grid>

        {/* Documents List Card */}
        <Grid size={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, mb: 2, color: '#0f2c59' }}>
              Uploaded Documents List ({documents.length})
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress color="primary" />
              </Box>
            ) : documents.length === 0 ? (
              <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <AttachFile sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  No verification documents uploaded yet.
                </Typography>
              </Box>
            ) : (
              <TableContainer sx={{ overflowX: 'auto', width: '100%' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>File Name</TableCell>
                      <TableCell>Size</TableCell>
                      <TableCell>Uploaded At</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Admin Remarks / Comments</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{doc.originalFileName}</TableCell>
                        <TableCell>{formatBytes(doc.fileSize)}</TableCell>
                        <TableCell>{new Date(doc.uploadedAt).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusChip(doc.verificationStatus)}</TableCell>
                        <TableCell>
                          {doc.verificationStatus === DocumentVerificationStatus.Rejected ? (
                            <Typography variant="body2" color="error.main" sx={{ fontWeight: 500 }}>
                              {doc.adminComment || 'No comment provided.'}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              {doc.adminComment || '-'}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="error"
                            onClick={() => openDeleteDialog(doc.id)}
                            disabled={doc.verificationStatus === DocumentVerificationStatus.Approved}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
          Delete Document
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this business verification document? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteDocument} color="error" autoFocus sx={{ fontWeight: 700 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Documents;
