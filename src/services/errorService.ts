import { enqueueSnackbar } from 'notistack';
import { formatErrorMessage, logError } from '@/utils/errorHandler';

/**
 * Service for displaying errors to users via toast notifications.
 */
export const errorService = {
  /**
   * Show error toast notification.
   */
  showError: (error: unknown, context?: string): void => {
    const message = formatErrorMessage(error);
    logError(error, context);
    enqueueSnackbar(message, {
      variant: 'error',
      autoHideDuration: 5000,
    });
  },

  /**
   * Show success toast notification.
   */
  showSuccess: (message: string): void => {
    enqueueSnackbar(message, {
      variant: 'success',
      autoHideDuration: 3000,
    });
  },

  /**
   * Show info toast notification.
   */
  showInfo: (message: string): void => {
    enqueueSnackbar(message, {
      variant: 'info',
      autoHideDuration: 4000,
    });
  },

  /**
   * Show warning toast notification.
   */
  showWarning: (message: string): void => {
    enqueueSnackbar(message, {
      variant: 'warning',
      autoHideDuration: 4000,
    });
  },
};
