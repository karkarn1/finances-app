/**
 * SecurityDetail Page - View security details with interactive price charts
 */

import { FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  ButtonGroup,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { SyncOutlined, ArrowBackOutlined } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  fetchSecurityAsync,
  fetchPricesAsync,
  syncSecurityAsync,
  selectSelectedSecurity,
  selectPrices,
  selectCurrentTimeframe,
  selectIsLoadingSecurity,
  selectIsLoadingPrices,
  selectIsSyncing,
  selectError,
  selectPriceMetadata,
} from '@/store/slices/securitiesSlice';
import PriceChart from '@/components/PriceChart';
import { formatMarketCap, formatDateTime } from '@/utils/timeframes';
import type { Timeframe } from '@/types';

const TIMEFRAMES: Timeframe[] = ['1D', '1W', '1M', '6M', 'YTD', '1Y', '5Y', 'ALL'];

const SecurityDetail: FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const security = useAppSelector(selectSelectedSecurity);
  const prices = useAppSelector(selectPrices);
  const currentTimeframe = useAppSelector(selectCurrentTimeframe);
  const isLoadingSecurity = useAppSelector(selectIsLoadingSecurity);
  const isLoadingPrices = useAppSelector(selectIsLoadingPrices);
  const isSyncing = useAppSelector(selectIsSyncing);
  const error = useAppSelector(selectError);
  const priceMetadata = useAppSelector(selectPriceMetadata);

  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1M');

  // Fetch security details and initial prices
  useEffect(() => {
    if (symbol) {
      dispatch(fetchSecurityAsync(symbol));
      dispatch(fetchPricesAsync({ symbol, timeframe: selectedTimeframe }));
    }
  }, [symbol, dispatch]);

  // Handle timeframe change
  const handleTimeframeChange = (timeframe: Timeframe) => {
    setSelectedTimeframe(timeframe);
    if (symbol) {
      dispatch(fetchPricesAsync({ symbol, timeframe }));
    }
  };

  // Handle sync
  const handleSync = async () => {
    if (symbol) {
      await dispatch(syncSecurityAsync(symbol));
      // Refresh prices after sync
      dispatch(fetchPricesAsync({ symbol, timeframe: selectedTimeframe }));
    }
  };

  // Handle back
  const handleBack = () => {
    navigate('/securities');
  };

  // Calculate price change
  const priceChange = prices.length >= 2
    ? prices[prices.length - 1]!.close - prices[0]!.close
    : 0;
  const priceChangePercent = prices.length >= 2
    ? (priceChange / prices[0]!.close) * 100
    : 0;

  if (isLoadingSecurity) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!symbol || !security) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Security not found</Alert>
        <Button onClick={handleBack} sx={{ mt: 2 }}>
          Back to Search
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => {}}>
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
        Back to Search
      </Button>

      {/* Security header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" data-testid="security-symbol">
            {security.symbol}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {security.name}
          </Typography>
          {prices.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 1 }}>
              <Typography variant="h5" data-testid="current-price">
                ${prices[prices.length - 1]!.close.toFixed(2)}
              </Typography>
              <Chip
                label={`${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)} (${priceChangePercent >= 0 ? '+' : ''}${priceChangePercent.toFixed(2)}%)`}
                color={priceChange >= 0 ? 'success' : 'error'}
                size="small"
              />
            </Box>
          )}
          {security.last_synced_at && (
            <Typography variant="caption" color="text.secondary">
              Last updated: {formatDateTime(security.last_synced_at)}
            </Typography>
          )}
        </Box>

        <Button
          variant="contained"
          onClick={handleSync}
          disabled={isSyncing || security.is_syncing}
          startIcon={<SyncOutlined />}
          data-testid="sync-button"
        >
          {isSyncing || security.is_syncing ? 'Syncing...' : 'Sync Data'}
        </Button>
      </Box>

      {/* Timeframe selector */}
      <Box sx={{ mb: 2 }}>
        <ButtonGroup variant="outlined" size="small">
          {TIMEFRAMES.map((tf) => (
            <Button
              key={tf}
              variant={selectedTimeframe === tf ? 'contained' : 'outlined'}
              onClick={() => handleTimeframeChange(tf)}
              disabled={isLoadingPrices}
              data-testid={`timeframe-${tf}`}
            >
              {tf}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      {/* Price chart */}
      <Box sx={{ mb: 3 }}>
        <PriceChart
          data={prices}
          timeframe={currentTimeframe}
          isLoading={isLoadingPrices}
          dataCompleteness={priceMetadata.dataCompleteness}
          actualStart={priceMetadata.actualStart}
          actualEnd={priceMetadata.actualEnd}
          requestedStart={priceMetadata.requestedStart}
          requestedEnd={priceMetadata.requestedEnd}
        />
      </Box>

      {/* Security stats */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Exchange
            </Typography>
            <Typography variant="h6">
              {security.exchange || 'N/A'}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Market Cap
            </Typography>
            <Typography variant="h6">
              {formatMarketCap(security.market_cap)}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Currency
            </Typography>
            <Typography variant="h6">
              {security.currency || 'N/A'}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Type
            </Typography>
            <Typography variant="h6">
              {security.security_type || 'N/A'}
            </Typography>
          </Paper>
        </Grid>

        {security.sector && (
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Sector
              </Typography>
              <Typography variant="h6">
                {security.sector}
              </Typography>
            </Paper>
          </Grid>
        )}

        {security.industry && (
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Industry
              </Typography>
              <Typography variant="h6">
                {security.industry}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default SecurityDetail;
