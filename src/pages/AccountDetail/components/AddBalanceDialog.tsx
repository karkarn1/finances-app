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
  Box,
} from '@mui/material';
import { useZodForm } from '@/hooks';
import { accountValueCreateSchema, type AccountValueCreateInput } from '@/schemas';
import { FormTextField } from '@/components/Form';
import type { AccountDetailed } from '@/types';

interface AddBalanceDialogProps {
  open: boolean;
  isEditing: boolean;
  account: AccountDetailed;
  initialData?: AccountValueCreateInput;
  onClose: () => void;
  onSubmit: (data: AccountValueCreateInput) => void;
}

export const AddBalanceDialog: FC<AddBalanceDialogProps> = ({
  open,
  isEditing,
  account,
  initialData,
  onClose,
  onSubmit,
}) => {
  const { control, handleSubmit, reset } = useZodForm(accountValueCreateSchema, {
    defaultValues: initialData || {
      timestamp: new Date().toISOString().slice(0, 16),
      balance: 0,
      cash_balance: undefined,
    },
  });

  const handleFormSubmit = (data: AccountValueCreateInput) => {
    onSubmit(data);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Edit Balance' : 'Add Balance'}</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!isEditing && (
              <FormTextField
                name="timestamp"
                control={control}
                label="Date"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
              />
            )}
            <FormTextField
              name="balance"
              control={control}
              label="Balance"
              type="number"
              required
              inputProps={{ step: 0.01 }}
              data-testid="balance-input"
            />
            {account.is_investment_account && (
              <FormTextField
                name="cash_balance"
                control={control}
                label="Cash Balance"
                type="number"
                inputProps={{ step: 0.01 }}
                data-testid="cash-balance-input"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" data-testid="submit-balance">
            {isEditing ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
