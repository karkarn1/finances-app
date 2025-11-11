/**
 * AccountFormDialog Component
 * Reusable dialog for adding or editing accounts
 * Extracted from Accounts page for better maintainability
 */
import { FC, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Box,
} from '@mui/material';
import type { AccountCreate, AccountType, FinancialInstitution, Currency } from '@/types';
import CurrencySelector from '@/components/CurrencySelector';

interface AccountFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AccountCreate) => void;
  initialData: AccountCreate;
  isEditing: boolean;
  isSubmitting: boolean;
  financialInstitutions: FinancialInstitution[];
  currencies: Currency[];
}

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
  { value: 'tfsa', label: 'TFSA' },
  { value: 'rrsp', label: 'RRSP' },
  { value: 'fhsa', label: 'FHSA' },
  { value: 'margin', label: 'Margin' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'line_of_credit', label: 'Line of Credit' },
  { value: 'payment_plan', label: 'Payment Plan' },
  { value: 'mortgage', label: 'Mortgage' },
];

export const AccountFormDialog: FC<AccountFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isEditing,
  isSubmitting,
  financialInstitutions,
  currencies,
}) => {
  const [formData, setFormData] = useState<AccountCreate>(initialData);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    interest_rate?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: { name?: string; interest_rate?: string } = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
      setFormErrors(errors);
      return false;
    }

    if (
      formData.interest_rate !== undefined &&
      formData.interest_rate !== null &&
      (isNaN(formData.interest_rate) ||
        formData.interest_rate < 0 ||
        formData.interest_rate > 100)
    ) {
      errors.interest_rate = 'Interest rate must be between 0 and 100';
      setFormErrors(errors);
      return false;
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
      <DialogTitle>{isEditing ? 'Edit Account' : 'Add Account'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Account Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={!!formErrors.name}
            helperText={formErrors.name}
            fullWidth
            required
            autoFocus
            data-testid="account-name-input"
          />
          <TextField
            label="Account Type"
            value={formData.account_type}
            onChange={(e) =>
              setFormData({
                ...formData,
                account_type: e.target.value as AccountType,
              })
            }
            select
            fullWidth
            required
            data-testid="account-type-select"
          >
            {ACCOUNT_TYPES.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Financial Institution"
            value={formData.financial_institution_id || ''}
            onChange={(e) => {
              const newFormData = { ...formData };
              if (e.target.value) {
                newFormData.financial_institution_id = e.target.value;
              } else {
                delete newFormData.financial_institution_id;
              }
              setFormData(newFormData);
            }}
            select
            fullWidth
            data-testid="institution-select"
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {financialInstitutions.map((institution) => (
              <MenuItem key={institution.id} value={institution.id}>
                {institution.name}
              </MenuItem>
            ))}
          </TextField>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.is_investment_account || false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    is_investment_account: e.target.checked,
                  })
                }
                data-testid="investment-account-checkbox"
              />
            }
            label="Investment Account"
          />
          <TextField
            label="Interest Rate (APR %)"
            type="number"
            value={formData.interest_rate || ''}
            onChange={(e) => {
              const newFormData = { ...formData };
              if (e.target.value) {
                newFormData.interest_rate = parseFloat(e.target.value);
              } else {
                delete newFormData.interest_rate;
              }
              setFormData(newFormData);
            }}
            error={!!formErrors.interest_rate}
            helperText={formErrors.interest_rate || 'Optional'}
            fullWidth
            inputProps={{ min: 0, max: 100, step: 0.01 }}
            data-testid="interest-rate-input"
          />
          <CurrencySelector
            value={
              formData.currency_id
                ? currencies.find((c) => c.id === formData.currency_id)?.code || null
                : null
            }
            onChange={(code) => {
              const newFormData = { ...formData };
              if (code) {
                const currency = currencies.find((c) => c.code === code);
                if (currency) {
                  newFormData.currency_id = currency.id;
                }
              } else {
                delete newFormData.currency_id;
              }
              setFormData(newFormData);
            }}
            label="Currency"
            helperText="Optional - defaults to USD"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          data-testid="submit-account"
        >
          {isEditing ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
