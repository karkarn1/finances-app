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
import { useAppDispatch, useAppSelector } from '@/hooks';
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

  // Dialog states
  const [valueDialogOpen, setValueDialogOpen] = useState(false);
  const [holdingDialogOpen, setHoldingDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<string | null>(null);
  const [editingHolding, setEditingHolding] = useState<string | null>(null);

  // Form data states
  const [valueFormData, setValueFormData] = useState<AccountValueCreate>({
    balance: 0,
  });

  const [holdingFormData, setHoldingFormData] = useState<HoldingCreate>({
    security_id: '',
    timestamp: new Date().toISOString(),
    shares: 0,
    average_price_per_share: 0,
  });

  const [selectedSecurity, setSelectedSecurity] = useState<Security | null>(null);
  const [securitySearchQuery, setSecuritySearchQuery] = useState('');

  // Debounced security search
  useEffect(() => {
    if (securitySearchQuery.trim().length >= 1) {
      const timer = setTimeout(() => {
        void dispatch(searchSecuritiesAsync(securitySearchQuery.trim()));
      }, 300);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [securitySearchQuery, dispatch]);

  // Balance value dialog handlers
  const handleOpenValueDialog = (valueId?: string) => {
    if (valueId) {
      const value = accountValues.find((v) => v.id === valueId);
      if (value) {
        setEditingValue(valueId);
        const newFormData: AccountValueCreate = {
          timestamp: value.timestamp,
          balance: value.balance,
        };
        if (value.cash_balance !== undefined && value.cash_balance !== null) {
          newFormData.cash_balance = value.cash_balance;
        }
        setValueFormData(newFormData);
      }
    } else {
      setEditingValue(null);
      const newFormData: AccountValueCreate = {
        balance: account?.current_balance || 0,
      };
      if (account?.is_investment_account && account?.current_cash_balance !== undefined) {
        newFormData.cash_balance = account.current_cash_balance;
      }
      setValueFormData(newFormData);
    }
    setValueDialogOpen(true);
  };

  const handleCloseValueDialog = () => {
    setValueDialogOpen(false);
    setEditingValue(null);
    setValueFormData({ balance: 0 });
  };

  const handleSubmitValue = async () => {
    if (!id) return;

    try {
      if (editingValue) {
        await dispatch(
          updateAccountValue({
            accountId: id,
            valueId: editingValue,
            data: valueFormData,
          })
        ).unwrap();
      } else {
        await dispatch(
          createAccountValue({
            accountId: id,
            data: valueFormData,
          })
        ).unwrap();
      }
      handleCloseValueDialog();
      void dispatch(fetchAccountById(id));
    } catch (err) {
      console.error('Failed to save account value:', err);
    }
  };

  const handleDeleteValue = async (valueId: string) => {
    if (!id) return;
    try {
      await dispatch(deleteAccountValue({ accountId: id, valueId })).unwrap();
      void dispatch(fetchAccountById(id));
    } catch (err) {
      console.error('Failed to delete account value:', err);
    }
  };

  // Holding dialog handlers
  const handleOpenHoldingDialog = (holdingId?: string) => {
    if (holdingId) {
      const holding = holdings.find((h) => h.id === holdingId);
      if (holding) {
        setEditingHolding(holdingId);
        setHoldingFormData({
          security_id: holding.security_id,
          timestamp: holding.timestamp,
          shares: holding.shares,
          average_price_per_share: holding.average_price_per_share,
        });
        setSelectedSecurity(holding.security || null);
      }
    } else {
      setEditingHolding(null);
      setHoldingFormData({
        security_id: '',
        timestamp: new Date().toISOString(),
        shares: 0,
        average_price_per_share: 0,
      });
      setSelectedSecurity(null);
      setSecuritySearchQuery('');
    }
    setHoldingDialogOpen(true);
  };

  const handleCloseHoldingDialog = () => {
    setHoldingDialogOpen(false);
    setEditingHolding(null);
    setHoldingFormData({
      security_id: '',
      timestamp: new Date().toISOString(),
      shares: 0,
      average_price_per_share: 0,
    });
    setSelectedSecurity(null);
    setSecuritySearchQuery('');
  };

  const handleSubmitHolding = async () => {
    if (!id || !holdingFormData.security_id) return;

    try {
      if (editingHolding) {
        await dispatch(
          updateHolding({
            accountId: id,
            holdingId: editingHolding,
            data: holdingFormData,
          })
        ).unwrap();
      } else {
        await dispatch(
          createHolding({
            accountId: id,
            data: holdingFormData,
          })
        ).unwrap();
      }
      handleCloseHoldingDialog();
      void dispatch(fetchHoldings(id));
      void dispatch(fetchAccountById(id));
    } catch (err) {
      console.error('Failed to save holding:', err);
    }
  };

  const handleDeleteHolding = async (holdingId: string) => {
    if (!id) return;
    try {
      await dispatch(deleteHolding({ accountId: id, holdingId })).unwrap();
      void dispatch(fetchAccountById(id));
    } catch (err) {
      console.error('Failed to delete holding:', err);
    }
  };

  const handleDeleteAccount = async () => {
    if (!id) return;
    try {
      await dispatch(deleteAccount(id)).unwrap();
      navigate('/accounts');
    } catch (err) {
      console.error('Failed to delete account:', err);
    }
  };

  const handleSecuritySelect = (security: Security) => {
    setSelectedSecurity(security);
    setHoldingFormData({
      ...holdingFormData,
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
      <AccountHeader account={account} onDelete={() => setDeleteDialogOpen(true)} />

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
        open={valueDialogOpen}
        isEditing={!!editingValue}
        account={account}
        formData={valueFormData}
        onClose={handleCloseValueDialog}
        onSubmit={() => void handleSubmitValue()}
        onChange={setValueFormData}
      />

      {/* Add/Edit Holding Dialog */}
      <AddHoldingDialog
        open={holdingDialogOpen}
        isEditing={!!editingHolding}
        formData={holdingFormData}
        selectedSecurity={selectedSecurity}
        securitySearchQuery={securitySearchQuery}
        searchingSecurities={searchingSecurities}
        securities={securities}
        onClose={handleCloseHoldingDialog}
        onSubmit={() => void handleSubmitHolding()}
        onChange={setHoldingFormData}
        onSecuritySearchChange={setSecuritySearchQuery}
        onSecuritySelect={handleSecuritySelect}
      />

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Account?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &quot;{account.name}&quot;? This will also delete all
            balance history and holdings. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => void handleDeleteAccount()} color="error" variant="contained">
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AccountDetail;
