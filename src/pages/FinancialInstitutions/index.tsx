/**
 * Financial Institutions Page - Manage financial institutions
 */

import { FC, useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  fetchFinancialInstitutions,
  createFinancialInstitution,
  updateFinancialInstitution,
  deleteFinancialInstitution,
  selectAllInstitutions,
  selectInstitutionsLoading,
  selectInstitutionsError,
  clearError,
} from '@/store/slices/financialInstitutionsSlice';
import type { FinancialInstitution, FinancialInstitutionCreate } from '@/types';

const FinancialInstitutions: FC = () => {
  const dispatch = useAppDispatch();
  const institutions = useAppSelector(selectAllInstitutions);
  const loading = useAppSelector(selectInstitutionsLoading);
  const error = useAppSelector(selectInstitutionsError);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<FinancialInstitution | null>(null);
  const [deletingInstitution, setDeletingInstitution] = useState<FinancialInstitution | null>(
    null
  );
  const [formData, setFormData] = useState<FinancialInstitutionCreate>({
    name: '',
    url: '',
  });
  const [formErrors, setFormErrors] = useState<{ name?: string; url?: string }>({});

  useEffect(() => {
    void dispatch(fetchFinancialInstitutions());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [error, dispatch]);

  const handleOpenDialog = (institution?: FinancialInstitution) => {
    if (institution) {
      setEditingInstitution(institution);
      setFormData({
        name: institution.name,
        url: institution.url || '',
      });
    } else {
      setEditingInstitution(null);
      setFormData({ name: '', url: '' });
    }
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingInstitution(null);
    setFormData({ name: '', url: '' });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: { name?: string; url?: string } = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
      setFormErrors(errors);
      return false;
    }

    if (formData.url && formData.url.trim()) {
      try {
        new URL(formData.url);
      } catch {
        errors.url = 'Invalid URL format';
        setFormErrors(errors);
        return false;
      }
    }

    setFormErrors(errors);
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const submitData: FinancialInstitutionCreate = {
      name: formData.name.trim(),
      ...(formData.url?.trim() && { url: formData.url.trim() }),
    };

    try {
      if (editingInstitution) {
        await dispatch(
          updateFinancialInstitution({
            id: editingInstitution.id,
            data: submitData,
          })
        ).unwrap();
      } else {
        await dispatch(createFinancialInstitution(submitData)).unwrap();
      }
      handleCloseDialog();
    } catch (err) {
      // Error handled by Redux state
      console.error('Failed to save institution:', err);
    }
  };

  const handleOpenDeleteDialog = (institution: FinancialInstitution) => {
    setDeletingInstitution(institution);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeletingInstitution(null);
  };

  const handleDelete = async () => {
    if (!deletingInstitution) return;

    try {
      await dispatch(deleteFinancialInstitution(deletingInstitution.id)).unwrap();
      handleCloseDeleteDialog();
    } catch (err) {
      // Error handled by Redux state
      console.error('Failed to delete institution:', err);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom data-testid="page-title">
            Financial Institutions
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your financial institutions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          data-testid="add-institution-button"
        >
          Add Institution
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} data-testid="error-alert">
          {error}
        </Alert>
      )}

      {loading && institutions.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : institutions.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No financial institutions yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add your first financial institution to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Institution
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table data-testid="institutions-table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Website</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {institutions.map((institution) => (
                <TableRow
                  key={institution.id}
                  data-testid={`institution-row-${institution.id}`}
                >
                  <TableCell>
                    <Typography variant="body1">{institution.name}</Typography>
                  </TableCell>
                  <TableCell>
                    {institution.url ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinkIcon fontSize="small" color="action" />
                        <a
                          href={institution.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          {institution.url}
                        </a>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(institution)}
                        data-testid={`edit-button-${institution.id}`}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDeleteDialog(institution)}
                        data-testid={`delete-button-${institution.id}`}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingInstitution ? 'Edit Institution' : 'Add Institution'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Institution Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={!!formErrors.name}
              helperText={formErrors.name}
              fullWidth
              required
              autoFocus
              data-testid="institution-name-input"
            />
            <TextField
              label="Website (optional)"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              error={!!formErrors.url}
              helperText={formErrors.url || 'e.g., https://www.example.com'}
              fullWidth
              data-testid="institution-url-input"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" data-testid="submit-institution">
            {editingInstitution ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Institution?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &quot;{deletingInstitution?.name}&quot;? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            data-testid="confirm-delete"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FinancialInstitutions;
