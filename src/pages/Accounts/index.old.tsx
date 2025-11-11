/**
 * Accounts Page - Manage accounts
 */

import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector, useDialog, useFormSubmit } from '@/hooks';
import { errorService } from '@/services/errorService';
import {
  fetchAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  selectAllAccounts,
  selectAssetAccounts,
  selectLiabilityAccounts,
  selectAccountsLoading,
} from '@/store/slices/accountsSlice';
import {
  fetchFinancialInstitutions,
  selectAllInstitutions,
} from '@/store/slices/financialInstitutionsSlice';
import type { AccountDetailed, AccountCreate } from '@/types';
import { formatCurrency, getAccountTypeLabel } from '@/utils';
import { AccountFormDialog } from './components';
import { logger } from '@/utils/logger';

const Accounts: FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const accounts = useAppSelector(selectAllAccounts);
  const assetAccounts = useAppSelector(selectAssetAccounts);
  const liabilityAccounts = useAppSelector(selectLiabilityAccounts);
  const loading = useAppSelector(selectAccountsLoading);
  const institutions = useAppSelector(selectAllInstitutions);

  // Initial form data
  const initialAccountData: AccountCreate = {
    name: '',
    account_type: 'checking',
    is_investment_account: false,
  };

  // Dialog management for add/edit account
  const accountDialog = useDialog<AccountCreate>(initialAccountData);

  // Dialog management for delete confirmation
  const deleteDialog = useDialog<AccountDetailed | null>(null);

  // Form submission with loading/error handling
  const { handleSubmit: submitAccount, isSubmitting } = useFormSubmit(
    async (data: AccountCreate) => {
      const submitData: AccountCreate = {
        name: data.name.trim(),
        account_type: data.account_type,
        ...(data.financial_institution_id && {
          financial_institution_id: data.financial_institution_id,
        }),
        ...(data.is_investment_account !== undefined && {
          is_investment_account: data.is_investment_account,
        }),
        ...(data.interest_rate !== undefined && { interest_rate: data.interest_rate }),
        ...(data.currency_code && { currency_code: data.currency_code }),
      };

      if (accountDialog.isEditing && accountDialog.editingId) {
        await dispatch(
          updateAccount({
            id: accountDialog.editingId,
            data: submitData,
          })
        ).unwrap();
        errorService.showSuccess('Account updated successfully');
      } else {
        await dispatch(createAccount(submitData)).unwrap();
        errorService.showSuccess('Account created successfully');
      }
    },
    () => {
      accountDialog.closeDialog();
      void dispatch(fetchAccounts());
    }
  );

  useEffect(() => {
    void dispatch(fetchAccounts());
    void dispatch(fetchFinancialInstitutions());
  }, [dispatch]);

  const handleOpenDialog = (account?: AccountDetailed) => {
    if (account) {
      // Open dialog with existing account data for editing
      accountDialog.openDialog(
        {
          name: account.name,
          account_type: account.account_type,
          ...(account.financial_institution_id && {
            financial_institution_id: account.financial_institution_id,
          }),
          is_investment_account: account.is_investment_account,
          ...(account.interest_rate !== undefined && { interest_rate: account.interest_rate }),
          ...(account.currency_code && { currency_code: account.currency_code }),
        },
        account.id
      );
    } else {
      // Open dialog for creating new account
      accountDialog.openDialog();
    }
  };

  const handleOpenDeleteDialog = (account: AccountDetailed) => {
    deleteDialog.openDialog(account);
  };

  const handleDelete = () => {
    if (!deleteDialog.data) return;

    const accountToDelete = deleteDialog.data;

    void (async () => {
      try {
        await dispatch(deleteAccount(accountToDelete.id)).unwrap();
        errorService.showSuccess('Account deleted successfully');
        deleteDialog.closeDialog();
      } catch (err) {
        errorService.showError(err, 'Delete account');
        logger.error('Failed to delete account:', err);
      }
    })();
  };

  const handleAccountClick = (accountId: string) => {
    navigate(`/accounts/${accountId}`);
  };

  const renderAccountCard = (account: AccountDetailed) => (
    <Grid item xs={12} sm={6} md={4} key={account.id}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          '&:hover': { boxShadow: 6 },
        }}
        data-testid={`account-card-${account.id}`}
      >
        <CardContent
          sx={{ flexGrow: 1 }}
          onClick={() => handleAccountClick(account.id)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {account.is_investment_account ? (
              <TrendingUpIcon color="primary" />
            ) : (
              <AccountBalanceIcon color="primary" />
            )}
            <Typography variant="h6" sx={{ ml: 1 }}>
              {account.name}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {getAccountTypeLabel(account.account_type)}
          </Typography>
          {account.financial_institution && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {account.financial_institution.name}
            </Typography>
          )}
          {account.current_balance !== undefined && (
            <Typography variant="h5" sx={{ mt: 2 }}>
              {formatCurrency(account.current_balance, account.currency?.code)}
              {account.currency && (
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 1 }}
                >
                  {account.currency.code}
                </Typography>
              )}
            </Typography>
          )}
          {account.is_investment_account && (
            <Chip label="Investment" size="small" color="primary" sx={{ mt: 1 }} />
          )}
          {account.interest_rate !== undefined && account.interest_rate > 0 && (
            <Chip
              label={`${account.interest_rate}% APR`}
              size="small"
              color="secondary"
              sx={{ mt: 1, ml: 1 }}
            />
          )}
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDialog(account);
              }}
              data-testid={`edit-account-${account.id}`}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDeleteDialog(account);
              }}
              data-testid={`delete-account-${account.id}`}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom data-testid="page-title">
            Accounts
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your financial accounts
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          data-testid="add-account-button"
        >
          Add Account
        </Button>
      </Box>

      {loading && accounts.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : accounts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No accounts yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add your first account to get started tracking your finances
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Add Account
          </Button>
        </Paper>
      ) : (
        <>
          {assetAccounts.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom>
                Assets
              </Typography>
              <Grid container spacing={3}>
                {assetAccounts.map((account) => renderAccountCard(account))}
              </Grid>
            </Box>
          )}

          {liabilityAccounts.length > 0 && (
            <Box>
              <Typography variant="h5" gutterBottom>
                Liabilities
              </Typography>
              <Grid container spacing={3}>
                {liabilityAccounts.map((account) => renderAccountCard(account))}
              </Grid>
            </Box>
          )}
        </>
      )}

      {/* Add/Edit Dialog */}
      <AccountFormDialog
        open={accountDialog.open}
        onClose={accountDialog.closeDialog}
        onSubmit={(data) => void submitAccount(data)}
        initialData={accountDialog.data}
        isEditing={accountDialog.isEditing}
        isSubmitting={isSubmitting}
        financialInstitutions={institutions}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={deleteDialog.closeDialog}>
        <DialogTitle>Delete Account?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &quot;{deleteDialog.data?.name}&quot;? This will also
            delete all associated balance history and holdings. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={deleteDialog.closeDialog}>Cancel</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            data-testid="confirm-delete-account"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Accounts;
