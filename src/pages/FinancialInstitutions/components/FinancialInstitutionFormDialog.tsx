/**
 * FinancialInstitutionFormDialog Component
 * Reusable dialog for adding or editing financial institutions
 * Extracted from FinancialInstitutions page for better maintainability
 */
import { FC, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import type { FinancialInstitutionCreate } from '@/types';

interface FinancialInstitutionFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FinancialInstitutionCreate) => void;
  initialData: FinancialInstitutionCreate;
  isEditing: boolean;
}

export const FinancialInstitutionFormDialog: FC<FinancialInstitutionFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isEditing,
}) => {
  const [formData, setFormData] = useState<FinancialInstitutionCreate>(initialData);
  const [formErrors, setFormErrors] = useState<{ name?: string; url?: string }>({});

  const validateForm = (): boolean => {
    const errors: { name?: string; url?: string } = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
      setFormErrors(errors);
      return false;
    }

    if (formData.url && formData.url.trim()) {
      try {
        new URL(formData.url);
      } catch {
        errors.url = 'Invalid URL format';
        setFormErrors(errors);
        return false;
      }
    }

    setFormErrors(errors);
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    onSubmit(formData);
  };

  const handleClose = () => {
    setFormErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? 'Edit Institution' : 'Add Institution'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Institution Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={!!formErrors.name}
            helperText={formErrors.name}
            fullWidth
            required
            autoFocus
            data-testid="institution-name-input"
          />
          <TextField
            label="Website (optional)"
            value={formData.url || ''}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            error={!!formErrors.url}
            helperText={formErrors.url || 'e.g., https://www.example.com'}
            fullWidth
            data-testid="institution-url-input"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" data-testid="submit-institution">
          {isEditing ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
