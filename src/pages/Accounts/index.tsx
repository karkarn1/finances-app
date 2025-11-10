/**
 * Accounts Page - Manage accounts
 */

import { FC, useState, useEffect } from 'react';
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
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
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
import { selectAllCurrencies } from '@/store/slices/currenciesSlice';
import type { AccountDetailed, AccountCreate, AccountType } from '@/types';
import { formatCurrency, getAccountTypeLabel } from '@/utils';
import CurrencySelector from '@/components/CurrencySelector';

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
  { value: 'tfsa', label: 'TFSA' },
  { value: 'rrsp', label: 'RRSP' },
  { value: 'fhsa', label: 'FHSA' },
  { value: 'margin', label: 'Margin' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'line_of_credit', label: 'Line of Credit' },
  { value: 'payment_plan', label: 'Payment Plan' },
  { value: 'mortgage', label: 'Mortgage' },
];

const Accounts: FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const accounts = useAppSelector(selectAllAccounts);
  const assetAccounts = useAppSelector(selectAssetAccounts);
  const liabilityAccounts = useAppSelector(selectLiabilityAccounts);
  const loading = useAppSelector(selectAccountsLoading);
  const institutions = useAppSelector(selectAllInstitutions);
  const currencies = useAppSelector(selectAllCurrencies);

  // Initial form data
  const initialAccountData: AccountCreate = {
    name: '',
    account_type: 'checking',
    is_investment_account: false,
  };

  // Dialog management for add/edit account
  const {
    open: dialogOpen,
    data: formData,
    isEditing,
    openDialog: openAccountDialog,
    closeDialog: closeAccountDialog,
    setData: setFormData,
  } = useDialog<AccountCreate>(initialAccountData);

  // Track which account is being edited (need ID for update)
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

  // Dialog management for delete confirmation
  const {
    open: deleteDialogOpen,
    data: deletingAccount,
    openDialog: openDeleteDialog,
    closeDialog: closeDeleteDialog,
  } = useDialog<AccountDetailed | null>(null);

  // Form validation errors (not moved to hook as validation is specific to this form)
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    interest_rate?: string;
  }>({});

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
        ...(data.currency_id && { currency_id: data.currency_id }),
      };

      if (isEditing && editingAccountId) {
        await dispatch(
          updateAccount({
            id: editingAccountId,
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
      handleCloseDialog();
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
      setEditingAccountId(account.id);
      openAccountDialog({
        name: account.name,
        account_type: account.account_type,
        ...(account.financial_institution_id && {
          financial_institution_id: account.financial_institution_id,
        }),
        is_investment_account: account.is_investment_account,
        ...(account.interest_rate !== undefined && { interest_rate: account.interest_rate }),
        ...(account.currency_id && { currency_id: account.currency_id }),
      });
    } else {
      // Open dialog for creating new account
      setEditingAccountId(null);
      openAccountDialog();
    }
    setFormErrors({});
  };

  const handleCloseDialog = () => {
    setEditingAccountId(null);
    closeAccountDialog();
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: { name?: string; interest_rate?: string } = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
      setFormErrors(errors);
      return false;
    }

    if (
      formData.interest_rate !== undefined &&
      formData.interest_rate !== null &&
      (isNaN(formData.interest_rate) || formData.interest_rate < 0 || formData.interest_rate > 100)
    ) {
      errors.interest_rate = 'Interest rate must be between 0 and 100';
      setFormErrors(errors);
      return false;
    }

    setFormErrors(errors);
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    void submitAccount(formData);
  };

  const handleOpenDeleteDialog = (account: AccountDetailed) => {
    openDeleteDialog(account);
  };

  const handleCloseDeleteDialog = () => {
    closeDeleteDialog();
  };

  const handleDelete = () => {
    if (!deletingAccount) return;

    void (async () => {
      try {
        await dispatch(deleteAccount(deletingAccount.id)).unwrap();
        errorService.showSuccess('Account deleted successfully');
        handleCloseDeleteDialog();
      } catch (err) {
        errorService.showError(err, 'Delete account');
        console.error('Failed to delete account:', err);
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
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Account' : 'Add Account'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Account Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={!!formErrors.name}
              helperText={formErrors.name}
              fullWidth
              required
              autoFocus
              data-testid="account-name-input"
            />
            <TextField
              label="Account Type"
              value={formData.account_type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  account_type: e.target.value as AccountType,
                })
              }
              select
              fullWidth
              required
              data-testid="account-type-select"
            >
              {ACCOUNT_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Financial Institution"
              value={formData.financial_institution_id || ''}
              onChange={(e) => {
                const newFormData = { ...formData };
                if (e.target.value) {
                  newFormData.financial_institution_id = e.target.value;
                } else {
                  delete newFormData.financial_institution_id;
                }
                setFormData(newFormData);
              }}
              select
              fullWidth
              data-testid="institution-select"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {institutions.map((institution) => (
                <MenuItem key={institution.id} value={institution.id}>
                  {institution.name}
                </MenuItem>
              ))}
            </TextField>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.is_investment_account || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_investment_account: e.target.checked,
                    })
                  }
                  data-testid="investment-account-checkbox"
                />
              }
              label="Investment Account"
            />
            <TextField
              label="Interest Rate (APR %)"
              type="number"
              value={formData.interest_rate || ''}
              onChange={(e) => {
                const newFormData = { ...formData };
                if (e.target.value) {
                  newFormData.interest_rate = parseFloat(e.target.value);
                } else {
                  delete newFormData.interest_rate;
                }
                setFormData(newFormData);
              }}
              error={!!formErrors.interest_rate}
              helperText={formErrors.interest_rate || 'Optional'}
              fullWidth
              inputProps={{ min: 0, max: 100, step: 0.01 }}
              data-testid="interest-rate-input"
            />
            <CurrencySelector
              value={
                formData.currency_id
                  ? currencies.find((c) => c.id === formData.currency_id)?.code || null
                  : null
              }
              onChange={(code) => {
                const newFormData = { ...formData };
                if (code) {
                  const currency = currencies.find((c) => c.code === code);
                  if (currency) {
                    newFormData.currency_id = currency.id;
                  }
                } else {
                  delete newFormData.currency_id;
                }
                setFormData(newFormData);
              }}
              label="Currency"
              helperText="Optional - defaults to USD"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitting}
            data-testid="submit-account"
          >
            {isEditing ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Account?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &quot;{deletingAccount?.name}&quot;? This will also
            delete all associated balance history and holdings. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
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
