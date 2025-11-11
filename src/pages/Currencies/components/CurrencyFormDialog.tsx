/**
 * CurrencyFormDialog Component
 * Reusable dialog for adding currencies
 * Extracted from Currencies page for better maintainability
 */
import { FC, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Box,
} from '@mui/material';

interface CurrencyFormData {
  code: string;
  name: string;
  symbol: string;
  isActive: boolean;
}

interface CurrencyFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CurrencyFormData) => void;
  isSubmitting: boolean;
}

export const CurrencyFormDialog: FC<CurrencyFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState<CurrencyFormData>({
    code: '',
    name: '',
    symbol: '',
    isActive: true,
  });

  const [formErrors, setFormErrors] = useState<{
    code?: string;
    name?: string;
    symbol?: string;
  }>({});

  // Validate form before submission
  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};
    let isValid = true;

    // Validate code (3 uppercase letters)
    const codePattern = /^[A-Z]{3}$/;
    if (!formData.code) {
      errors.code = 'Code is required';
      isValid = false;
    } else if (!codePattern.test(formData.code)) {
      errors.code = 'Code must be exactly 3 uppercase letters';
      isValid = false;
    }

    // Validate name
    if (!formData.name || formData.name.trim().length === 0) {
      errors.name = 'Name is required';
      isValid = false;
    } else if (formData.name.length > 100) {
      errors.name = 'Name must be 100 characters or less';
      isValid = false;
    }

    // Validate symbol
    if (!formData.symbol || formData.symbol.trim().length === 0) {
      errors.symbol = 'Symbol is required';
      isValid = false;
    } else if (formData.symbol.length > 10) {
      errors.symbol = 'Symbol must be 10 characters or less';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    onSubmit(formData);
  };

  const handleFormChange = (field: keyof CurrencyFormData, value: string | boolean) => {
    setFormData({
      ...formData,
      [field]: value,
    });
    // Clear error for this field
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [field]: undefined,
      });
    }
  };

  const handleClose = () => {
    setFormData({
      code: '',
      name: '',
      symbol: '',
      isActive: true,
    });
    setFormErrors({});
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      data-testid="currency-dialog"
    >
      <DialogTitle>Add New Currency</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Currency Code"
            value={formData.code}
            onChange={(e) => handleFormChange('code', e.target.value.toUpperCase())}
            error={!!formErrors.code}
            helperText={formErrors.code || 'Enter 3-letter code (e.g., EUR, GBP, JPY)'}
            inputProps={{ maxLength: 3 }}
            data-testid="currency-code-input"
            required
            fullWidth
          />
          <TextField
            label="Currency Name"
            value={formData.name}
            onChange={(e) => handleFormChange('name', e.target.value)}
            error={!!formErrors.name}
            helperText={formErrors.name || 'Full name of the currency'}
            inputProps={{ maxLength: 100 }}
            data-testid="currency-name-input"
            required
            fullWidth
          />
          <TextField
            label="Symbol"
            value={formData.symbol}
            onChange={(e) => handleFormChange('symbol', e.target.value)}
            error={!!formErrors.symbol}
            helperText={formErrors.symbol || 'Currency symbol (e.g., €, £, ¥)'}
            inputProps={{ maxLength: 10 }}
            data-testid="currency-symbol-input"
            required
            fullWidth
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.isActive}
                onChange={(e) => handleFormChange('isActive', e.target.checked)}
                data-testid="currency-active-checkbox"
              />
            }
            label="Active"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          data-testid="create-currency-button"
        >
          {isSubmitting ? 'Creating...' : 'Create Currency'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
