/**
 * Currencies Page - Manage currencies and exchange rates
 */

import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  Sync as SyncIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector, useFormSubmit } from '@/hooks';
import { errorService } from '@/services/errorService';
import {
  fetchCurrencies,
  syncCurrencyRates,
  createCurrency,
  selectAllCurrencies,
  selectCurrenciesLoading,
  selectCurrenciesError,
  selectSyncStatus,
  clearError,
} from '@/store/slices/currenciesSlice';
import { formatDateShort } from '@/utils';
import type { CurrencyCreate, Currency } from '@/types';
import { DataTable, DataTableColumn } from '@/components';
import { CurrencyFormDialog } from './components';

interface CurrencyFormData {
  code: string;
  name: string;
  symbol: string;
}

const Currencies: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currencies = useAppSelector(selectAllCurrencies);
  const loading = useAppSelector(selectCurrenciesLoading);
  const error = useAppSelector(selectCurrenciesError);
  const syncStatus = useAppSelector(selectSyncStatus);

  const [currencyDialogOpen, setCurrencyDialogOpen] = useState(false);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Form submission with loading/error handling
  const { handleSubmit: submitCurrency, isSubmitting } = useFormSubmit(
    async (data: CurrencyFormData) => {
      const currencyData: CurrencyCreate = {
        code: data.code,
        name: data.name,
        symbol: data.symbol,
      };

      await dispatch(createCurrency(currencyData)).unwrap();
      errorService.showSuccess(`Currency ${data.code} created successfully`);
    },
    () => {
      setCurrencyDialogOpen(false);
      void dispatch(fetchCurrencies());
    }
  );

  useEffect(() => {
    void dispatch(fetchCurrencies());
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

  const handleRefresh = () => {
    void dispatch(fetchCurrencies());
  };

  const handleOpenSyncDialog = () => {
    setSyncDialogOpen(true);
  };

  const handleCloseSyncDialog = () => {
    setSyncDialogOpen(false);
  };

  const handleSyncRates = async () => {
    try {
      const result = await dispatch(syncCurrencyRates({ baseCurrency: 'USD' })).unwrap();
      setSnackbarMessage(result.message);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleCloseSyncDialog();
    } catch (err) {
      setSnackbarMessage(err as string);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Handle row click to navigate to currency detail
  const handleRowClick = (currency: Currency) => {
    navigate(`/currencies/${currency.code}`);
  };

  // Define columns for DataTable
  const currencyColumns: DataTableColumn<Currency>[] = [
    {
      label: 'Code',
      render: (currency) => (
        <Typography variant="body1" fontWeight="medium">
          {currency.code}
        </Typography>
      ),
    },
    {
      label: 'Name',
      key: 'name',
    },
    {
      label: 'Symbol',
      render: (currency) => (
        <Typography variant="body1" fontWeight="medium">
          {currency.symbol}
        </Typography>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom data-testid="page-title">
            Currencies
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage currencies and exchange rates
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Tooltip title="Refresh currencies list">
            <span>
              <IconButton onClick={handleRefresh} disabled={loading} data-testid="refresh-button">
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setCurrencyDialogOpen(true)}
            data-testid="add-currency-button"
          >
            Add Currency
          </Button>
          <Button
            variant="contained"
            startIcon={syncStatus.loading ? <CircularProgress size={20} color="inherit" /> : <SyncIcon />}
            onClick={handleOpenSyncDialog}
            disabled={syncStatus.loading}
            data-testid="sync-rates-button"
          >
            Sync Rates
          </Button>
        </Box>
      </Box>

      {syncStatus.lastSync && (
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Typography variant="body2" color="text.secondary">
            Last synced: {formatDateShort(syncStatus.lastSync)}
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} data-testid="error-alert">
          {error}
        </Alert>
      )}

      <DataTable<Currency>
        data={currencies}
        columns={currencyColumns}
        isLoading={loading && currencies.length === 0}
        emptyMessage="No currencies in the system."
        onRowClick={handleRowClick}
        getRowKey={(currency) => currency.code}
      />

      {/* Add Currency Dialog */}
      <CurrencyFormDialog
        open={currencyDialogOpen}
        onClose={() => setCurrencyDialogOpen(false)}
        onSubmit={(data) => void submitCurrency(data)}
        isSubmitting={isSubmitting}
      />

      {/* Sync Rates Dialog */}
      <Dialog open={syncDialogOpen} onClose={handleCloseSyncDialog}>
        <DialogTitle>Sync Exchange Rates</DialogTitle>
        <DialogContent>
          <Typography>
            This will fetch the latest exchange rates from an external API and update the database.
            The operation may take a few seconds.
          </Typography>
          <Typography sx={{ mt: 2 }} variant="body2" color="text.secondary">
            Base currency: USD
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSyncDialog}>Cancel</Button>
          <Button
            onClick={() => { void handleSyncRates(); }}
            variant="contained"
            disabled={syncStatus.loading}
            data-testid="confirm-sync"
          >
            {syncStatus.loading ? 'Syncing...' : 'Sync Now'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
          data-testid="snackbar-alert"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Currencies;
