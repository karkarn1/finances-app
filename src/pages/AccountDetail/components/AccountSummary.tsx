/**
 * AccountSummary Component
 * Displays current balance and cash balance cards using shared SummaryCard component
 */
import { FC } from 'react';
import { Grid } from '@mui/material';
import { SummaryCard } from '@/components';
import { formatCurrency } from '@/utils';
import type { AccountDetailed } from '@/types';

interface AccountSummaryProps {
  account: AccountDetailed;
}

export const AccountSummary: FC<AccountSummaryProps> = ({ account }) => {
  const balanceSections = [
    {
      items: [
        {
          label: 'Current Balance',
          value:
            account.current_balance !== undefined
              ? formatCurrency(account.current_balance)
              : '—',
          valueBold: true,
        },
      ],
    },
  ];

  const cashBalanceSections = [
    {
      items: [
        {
          label: 'Cash Balance',
          value:
            account.current_cash_balance !== undefined
              ? formatCurrency(account.current_cash_balance)
              : '—',
          valueBold: true,
        },
      ],
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} md={6}>
        <SummaryCard
          title="Current Balance"
          sections={balanceSections}
          data-testid="current-balance-card"
        />
      </Grid>
      {account.is_investment_account && (
        <Grid item xs={12} md={6}>
          <SummaryCard
            title="Cash Balance"
            sections={cashBalanceSections}
            data-testid="cash-balance-card"
          />
        </Grid>
      )}
    </Grid>
  );
};
