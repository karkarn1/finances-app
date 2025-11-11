/**
 * Financial Institutions Page - Manage financial institutions
 */

import { FC, useEffect } from 'react';
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
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector, useDialog } from '@/hooks';
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
import { FinancialInstitutionFormDialog } from './components';
import { logger } from '@/utils/logger';

const FinancialInstitutions: FC = () => {
  const dispatch = useAppDispatch();
  const institutions = useAppSelector(selectAllInstitutions);
  const loading = useAppSelector(selectInstitutionsLoading);
  const error = useAppSelector(selectInstitutionsError);

  // Dialog management for add/edit institution
  const institutionDialog = useDialog<FinancialInstitutionCreate>({ name: '', url: '' });

  // Dialog management for delete confirmation
  const deleteDialog = useDialog<FinancialInstitution | null>(null);

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
      institutionDialog.openDialog(
        {
          name: institution.name,
          url: institution.url || '',
        },
        institution.id
      );
    } else {
      institutionDialog.openDialog();
    }
  };

  const handleSubmit = async (data: FinancialInstitutionCreate) => {
    const submitData: FinancialInstitutionCreate = {
      name: data.name.trim(),
      ...(data.url?.trim() && { url: data.url.trim() }),
    };

    try {
      if (institutionDialog.isEditing && institutionDialog.editingId) {
        await dispatch(
          updateFinancialInstitution({
            id: institutionDialog.editingId,
            data: submitData,
          })
        ).unwrap();
      } else {
        await dispatch(createFinancialInstitution(submitData)).unwrap();
      }
      institutionDialog.closeDialog();
    } catch (err) {
      // Error handled by Redux state
      logger.error('Failed to save institution:', err);
    }
  };

  const handleOpenDeleteDialog = (institution: FinancialInstitution) => {
    deleteDialog.openDialog(institution);
  };

  const handleDelete = async () => {
    if (!deleteDialog.data) return;

    try {
      await dispatch(deleteFinancialInstitution(deleteDialog.data.id)).unwrap();
      deleteDialog.closeDialog();
    } catch (err) {
      // Error handled by Redux state
      logger.error('Failed to delete institution:', err);
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
      <FinancialInstitutionFormDialog
        open={institutionDialog.open}
        onClose={institutionDialog.closeDialog}
        onSubmit={(data) => void handleSubmit(data)}
        initialData={institutionDialog.data}
        isEditing={institutionDialog.isEditing}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={deleteDialog.closeDialog}>
        <DialogTitle>Delete Institution?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &quot;{deleteDialog.data?.name}&quot;? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={deleteDialog.closeDialog}>Cancel</Button>
          <Button
            onClick={() => void handleDelete()}
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
