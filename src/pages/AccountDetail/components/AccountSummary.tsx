/**
 * AccountSummary Component
 * Displays current balance and cash balance cards
 */
import { FC } from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import { formatCurrency } from '@/utils';
import type { AccountDetailed } from '@/types';

interface AccountSummaryProps {
  account: AccountDetailed;
}

export const AccountSummary: FC<AccountSummaryProps> = ({ account }) => {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Current Balance
            </Typography>
            <Typography variant="h4" data-testid="current-balance">
              {account.current_balance !== undefined
                ? formatCurrency(account.current_balance)
                : '—'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      {account.is_investment_account && (
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Cash Balance
              </Typography>
              <Typography variant="h4" data-testid="cash-balance">
                {account.current_cash_balance !== undefined
                  ? formatCurrency(account.current_cash_balance)
                  : '—'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
};
