/**
 * Account Detail Page - View account details, balance history, and holdings
 * Refactored into focused components for better maintainability
 */
import { FC, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Alert,
  CircularProgress,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import { useAppDispatch, useAppSelector, useDebounce, useDialog } from '@/hooks';
import {
  fetchAccountById,
  createAccountValue,
  updateAccountValue,
  deleteAccountValue,
  deleteAccount,
} from '@/store/slices/accountsSlice';
import {
  createHolding,
  updateHolding,
  deleteHolding,
  fetchHoldings,
} from '@/store/slices/holdingsSlice';
import {
  searchSecuritiesAsync,
  selectSearchResults,
  selectIsSearching,
} from '@/store/slices/securitiesSlice';
import type { AccountValueCreate, HoldingCreate, Security } from '@/types';
import {
  AccountHeader,
  AccountSummary,
  BalanceHistorySection,
  HoldingsSection,
  AddBalanceDialog,
  AddHoldingDialog,
} from './components';
import { useAccountData } from './hooks/useAccountData';
import { useChartData } from './hooks/useChartData';
import { logger } from '@/utils/logger';

const AccountDetail: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Fetch data using custom hook
  const {
    account,
    accountValues,
    loading,
    error,
    holdings,
    holdingsLoading,
    holdingsError,
  } = useAccountData(id);

  // Transform data for charts using custom hook
  const { chartData, holdingsChartData, totalHoldingsValue } = useChartData(accountValues, holdings);

  // Securities search state
  const securities = useAppSelector(selectSearchResults);
  const searchingSecurities = useAppSelector(selectIsSearching);

  // Dialog management for balance values
  const valueDialog = useDialog<AccountValueCreate>({ balance: 0 });

  // Dialog management for holdings
  const holdingDialog = useDialog<HoldingCreate>({
    security_id: '',
    timestamp: new Date().toISOString(),
    shares: 0,
    average_price_per_share: 0,
  });

  // Dialog management for delete confirmation
  const deleteAccountDialog = useDialog<boolean>(false);

  const [selectedSecurity, setSelectedSecurity] = useState<Security | null>(null);
  const [securitySearchQuery, setSecuritySearchQuery] = useState('');

  // Debounced security search using custom hook
  const debouncedSecuritySearchQuery = useDebounce(securitySearchQuery, 300);

  useEffect(() => {
    if (debouncedSecuritySearchQuery.trim().length >= 1) {
      void dispatch(searchSecuritiesAsync(debouncedSecuritySearchQuery.trim()));
    }
  }, [debouncedSecuritySearchQuery, dispatch]);

  // Balance value dialog handlers
  const handleOpenValueDialog = (valueId?: string) => {
    if (valueId) {
      const value = accountValues.find((v) => v.id === valueId);
      if (value) {
        const newFormData: AccountValueCreate = {
          timestamp: value.timestamp,
          balance: value.balance,
        };
        if (value.cash_balance !== undefined && value.cash_balance !== null) {
          newFormData.cash_balance = value.cash_balance;
        }
        valueDialog.openDialog(newFormData, valueId);
      }
    } else {
      const newFormData: AccountValueCreate = {
        balance: account?.current_balance || 0,
      };
      if (account?.is_investment_account && account?.current_cash_balance !== undefined) {
        newFormData.cash_balance = account.current_cash_balance;
      }
      valueDialog.openDialog(newFormData);
    }
  };

  const handleSubmitValue = async () => {
    if (!id) return;

    try {
      if (valueDialog.isEditing && valueDialog.editingId) {
        await dispatch(
          updateAccountValue({
            accountId: id,
            valueId: valueDialog.editingId,
            data: valueDialog.data,
          })
        ).unwrap();
      } else {
        await dispatch(
          createAccountValue({
            accountId: id,
            data: valueDialog.data,
          })
        ).unwrap();
      }
      valueDialog.closeDialog();
      void dispatch(fetchAccountById(id));
    } catch (err) {
      logger.error('Failed to save account value:', err);
    }
  };

  const handleDeleteValue = async (valueId: string) => {
    if (!id) return;
    try {
      await dispatch(deleteAccountValue({ accountId: id, valueId })).unwrap();
      void dispatch(fetchAccountById(id));
    } catch (err) {
      logger.error('Failed to delete account value:', err);
    }
  };

  // Holding dialog handlers
  const handleOpenHoldingDialog = (holdingId?: string) => {
    if (holdingId) {
      const holding = holdings.find((h) => h.id === holdingId);
      if (holding) {
        holdingDialog.openDialog(
          {
            security_id: holding.security_id,
            timestamp: holding.timestamp,
            shares: holding.shares,
            average_price_per_share: holding.average_price_per_share,
          },
          holdingId
        );
        setSelectedSecurity(holding.security || null);
      }
    } else {
      holdingDialog.openDialog();
      setSelectedSecurity(null);
      setSecuritySearchQuery('');
    }
  };

  const handleSubmitHolding = async () => {
    if (!id || !holdingDialog.data.security_id) return;

    try {
      if (holdingDialog.isEditing && holdingDialog.editingId) {
        await dispatch(
          updateHolding({
            accountId: id,
            holdingId: holdingDialog.editingId,
            data: holdingDialog.data,
          })
        ).unwrap();
      } else {
        await dispatch(
          createHolding({
            accountId: id,
            data: holdingDialog.data,
          })
        ).unwrap();
      }
      holdingDialog.closeDialog();
      setSelectedSecurity(null);
      setSecuritySearchQuery('');
      void dispatch(fetchHoldings(id));
      void dispatch(fetchAccountById(id));
    } catch (err) {
      logger.error('Failed to save holding:', err);
    }
  };

  const handleDeleteHolding = async (holdingId: string) => {
    if (!id) return;
    try {
      await dispatch(deleteHolding({ accountId: id, holdingId })).unwrap();
      void dispatch(fetchAccountById(id));
    } catch (err) {
      logger.error('Failed to delete holding:', err);
    }
  };

  const handleDeleteAccount = async () => {
    if (!id) return;
    try {
      await dispatch(deleteAccount(id)).unwrap();
      navigate('/accounts');
    } catch (err) {
      logger.error('Failed to delete account:', err);
    }
  };

  const handleSecuritySelect = (security: Security) => {
    setSelectedSecurity(security);
    holdingDialog.updateData({
      ...holdingDialog.data,
      security_id: security.in_database === false ? security.symbol : security.id,
    });
    setSecuritySearchQuery(security.symbol);
  };

  // Loading state
  if (loading && !account) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Account not found
  if (!account) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Account not found</Alert>
        <Button onClick={() => navigate('/accounts')} sx={{ mt: 2 }}>
          Back to Accounts
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <AccountHeader account={account} onDelete={() => deleteAccountDialog.openDialog(true)} />

      {/* Error Alert */}
      {(error || holdingsError) && (
        <Alert severity="error" sx={{ mb: 3 }} data-testid="error-alert">
          {error || holdingsError}
        </Alert>
      )}

      {/* Summary Cards */}
      <AccountSummary account={account} />

      {/* Balance History */}
      <BalanceHistorySection
        account={account}
        accountValues={accountValues}
        chartData={chartData}
        onAdd={() => handleOpenValueDialog()}
        onEdit={(valueId: string) => handleOpenValueDialog(valueId)}
        onDelete={(valueId: string) => void handleDeleteValue(valueId)}
      />

      {/* Holdings Section (Investment Accounts Only) */}
      {account.is_investment_account && (
        <HoldingsSection
          holdings={holdings}
          holdingsLoading={holdingsLoading}
          holdingsChartData={holdingsChartData}
          totalHoldingsValue={totalHoldingsValue}
          onAdd={() => handleOpenHoldingDialog()}
          onEdit={(holdingId: string) => handleOpenHoldingDialog(holdingId)}
          onDelete={(holdingId: string) => void handleDeleteHolding(holdingId)}
        />
      )}

      {/* Add/Edit Balance Dialog */}
      <AddBalanceDialog
        open={valueDialog.open}
        isEditing={valueDialog.isEditing}
        account={account}
        initialData={valueDialog.data}
        onClose={valueDialog.closeDialog}
        onSubmit={(data) => {
          valueDialog.updateData(data);
          void handleSubmitValue();
        }}
      />

      {/* Add/Edit Holding Dialog */}
      <AddHoldingDialog
        open={holdingDialog.open}
        isEditing={holdingDialog.isEditing}
        initialData={holdingDialog.data}
        selectedSecurity={selectedSecurity}
        securitySearchQuery={securitySearchQuery}
        searchingSecurities={searchingSecurities}
        securities={securities}
        onClose={holdingDialog.closeDialog}
        onSubmit={(data) => {
          holdingDialog.updateData(data);
          void handleSubmitHolding();
        }}
        onSecuritySearchChange={setSecuritySearchQuery}
        onSecuritySelect={handleSecuritySelect}
      />

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={deleteAccountDialog.open} onClose={deleteAccountDialog.closeDialog}>
        <DialogTitle>Delete Account?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &quot;{account.name}&quot;? This will also delete all
            balance history and holdings. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={deleteAccountDialog.closeDialog}>Cancel</Button>
          <Button onClick={() => void handleDeleteAccount()} color="error" variant="contained">
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AccountDetail;
