/**
 * PriceChart Component - Displays interactive price chart for securities
 */

import { FC, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Paper, CircularProgress, Typography, Alert, Box } from '@mui/material';
import type { PriceData, Timeframe, DataCompleteness } from '@/types';
import { formatDate, formatDateTime } from '@/utils/timeframes';

interface PriceChartProps {
  data: PriceData[];
  timeframe: Timeframe;
  isLoading?: boolean;
  dataCompleteness?: DataCompleteness | null;
  actualStart?: string | null;
  actualEnd?: string | null;
  requestedStart?: string | null;
  requestedEnd?: string | null;
}

interface ChartDataPoint {
  timestamp: number;
  price: number;
  volume: number;
}

const PriceChart: FC<PriceChartProps> = ({
  data,
  timeframe,
  isLoading,
  dataCompleteness,
  actualStart,
  actualEnd,
  requestedStart,
  requestedEnd,
}) => {
  // Transform data for Recharts
  const chartData = useMemo<ChartDataPoint[]>(() => {
    return data.map((d) => ({
      timestamp: new Date(d.timestamp).getTime(),
      price: d.close,
      volume: d.volume,
    }));
  }, [data]);

  // Calculate price change for color
  const priceChange = useMemo(() => {
    if (chartData.length < 2) return 0;
    const first = chartData[0]?.price || 0;
    const last = chartData[chartData.length - 1]?.price || 0;
    return last - first;
  }, [chartData]);

  const lineColor = priceChange >= 0 ? '#2e7d32' : '#d32f2f';

  // Helper to format date for display
  const formatDisplayDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Determine if we should show data quality alert
  const showDataAlert = dataCompleteness && dataCompleteness !== 'complete' && dataCompleteness !== 'empty';

  // Generate alert message based on completeness
  const getAlertMessage = () => {
    if (!dataCompleteness) return null;

    switch (dataCompleteness) {
      case 'sparse':
        return {
          severity: 'warning' as const,
          message: `Limited price data available. Data ranges from ${formatDisplayDate(actualStart ?? null)} to ${formatDisplayDate(actualEnd ?? null)}. Consider syncing for more complete data.`,
        };
      case 'partial':
        return {
          severity: 'info' as const,
          message: `Partial data available from ${formatDisplayDate(actualStart ?? null)} to ${formatDisplayDate(actualEnd ?? null)} (requested ${formatDisplayDate(requestedStart ?? null)} to ${formatDisplayDate(requestedEnd ?? null)}).`,
        };
      default:
        return null;
    }
  };

  const alertInfo = getAlertMessage();

  if (isLoading) {
    return (
      <Paper sx={{ p: 2, height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (chartData.length === 0) {
    return (
      <Paper sx={{ p: 2, height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No price data available. Click &quot;Sync Data&quot; to fetch latest prices.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Data quality alert */}
      {showDataAlert && alertInfo && (
        <Alert severity={alertInfo.severity} sx={{ mb: 2 }} data-testid="data-quality-alert">
          {alertInfo.message}
        </Alert>
      )}

      {/* Chart */}
      <Paper sx={{ p: 2, height: 500 }} data-testid="price-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(ts: number) => formatDate(ts, timeframe)}
              type="number"
              domain={['dataMin', 'dataMax']}
              stroke="#666"
            />
            <YAxis
              domain={['auto', 'auto']}
              tickFormatter={(val: number) => `$${val.toFixed(2)}`}
              stroke="#666"
            />
            <Tooltip
              labelFormatter={(ts: number) => formatDateTime(ts)}
              formatter={(val: number) => [`$${val.toFixed(2)}`, 'Price']}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke={lineColor}
              dot={false}
              strokeWidth={2}
              animationDuration={300}
            />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default PriceChart;
