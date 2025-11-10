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
import { Paper, CircularProgress, Typography } from '@mui/material';
import type { PriceData, Timeframe } from '@/types';
import { formatDate, formatDateTime } from '@/utils/timeframes';

interface PriceChartProps {
  data: PriceData[];
  timeframe: Timeframe;
  isLoading?: boolean;
}

interface ChartDataPoint {
  timestamp: number;
  price: number;
  volume: number;
}

const PriceChart: FC<PriceChartProps> = ({ data, timeframe, isLoading }) => {
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
  );
};

export default PriceChart;
