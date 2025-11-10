/**
 * CurrencyDetail Page - View currency details and exchange rates
 */

import { FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  Snackbar,
  TextField,
} from '@mui/material';
import { SyncOutlined, ArrowBackOutlined } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  fetchCurrencyRates,
  syncCurrencyRates,
  selectAllCurrencies,
  selectCurrentRates,
  selectCurrenciesLoading,
  selectCurrenciesError,
  selectSyncStatus,
  clearError,
} from '@/store/slices/currenciesSlice';
import { formatDateShort } from '@/utils';

const CurrencyDetail: FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const currencies = useAppSelector(selectAllCurrencies);
  const currentRates = useAppSelector(selectCurrentRates);
  const loading = useAppSelector(selectCurrenciesLoading);
  const error = useAppSelector(selectCurrenciesError);
  const syncStatus = useAppSelector(selectSyncStatus);

  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(today || '');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Find the current currency from the list
  const currency = currencies.find((c) => c.code === code);

  // Fetch currency rates on mount and when date changes
  useEffect(() => {
    if (code) {
      void dispatch(fetchCurrencyRates({ code, date: selectedDate }));
    }
  }, [code, selectedDate, dispatch]);

  // Clear error after timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [error, dispatch]);

  // Handle back navigation
  const handleBack = () => {
    navigate('/currencies');
  };

  // Handle date change
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  // Handle sync rates
  const handleSync = async () => {
    if (!code) return;

    try {
      const result = await dispatch(
        syncCurrencyRates({ baseCurrency: code, syncDate: selectedDate })
      ).unwrap();
      setSnackbarMessage(result.message);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      // Refresh rates after sync
      void dispatch(fetchCurrencyRates({ code, date: selectedDate }));
    } catch (err) {
      setSnackbarMessage(err as string);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Format exchange rate with proper decimals
  const formatRate = (rate: number): string => {
    return rate.toFixed(6);
  };

  // Get target currency details
  const getTargetCurrencyName = (targetCode: string): string => {
    const targetCurrency = currencies.find((c) => c.code === targetCode);
    return targetCurrency?.name || targetCode;
  };

  if (loading && !currentRates) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress data-testid="loading-indicator" />
      </Container>
    );
  }

  if (!code || !currency) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" data-testid="not-found-alert">
          Currency not found
        </Alert>
        <Button onClick={handleBack} sx={{ mt: 2 }} data-testid="back-button-error">
          Back to Currencies
        </Button>
      </Container>
    );
  }

  const ratesArray = currentRates?.rates
    ? Object.entries(currentRates.rates).map(([targetCode, rate]) => ({
        targetCode,
        rate,
      }))
    : [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} data-testid="error-alert">
          {error}
        </Alert>
      )}

      {/* Back button */}
      <Button
        startIcon={<ArrowBackOutlined />}
        onClick={handleBack}
        sx={{ mb: 2 }}
        data-testid="back-button"
      >
        Back to Currencies
      </Button>

      {/* Currency header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" data-testid="currency-code">
            {currency.code}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {currency.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Typography variant="h6" data-testid="currency-symbol">
              Symbol: {currency.symbol}
            </Typography>
            <Chip
              label={currency.isActive ? 'Active' : 'Inactive'}
              color={currency.isActive ? 'success' : 'default'}
              size="small"
              data-testid="currency-status"
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexDirection: 'column' }}>
          <TextField
            label="Rate Date"
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            InputLabelProps={{ shrink: true }}
            size="small"
            data-testid="date-picker"
            sx={{ minWidth: 200 }}
          />
          <Button
            variant="contained"
            onClick={() => { void handleSync(); }}
            disabled={syncStatus.loading}
            startIcon={<SyncOutlined />}
            data-testid="sync-button"
          >
            {syncStatus.loading ? 'Syncing...' : 'Sync Rates'}
          </Button>
        </Box>
      </Box>

      {/* Exchange rates table */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">Exchange Rates</Typography>
          {currentRates && (
            <Typography variant="body2" color="text.secondary">
              Base Currency: {currentRates.baseCurrency} | Date: {formatDateShort(currentRates.date)}
            </Typography>
          )}
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={40} />
          </Box>
        ) : ratesArray.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary" data-testid="no-rates-message">
              No rates available for this date
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Click "Sync Rates" to fetch current exchange rates
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table data-testid="rates-table">
              <TableHead>
                <TableRow>
                  <TableCell>Target Currency Code</TableCell>
                  <TableCell>Target Currency Name</TableCell>
                  <TableCell align="right">Exchange Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ratesArray.map(({ targetCode, rate }) => (
                  <TableRow
                    key={targetCode}
                    hover
                    data-testid={`rate-row-${targetCode}`}
                  >
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {targetCode}
                      </Typography>
                    </TableCell>
                    <TableCell>{getTargetCurrencyName(targetCode)}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontFamily="monospace" data-testid={`rate-${targetCode}`}>
                        {formatRate(rate)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Currency info footer */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Last updated: {formatDateShort(currency.updatedAt)}
        </Typography>
      </Paper>

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
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CurrencyDetail;
