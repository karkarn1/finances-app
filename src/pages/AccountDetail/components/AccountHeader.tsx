/**
 * AccountHeader Component
 * Displays account name, type, institution, and action buttons (Edit/Delete/Back)
 */
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, IconButton, Chip } from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { getAccountTypeLabel } from '@/utils';
import type { AccountDetailed } from '@/types';

interface AccountHeaderProps {
  account: AccountDetailed;
  onDelete: () => void;
}

export const AccountHeader: FC<AccountHeaderProps> = ({ account, onDelete }) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/accounts')}
        sx={{ mb: 2 }}
        data-testid="back-button"
      >
        Back to Accounts
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4" data-testid="account-name">
              {account.name}
            </Typography>
            {account.is_investment_account && (
              <Chip icon={<TrendingUpIcon />} label="Investment" color="primary" />
            )}
          </Box>
          <Typography variant="body1" color="text.secondary">
            {getAccountTypeLabel(account.account_type)}
            {account.financial_institution && ` • ${account.financial_institution.name}`}
          </Typography>
        </Box>
        <Box>
          <IconButton onClick={() => navigate(`/accounts/${account.id}/edit`)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={onDelete} color="error">
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};
