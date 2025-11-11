/**
 * MetricCard Component
 * Reusable card for displaying key metrics with icon, value, and optional trend
 * Performance optimization: Memoized to prevent re-renders when props unchanged
 */
import { FC, ReactNode, memo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
  CardActionArea,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export interface MetricCardProps {
  /** Title/label for the metric */
  title: string;
  /** Metric value (number or formatted string) */
  value: string | number;
  /** Icon to display */
  icon: ReactNode;
  /** Icon color (hex or theme color) */
  color?: string;
  /** Optional trend data */
  trend?: {
    /** Trend value (e.g., 7.89 for 7.89%) */
    value: number;
    /** Direction of trend */
    direction: 'up' | 'down';
    /** Optional label (e.g., "vs last month") */
    label?: string;
  };
  /** Optional click handler (makes card clickable) */
  onClick?: () => void;
  /** Loading state */
  loading?: boolean;
  /** Optional test ID for testing */
  'data-testid'?: string;
}

/**
 * Memoized MetricCard component
 * Only re-renders when props actually change
 */
export const MetricCard: FC<MetricCardProps> = memo(({
  title,
  value,
  icon,
  color = '#1976d2',
  trend,
  onClick,
  loading = false,
  'data-testid': dataTestId,
}) => {
  const content = (
    <CardContent>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ flex: 1 }}>
          {loading ? (
            <>
              <Skeleton width="60%" height={20} sx={{ mb: 1 }} />
              <Skeleton width="80%" height={40} />
              {trend && <Skeleton width="40%" height={20} sx={{ mt: 1 }} />}
            </>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {title}
              </Typography>
              <Typography
                variant="h4"
                component="div"
                data-testid={dataTestId ? `${dataTestId}-value` : undefined}
              >
                {value}
              </Typography>
              {trend && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mt: 1,
                    gap: 0.5,
                  }}
                >
                  {trend.direction === 'up' ? (
                    <TrendingUpIcon
                      sx={{
                        fontSize: '1rem',
                        color: 'success.main',
                      }}
                    />
                  ) : (
                    <TrendingDownIcon
                      sx={{
                        fontSize: '1rem',
                        color: 'error.main',
                      }}
                    />
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        trend.direction === 'up' ? 'success.main' : 'error.main',
                      fontWeight: 500,
                    }}
                  >
                    {trend.value > 0 ? '+' : ''}
                    {trend.value.toFixed(2)}%
                  </Typography>
                  {trend.label && (
                    <Typography variant="body2" color="text.secondary">
                      {trend.label}
                    </Typography>
                  )}
                </Box>
              )}
            </>
          )}
        </Box>
        <Box
          sx={{
            color,
            fontSize: '3rem',
            ml: 2,
            display: 'flex',
            alignItems: 'center',
            opacity: loading ? 0.3 : 1,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  );

  if (onClick && !loading) {
    return (
      <Card data-testid={dataTestId}>
        <CardActionArea onClick={onClick}>{content}</CardActionArea>
      </Card>
    );
  }

  return <Card data-testid={dataTestId}>{content}</Card>;
});
