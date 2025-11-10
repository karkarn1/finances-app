/**
 * Currencies Page - Manage currencies and exchange rates
 */

import { FC, useEffect, useState } from 'react';
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
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  TextField,
  Checkbox,
} from '@mui/material';
import {
  Sync as SyncIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/hooks';
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
import type { CurrencyCreate } from '@/types';

const Currencies: FC = () => {
  const dispatch = useAppDispatch();
  const currencies = useAppSelector(selectAllCurrencies);
  const loading = useAppSelector(selectCurrenciesLoading);
  const error = useAppSelector(selectCurrenciesError);
  const syncStatus = useAppSelector(selectSyncStatus);

  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [addCurrencyDialogOpen, setAddCurrencyDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Add currency form state
  const [currencyCode, setCurrencyCode] = useState('');
  const [currencyName, setCurrencyName] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('');
  const [currencyIsActive, setCurrencyIsActive] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Form validation errors
  const [codeError, setCodeError] = useState('');
  const [nameError, setNameError] = useState('');
  const [symbolError, setSymbolError] = useState('');

  useEffect(() => {
    void dispatch(fetchCurrencies(!showActiveOnly));
  }, [dispatch, showActiveOnly]);

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
    void dispatch(fetchCurrencies(!showActiveOnly));
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

  const handleOpenAddCurrencyDialog = () => {
    setAddCurrencyDialogOpen(true);
  };

  const handleCloseAddCurrencyDialog = () => {
    setAddCurrencyDialogOpen(false);
    // Reset form
    setCurrencyCode('');
    setCurrencyName('');
    setCurrencySymbol('');
    setCurrencyIsActive(true);
    setCodeError('');
    setNameError('');
    setSymbolError('');
  };

  const validateForm = (): boolean => {
    let isValid = true;

    // Validate code (3 uppercase letters)
    const codePattern = /^[A-Z]{3}$/;
    if (!currencyCode) {
      setCodeError('Code is required');
      isValid = false;
    } else if (!codePattern.test(currencyCode)) {
      setCodeError('Code must be exactly 3 uppercase letters');
      isValid = false;
    } else {
      setCodeError('');
    }

    // Validate name
    if (!currencyName || currencyName.trim().length === 0) {
      setNameError('Name is required');
      isValid = false;
    } else if (currencyName.length > 100) {
      setNameError('Name must be 100 characters or less');
      isValid = false;
    } else {
      setNameError('');
    }

    // Validate symbol
    if (!currencySymbol || currencySymbol.trim().length === 0) {
      setSymbolError('Symbol is required');
      isValid = false;
    } else if (currencySymbol.length > 10) {
      setSymbolError('Symbol must be 10 characters or less');
      isValid = false;
    } else {
      setSymbolError('');
    }

    return isValid;
  };

  const handleCreateCurrency = async () => {
    if (!validateForm()) {
      return;
    }

    setIsCreating(true);

    const currencyData: CurrencyCreate = {
      code: currencyCode,
      name: currencyName,
      symbol: currencySymbol,
      isActive: currencyIsActive,
    };

    try {
      await dispatch(createCurrency(currencyData)).unwrap();
      setSnackbarMessage(`Currency ${currencyCode} created successfully`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleCloseAddCurrencyDialog();
      // Refresh currencies list
      void dispatch(fetchCurrencies(!showActiveOnly));
    } catch (err) {
      setSnackbarMessage(err as string);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredCurrencies = showActiveOnly
    ? currencies.filter((c) => c.isActive)
    : currencies;

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
            <IconButton onClick={handleRefresh} disabled={loading} data-testid="refresh-button">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleOpenAddCurrencyDialog}
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

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FormControlLabel
          control={
            <Switch
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
              data-testid="active-only-switch"
            />
          }
          label="Show active currencies only"
        />
        {syncStatus.lastSync && (
          <Typography variant="body2" color="text.secondary">
            Last synced: {formatDateShort(syncStatus.lastSync)}
          </Typography>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} data-testid="error-alert">
          {error}
        </Alert>
      )}

      {loading && currencies.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredCurrencies.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No currencies found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {showActiveOnly
              ? 'No active currencies available. Try showing all currencies.'
              : 'No currencies in the system.'}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table data-testid="currencies-table">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Symbol</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell>Last Updated</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCurrencies.map((currency) => (
                <TableRow
                  key={currency.id}
                  hover
                  data-testid={`currency-row-${currency.code}`}
                >
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {currency.code}
                    </Typography>
                  </TableCell>
                  <TableCell>{currency.name}</TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {currency.symbol}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {currency.isActive ? (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="Active"
                        color="success"
                        size="small"
                      />
                    ) : (
                      <Chip
                        icon={<CancelIcon />}
                        label="Inactive"
                        color="default"
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell>{formatDateShort(currency.updatedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Currency Dialog */}
      <Dialog
        open={addCurrencyDialogOpen}
        onClose={handleCloseAddCurrencyDialog}
        maxWidth="sm"
        fullWidth
        data-testid="currency-dialog"
      >
        <DialogTitle>Add New Currency</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Currency Code"
              value={currencyCode}
              onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
              error={!!codeError}
              helperText={codeError || 'Enter 3-letter code (e.g., EUR, GBP, JPY)'}
              inputProps={{ maxLength: 3 }}
              data-testid="currency-code-input"
              required
              fullWidth
            />
            <TextField
              label="Currency Name"
              value={currencyName}
              onChange={(e) => setCurrencyName(e.target.value)}
              error={!!nameError}
              helperText={nameError || 'Full name of the currency'}
              inputProps={{ maxLength: 100 }}
              data-testid="currency-name-input"
              required
              fullWidth
            />
            <TextField
              label="Symbol"
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              error={!!symbolError}
              helperText={symbolError || 'Currency symbol (e.g., €, £, ¥)'}
              inputProps={{ maxLength: 10 }}
              data-testid="currency-symbol-input"
              required
              fullWidth
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={currencyIsActive}
                  onChange={(e) => setCurrencyIsActive(e.target.checked)}
                  data-testid="currency-active-checkbox"
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddCurrencyDialog} disabled={isCreating}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateCurrency}
            variant="contained"
            disabled={isCreating}
            data-testid="create-currency-button"
          >
            {isCreating ? 'Creating...' : 'Create Currency'}
          </Button>
        </DialogActions>
      </Dialog>

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
            onClick={handleSyncRates}
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
