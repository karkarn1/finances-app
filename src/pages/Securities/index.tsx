/**
 * Securities List Page - Search and browse securities
 */

import { FC, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Autocomplete,
  TextField,
  Grid,
  Paper,
  Chip,
  Tooltip,
} from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  searchSecuritiesAsync,
  syncSecurityAsync,
  selectSearchResults,
  selectIsSearching,
} from '@/store/slices/securitiesSlice';
import type { Security } from '@/types';

// Debounce helper
const debounce = <T extends unknown[]>(
  func: (...args: T) => void,
  delay: number
) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: T) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Popular securities for quick access
const POPULAR_SECURITIES = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'TSLA', name: 'Tesla, Inc.' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust' },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF' },
];

const Securities: FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const searchResults = useAppSelector(selectSearchResults);
  const isSearching = useAppSelector(selectIsSearching);
  const [inputValue, setInputValue] = useState('');

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.trim().length >= 1) {
        dispatch(searchSecuritiesAsync(query.trim()));
      }
    }, 300),
    [dispatch]
  );

  const handleInputChange = (
    _event: React.SyntheticEvent,
    value: string
  ) => {
    setInputValue(value);
    debouncedSearch(value);
  };

  const handleSelectionChange = (
    _event: React.SyntheticEvent,
    value: Security | null
  ) => {
    if (value) {
      // Auto-sync if security is not in database (fire and forget - don't wait)
      if (value.in_database === false) {
        void dispatch(syncSecurityAsync(value.symbol));
      }
      navigate(`/securities/${value.symbol}`);
    }
  };

  const handlePopularClick = (symbol: string) => {
    navigate(`/securities/${symbol}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom data-testid="page-title">
          Search Securities
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Search for stocks, ETFs, and other securities by symbol or name
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Autocomplete
          options={searchResults}
          getOptionLabel={(option: Security) =>
            `${option.symbol} - ${option.name}`
          }
          loading={isSearching}
          inputValue={inputValue}
          onInputChange={handleInputChange}
          onChange={handleSelectionChange}
          filterOptions={(x) => x}
          noOptionsText={
            inputValue.trim().length === 0
              ? 'Start typing to search...'
              : 'No securities found'
          }
          data-testid="security-search"
          renderOption={(props, option: Security) => (
            <Box
              component="li"
              {...props}
              key={option.symbol}
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}
            >
              <Box>
                <Typography variant="body1" component="span" sx={{ fontWeight: 500 }}>
                  {option.symbol}
                </Typography>
                <Typography variant="body2" component="span" sx={{ ml: 1, color: 'text.secondary' }}>
                  {option.name}
                </Typography>
              </Box>
              {option.in_database === false && (
                <Tooltip title="This security is not yet synced to the database. Click to view and sync.">
                  <Chip
                    icon={<InfoOutlined fontSize="small" />}
                    label="Not Synced"
                    size="small"
                    color="warning"
                    variant="outlined"
                    data-testid={`not-synced-badge-${option.symbol}`}
                  />
                </Tooltip>
              )}
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...(params as any)}
              label="Search by symbol or name"
              placeholder="e.g., AAPL or Apple"
              fullWidth
            />
          )}
        />
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>
          Popular Securities
        </Typography>
        <Grid container spacing={2}>
          {POPULAR_SECURITIES.map((security) => (
            <Grid item xs={12} sm={6} md={3} key={security.symbol}>
              <Paper
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    transform: 'translateY(-2px)',
                    boxShadow: 2,
                  },
                }}
                onClick={() => handlePopularClick(security.symbol)}
                data-testid={`popular-${security.symbol}`}
              >
                <Typography variant="h6" gutterBottom>
                  {security.symbol}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {security.name}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Securities;
