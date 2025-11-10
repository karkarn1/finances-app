import { FC, useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Tooltip,
  Skeleton,
  Alert,
  TextField,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  fetchCurrencyRates,
  selectCurrentRates,
  selectCurrenciesLoading,
  selectCurrenciesError,
  clearError,
} from '@/store/slices/currenciesSlice';

interface CurrencyRatesProps {
  baseCurrency: string;
  onRefresh?: () => void;
}

const CurrencyRates: FC<CurrencyRatesProps> = ({ baseCurrency, onRefresh }) => {
  const dispatch = useAppDispatch();
  const currentRates = useAppSelector(selectCurrentRates);
  const loading = useAppSelector(selectCurrenciesLoading);
  const error = useAppSelector(selectCurrenciesError);

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date().toISOString().split('T')[0];
    return today !== undefined ? today : '';
  });

  useEffect(() => {
    if (baseCurrency) {
      void dispatch(fetchCurrencyRates({ code: baseCurrency, date: selectedDate }));
    }
  }, [dispatch, baseCurrency, selectedDate]);

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
    void dispatch(fetchCurrencyRates({ code: baseCurrency, date: selectedDate }));
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  const ratesArray = currentRates
    ? Object.entries(currentRates.rates).map(([code, rate]) => ({
        code,
        rate,
      }))
    : [];

  return (
    <Box>
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Typography variant="h6">
          Exchange Rates ({baseCurrency} base)
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            type="date"
            label="Date"
            value={selectedDate}
            onChange={handleDateChange}
            size="small"
            InputLabelProps={{ shrink: true }}
            data-testid="rate-date-picker"
          />
          <Tooltip title="Refresh rates">
            <IconButton
              onClick={handleRefresh}
              disabled={loading}
              data-testid="refresh-rates-button"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} data-testid="rates-error-alert">
          {error}
        </Alert>
      )}

      {loading && !currentRates ? (
        <Paper sx={{ p: 2 }}>
          <Skeleton variant="text" height={40} />
          <Skeleton variant="text" height={40} />
          <Skeleton variant="text" height={40} />
          <Skeleton variant="text" height={40} />
          <Skeleton variant="text" height={40} />
        </Paper>
      ) : ratesArray.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No exchange rates available for {baseCurrency} on {selectedDate}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try selecting a different date or syncing rates from the Currencies page
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small" data-testid="currency-rates-table">
            <TableHead>
              <TableRow>
                <TableCell>Currency</TableCell>
                <TableCell align="right">Rate</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ratesArray.map(({ code, rate }) => (
                <TableRow key={code} hover data-testid={`rate-row-${code}`}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {code}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {rate.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 8,
                      })}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {currentRates && ratesArray.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Showing {currentRates.count} rates for {currentRates.date}
        </Typography>
      )}
    </Box>
  );
};

export default CurrencyRates;
