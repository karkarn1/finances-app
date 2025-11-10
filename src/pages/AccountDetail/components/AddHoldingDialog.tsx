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
import type { HoldingCreate, Security } from '@/types';

interface AddHoldingDialogProps {
  open: boolean;
  isEditing: boolean;
  formData: HoldingCreate;
  selectedSecurity: Security | null;
  securitySearchQuery: string;
  searchingSecurities: boolean;
  securities: Security[];
  onClose: () => void;
  onSubmit: () => void;
  onChange: (data: HoldingCreate) => void;
  onSecuritySearchChange: (query: string) => void;
  onSecuritySelect: (security: Security) => void;
}

export const AddHoldingDialog: FC<AddHoldingDialogProps> = ({
  open,
  isEditing,
  formData,
  selectedSecurity,
  securitySearchQuery,
  searchingSecurities,
  securities,
  onClose,
  onSubmit,
  onChange,
  onSecuritySearchChange,
  onSecuritySelect,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Edit Holding' : 'Add Holding'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Holding Date"
            type="datetime-local"
            value={
              formData.timestamp
                ? new Date(formData.timestamp).toISOString().slice(0, 16)
                : new Date().toISOString().slice(0, 16)
            }
            onChange={(e) =>
              onChange({
                ...formData,
                timestamp: new Date(e.target.value).toISOString(),
              })
            }
            fullWidth
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
                  onClick={() => onSecuritySelect(security)}
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
          <TextField
            label="Shares"
            type="number"
            value={formData.shares}
            onChange={(e) =>
              onChange({
                ...formData,
                shares: parseFloat(e.target.value),
              })
            }
            fullWidth
            required
            inputProps={{ step: 0.0001 }}
            data-testid="shares-input"
          />
          <TextField
            label="Average Price Per Share"
            type="number"
            value={formData.average_price_per_share}
            onChange={(e) =>
              onChange({
                ...formData,
                average_price_per_share: parseFloat(e.target.value),
              })
            }
            fullWidth
            required
            inputProps={{ step: 0.01 }}
            data-testid="avg-price-input"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={!formData.security_id}
          data-testid="submit-holding"
        >
          {isEditing ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
