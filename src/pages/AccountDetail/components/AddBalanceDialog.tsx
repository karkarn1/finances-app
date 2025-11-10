/**
 * AddBalanceDialog Component
 * Dialog for adding or editing account balance values
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
} from '@mui/material';
import type { AccountValueCreate, AccountDetailed } from '@/types';

interface AddBalanceDialogProps {
  open: boolean;
  isEditing: boolean;
  account: AccountDetailed;
  formData: AccountValueCreate;
  onClose: () => void;
  onSubmit: () => void;
  onChange: (data: AccountValueCreate) => void;
}

export const AddBalanceDialog: FC<AddBalanceDialogProps> = ({
  open,
  isEditing,
  account,
  formData,
  onClose,
  onSubmit,
  onChange,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Edit Balance' : 'Add Balance'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {!isEditing && (
            <TextField
              label="Date"
              type="datetime-local"
              value={formData.timestamp || new Date().toISOString().slice(0, 16)}
              onChange={(e) =>
                onChange({
                  ...formData,
                  timestamp: e.target.value,
                })
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          )}
          <TextField
            label="Balance"
            type="number"
            value={formData.balance}
            onChange={(e) =>
              onChange({
                ...formData,
                balance: parseFloat(e.target.value),
              })
            }
            fullWidth
            required
            inputProps={{ step: 0.01 }}
            data-testid="balance-input"
          />
          {account.is_investment_account && (
            <TextField
              label="Cash Balance"
              type="number"
              value={formData.cash_balance || ''}
              onChange={(e) => {
                const newFormData = { ...formData };
                if (e.target.value) {
                  newFormData.cash_balance = parseFloat(e.target.value);
                } else {
                  delete newFormData.cash_balance;
                }
                onChange(newFormData);
              }}
              fullWidth
              inputProps={{ step: 0.01 }}
              data-testid="cash-balance-input"
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained" data-testid="submit-balance">
          {isEditing ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
