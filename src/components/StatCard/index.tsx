/**
 * StatCard Component
 * Displays a statistic with comparison to previous period
 * Performance optimization: Memoized to prevent re-renders when props unchanged
 */
import { FC, memo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
  Chip,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RemoveIcon from '@mui/icons-material/Remove';

export interface StatCardProps {
  /** Stat label */
  label: string;
  /** Current value */
  value: string | number;
  /** Previous period value for comparison */
  previousValue?: string | number;
  /** Optional description */
  description?: string;
  /** Loading state */
  loading?: boolean;
  /** Optional test ID */
  'data-testid'?: string;
}

/**
 * Memoized StatCard component
 * Only re-renders when props actually change
 */
export const StatCard: FC<StatCardProps> = memo(({
  label,
  value,
  previousValue,
  description,
  loading = false,
  'data-testid': dataTestId,
}) => {
  // Calculate change if previous value provided
  const getChange = () => {
    if (!previousValue || typeof value !== 'number' || typeof previousValue !== 'number') {
      return null;
    }

    const change = value - previousValue;
    const percentChange = previousValue !== 0 ? (change / previousValue) * 100 : 0;

    return {
      value: change,
      percent: percentChange,
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
    };
  };

  const change = getChange();

  return (
    <Card data-testid={dataTestId}>
      <CardContent>
        {loading ? (
          <>
            <Skeleton width="50%" height={20} sx={{ mb: 1 }} />
            <Skeleton width="70%" height={36} sx={{ mb: 1 }} />
            {description && <Skeleton width="90%" height={16} />}
          </>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {label}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: description ? 1 : 0,
              }}
            >
              <Typography
                variant="h5"
                component="div"
                data-testid={dataTestId ? `${dataTestId}-value` : undefined}
              >
                {value}
              </Typography>
              {change && (
                <Chip
                  icon={
                    change.direction === 'up' ? (
                      <TrendingUpIcon />
                    ) : change.direction === 'down' ? (
                      <TrendingDownIcon />
                    ) : (
                      <RemoveIcon />
                    )
                  }
                  label={`${change.percent > 0 ? '+' : ''}${change.percent.toFixed(1)}%`}
                  size="small"
                  color={
                    change.direction === 'up'
                      ? 'success'
                      : change.direction === 'down'
                        ? 'error'
                        : 'default'
                  }
                  sx={{
                    fontWeight: 600,
                  }}
                />
              )}
            </Box>
            {description && (
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
});
