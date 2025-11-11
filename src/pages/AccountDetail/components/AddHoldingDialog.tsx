/**
 * AddHoldingDialog Component
 * Dialog for adding or editing holdings
 */
import { FC } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useZodForm } from '@/hooks';
import { holdingCreateSchema, type HoldingCreateInput } from '@/schemas';
import { FormTextField } from '@/components/Form';
import type { Security } from '@/types';

interface AddHoldingDialogProps {
  open: boolean;
  isEditing: boolean;
  initialData?: HoldingCreateInput;
  selectedSecurity: Security | null;
  securitySearchQuery: string;
  searchingSecurities: boolean;
  securities: Security[];
  onClose: () => void;
  onSubmit: (data: HoldingCreateInput) => void;
  onSecuritySearchChange: (query: string) => void;
  onSecuritySelect: (security: Security) => void;
}

export const AddHoldingDialog: FC<AddHoldingDialogProps> = ({
  open,
  isEditing,
  initialData,
  selectedSecurity,
  securitySearchQuery,
  searchingSecurities,
  securities,
  onClose,
  onSubmit,
  onSecuritySearchChange,
  onSecuritySelect,
}) => {
  const { control, handleSubmit, reset, setValue } = useZodForm(holdingCreateSchema, {
    defaultValues: initialData || {
      security_id: '',
      timestamp: new Date().toISOString(),
      shares: 0,
      average_price_per_share: 0,
    },
  });

  const handleFormSubmit = (data: HoldingCreateInput) => {
    onSubmit(data);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSecuritySelect = (security: Security) => {
    onSecuritySelect(security);
    setValue('security_id', security.id);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Edit Holding' : 'Add Holding'}</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormTextField
              name="timestamp"
              control={control}
              label="Holding Date"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              helperText="The date when this holding was recorded"
              data-testid="holding-date-input"
            />

            <TextField
              label="Security"
              value={securitySearchQuery}
              onChange={(e) => onSecuritySearchChange(e.target.value)}
              fullWidth
              required
              disabled={!!isEditing}
              helperText={
                selectedSecurity
                  ? `Selected: ${selectedSecurity.symbol} - ${selectedSecurity.name}`
                  : 'Search for a security'
              }
              data-testid="security-search-input"
            />

            {!isEditing && searchingSecurities && (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={24} />
              </Box>
            )}

            {!isEditing && securities.length > 0 && (
              <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                {securities.slice(0, 5).map((security) => (
                  <Button
                    key={security.id}
                    fullWidth
                    onClick={() => handleSecuritySelect(security)}
                    sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {security.symbol}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {security.name}
                      </Typography>
                    </Box>
                  </Button>
                ))}
              </Box>
            )}

            <FormTextField
              name="shares"
              control={control}
              label="Shares"
              type="number"
              required
              inputProps={{ step: 0.0001 }}
              data-testid="shares-input"
            />

            <FormTextField
              name="average_price_per_share"
              control={control}
              label="Average Price Per Share"
              type="number"
              required
              inputProps={{ step: 0.01 }}
              data-testid="avg-price-input"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!selectedSecurity}
            data-testid="submit-holding"
          >
            {isEditing ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
