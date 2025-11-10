import { useState } from 'react';
import { errorService } from '@/services/errorService';
import { formatErrorMessage } from '@/utils/errorHandler';

/**
 * Reusable hook for handling form submission with loading and error states.
 *
 * Handles:
 * - Loading state during submission
 * - Error handling and formatting
 * - Success callback
 * - Automatic error display via toast notifications
 *
 * @template T - Type of the form data being submitted
 * @param onSubmit - Async function to handle the actual submission
 * @param onSuccess - Optional callback to run on successful submission
 *
 * @example
 * const { handleSubmit, isSubmitting, error } = useFormSubmit(
 *   async (data: AccountFormData) => {
 *     await accountsApi.createAccount(data);
 *   },
 *   () => {
 *     closeDialog();
 *     fetchAccounts();
 *   }
 * );
 */
export const useFormSubmit = <T,>(
  onSubmit: (data: T) => Promise<void>,
  onSuccess?: () => void
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: T) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(data);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = formatErrorMessage(err);
      setError(errorMessage);
      errorService.showError(err, 'Form submission');
      console.error('Form submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearError = () => setError(null);

  return {
    handleSubmit,
    isSubmitting,
    error,
    clearError,
  };
};
