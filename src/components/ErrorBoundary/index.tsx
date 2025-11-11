/**
 * ErrorBoundary Component
 *
 * Catches React component errors and displays user-friendly fallback UI.
 * Provides reset/retry functionality and logs errors for debugging.
 */

import { Component, ReactNode, ErrorInfo } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  AlertTitle,
  Container,
} from '@mui/material';
import { Refresh as RefreshIcon, Home as HomeIcon } from '@mui/icons-material';
import { logger } from '@/utils/logger';

export interface FallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  reset: () => void;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | undefined;
  onReset?: (() => void) | undefined;
  FallbackComponent?: React.ComponentType<FallbackProps> | undefined;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Default fallback component displayed when an error occurs
 */
const DefaultFallback: React.FC<FallbackProps> = ({ error, reset }) => {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 600,
            textAlign: 'center',
          }}
        >
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle sx={{ fontSize: '1.25rem', fontWeight: 600 }}>
              Something went wrong
            </AlertTitle>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {error.message || 'An unexpected error occurred'}
            </Typography>
          </Alert>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            We've logged this error and will investigate. Please try refreshing the page or
            return to the home page.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={reset}
              data-testid="error-boundary-reset"
            >
              Try Again
            </Button>
            <Button
              variant="outlined"
              startIcon={<HomeIcon />}
              onClick={handleGoHome}
              data-testid="error-boundary-home"
            >
              Go to Home
            </Button>
          </Box>

          {process.env['NODE_ENV'] === 'development' && (
            <Box
              sx={{
                mt: 4,
                p: 2,
                bgcolor: 'grey.100',
                borderRadius: 1,
                textAlign: 'left',
                overflow: 'auto',
              }}
            >
              <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace' }}>
                <strong>Error Details (Development Only):</strong>
                <br />
                {error.toString()}
                {error.stack && (
                  <>
                    <br />
                    <br />
                    <strong>Stack Trace:</strong>
                    <br />
                    {error.stack}
                  </>
                )}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

/**
 * ErrorBoundary class component
 *
 * Catches errors in child components and displays fallback UI.
 * Supports custom fallback components and reset functionality.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console
    logger.error('[ErrorBoundary] Caught error:', error, errorInfo);

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // TODO: Send to error tracking service
    // if (process.env['NODE_ENV'] === 'production') {
    //   Sentry.captureException(error, {
    //     contexts: {
    //       react: {
    //         componentStack: errorInfo.componentStack,
    //       },
    //     },
    //   });
    // }
  }

  reset = (): void => {
    const { onReset } = this.props;

    // Call custom reset handler if provided
    if (onReset) {
      onReset();
    }

    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  override render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, FallbackComponent } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Use custom FallbackComponent if provided
      if (FallbackComponent) {
        return <FallbackComponent error={error} errorInfo={errorInfo} reset={this.reset} />;
      }

      // Use default fallback
      return <DefaultFallback error={error} errorInfo={errorInfo} reset={this.reset} />;
    }

    return children;
  }
}

export default ErrorBoundary;
