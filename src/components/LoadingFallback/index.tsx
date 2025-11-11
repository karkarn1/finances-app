/**
 * LoadingFallback Component - Skeleton screens for lazy-loaded routes
 * Provides better UX than spinners by showing content-like placeholders
 */

import { FC } from 'react';
import {
  Container,
  Box,
  Skeleton,
  Card,
  CardContent,
  Grid,
} from '@mui/material';

/**
 * Props for LoadingFallback component
 */
interface LoadingFallbackProps {
  /** Type of loading skeleton to display */
  variant?: 'dashboard' | 'detail' | 'list' | 'simple';
}

/**
 * LoadingFallback component with Material-UI Skeletons
 * Matches common page layouts to provide seamless loading experience
 */
export const LoadingFallback: FC<LoadingFallbackProps> = ({ variant = 'simple' }) => {
  if (variant === 'dashboard') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Page header skeleton */}
        <Skeleton variant="text" width="40%" height={50} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="60%" height={24} sx={{ mb: 4 }} />

        {/* Metric cards skeleton */}
        <Grid container spacing={3}>
          {[1, 2, 3].map((index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="rectangular" height={120} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Chart skeleton */}
        <Box sx={{ mt: 4 }}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={300} />
            </CardContent>
          </Card>
        </Box>
      </Container>
    );
  }

  if (variant === 'detail') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header with back button */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
          <Skeleton variant="text" width="50%" height={50} />
        </Box>

        {/* Summary card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              {[1, 2, 3, 4].map((index) => (
                <Grid item xs={6} md={3} key={index}>
                  <Skeleton variant="text" width="80%" height={24} />
                  <Skeleton variant="text" width="60%" height={36} />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Data table skeleton */}
        <Card>
          <CardContent>
            <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
            {[1, 2, 3, 4, 5].map((index) => (
              <Skeleton
                key={index}
                variant="rectangular"
                height={60}
                sx={{ mb: 1 }}
              />
            ))}
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (variant === 'list') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Page header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="40%" height={50} />
            <Skeleton variant="text" width="60%" height={24} />
          </Box>
          <Skeleton variant="rectangular" width={150} height={40} />
        </Box>

        {/* List items */}
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="70%" height={32} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="50%" height={24} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="90%" height={40} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  // Simple variant - minimal loading screen
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Box sx={{ width: '100%', maxWidth: 600 }}>
          <Skeleton variant="text" width="60%" height={60} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="80%" height={30} />
          <Skeleton variant="text" width="70%" height={30} />
        </Box>
      </Box>
    </Container>
  );
};

/**
 * Specialized loading fallback for dashboard pages
 */
export const DashboardLoadingFallback: FC = () => (
  <LoadingFallback variant="dashboard" />
);

/**
 * Specialized loading fallback for detail pages
 */
export const DetailLoadingFallback: FC = () => (
  <LoadingFallback variant="detail" />
);

/**
 * Specialized loading fallback for list pages
 */
export const ListLoadingFallback: FC = () => (
  <LoadingFallback variant="list" />
);

/**
 * Export as default for easy lazy loading
 */
export default LoadingFallback;
