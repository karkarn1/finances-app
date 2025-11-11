/**
 * HoldingsSection Component
 * Displays holdings table and pie chart
 */
import { FC } from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatDateShort, formatNumber } from '@/utils';
import { DataTable, DataTableColumn, DataTableAction } from '@/components';
import type { Holding } from '@/types';

interface HoldingsSectionProps {
  holdings: Holding[];
  holdingsLoading: boolean;
  holdingsChartData: Array<{ name: string; value: number; fill: string }>;
  totalHoldingsValue: number;
  onAdd: () => void;
  onEdit: (holdingId: string) => void;
  onDelete: (holdingId: string) => void;
}

export const HoldingsSection: FC<HoldingsSectionProps> = ({
  holdings,
  holdingsLoading,
  holdingsChartData,
  totalHoldingsValue,
  onAdd,
  onEdit,
  onDelete,
}) => {
  // Sort holdings by timestamp (newest first)
  const sortedHoldings = holdings
    .slice()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Define columns for DataTable
  const holdingColumns: DataTableColumn<Holding>[] = [
    {
      label: 'Security',
      render: (holding) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {holding.security?.symbol || 'Unknown'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {holding.security?.name || '—'}
          </Typography>
        </Box>
      ),
    },
    {
      label: 'Date',
      render: (holding) => formatDateShort(holding.timestamp),
    },
    {
      label: 'Shares',
      render: (holding) => formatNumber(holding.shares, 4),
      align: 'right',
    },
    {
      label: 'Avg Price',
      render: (holding) => formatCurrency(holding.average_price_per_share),
      align: 'right',
    },
    {
      label: 'Market Value',
      render: (holding) =>
        formatCurrency(holding.market_value || holding.shares * holding.average_price_per_share),
      align: 'right',
    },
  ];

  // Define actions for DataTable
  const holdingActions: DataTableAction<Holding>[] = [
    {
      icon: <EditIcon fontSize="small" />,
      onClick: (holding) => onEdit(holding.id),
      label: 'Edit',
      color: 'primary',
    },
    {
      icon: <DeleteIcon fontSize="small" />,
      onClick: (holding) => onDelete(holding.id),
      label: 'Delete',
      color: 'error',
    },
  ];

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Holdings</Typography>
        <Button
          startIcon={<AddIcon />}
          variant="outlined"
          onClick={onAdd}
          data-testid="add-holding-button"
        >
          Add Holding
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <DataTable<Holding>
          data={sortedHoldings}
          columns={holdingColumns}
          actions={holdingActions}
          isLoading={holdingsLoading}
          emptyMessage="No holdings yet. Add your first holding to track your investments."
          getRowKey={(holding) => holding.id}
        />
      </Box>

      {/* Total row - shown below the DataTable when holdings exist */}
      {holdings.length > 0 && !holdingsLoading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            mb: 4,
            pr: 2,
            pt: 1,
            borderTop: '2px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="body1" fontWeight="bold" sx={{ mr: 2 }}>
            Total:
          </Typography>
          <Typography variant="body1" fontWeight="bold">
            {formatCurrency(totalHoldingsValue)}
          </Typography>
        </Box>
      )}

      {/* Holdings Allocation Chart */}
      {holdings.length > 0 && !holdingsLoading && (
        <>
          <Typography variant="h6" gutterBottom>
            Holdings Allocation
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={holdingsChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {holdingsChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </>
      )}
    </Paper>
  );
};
