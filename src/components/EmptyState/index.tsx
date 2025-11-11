/**
 * EmptyState Component
 * Displays a consistent empty/no-data state with icon, message, and optional action
 * Performance optimization: Memoized to prevent re-renders when props unchanged
 */
import { FC, ReactNode, memo } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

export interface EmptyStateProps {
  /** Icon to display (defaults to InboxIcon) */
  icon?: ReactNode;
  /** Primary message */
  message: string;
  /** Optional secondary description */
  description?: string;
  /** Optional action button text */
  actionLabel?: string;
  /** Action button click handler */
  onAction?: () => void;
  /** Optional custom icon color */
  iconColor?: string;
  /** Optional test ID */
  'data-testid'?: string;
}

/**
 * Memoized EmptyState component
 * Only re-renders when props actually change
 */
export const EmptyState: FC<EmptyStateProps> = memo(({
  icon,
  message,
  description,
  actionLabel,
  onAction,
  iconColor = 'text.secondary',
  'data-testid': dataTestId,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 6,
        textAlign: 'center',
        bgcolor: 'background.default',
        border: '1px dashed',
        borderColor: 'divider',
      }}
      data-testid={dataTestId}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box
          sx={{
            fontSize: '4rem',
            color: iconColor,
            opacity: 0.5,
          }}
        >
          {icon || <InboxIcon fontSize="inherit" />}
        </Box>
        <Typography
          variant="h6"
          color="text.secondary"
          data-testid={dataTestId ? `${dataTestId}-message` : undefined}
        >
          {message}
        </Typography>
        {description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: 400 }}
          >
            {description}
          </Typography>
        )}
        {actionLabel && onAction && (
          <Button
            variant="contained"
            onClick={onAction}
            sx={{ mt: 1 }}
            data-testid={dataTestId ? `${dataTestId}-action` : undefined}
          >
            {actionLabel}
          </Button>
        )}
      </Box>
    </Paper>
  );
});
