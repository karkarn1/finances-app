/**
 * BalanceHistorySection Component
 * Displays balance history chart and table
 */
import { FC } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency, formatDateShort } from '@/utils';
import type { AccountDetailed, AccountValue } from '@/types';

interface BalanceHistorySectionProps {
  account: AccountDetailed;
  accountValues: AccountValue[];
  chartData: Array<{ date: string; balance: number; cashBalance?: number | undefined }>;
  onAdd: () => void;
  onEdit: (valueId: string) => void;
  onDelete: (valueId: string) => void;
}

export const BalanceHistorySection: FC<BalanceHistorySectionProps> = ({
  account,
  accountValues,
  chartData,
  onAdd,
  onEdit,
  onDelete,
}) => {
  return (
    <>
      {/* Chart */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Balance Over Time</Typography>
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            onClick={onAdd}
            data-testid="add-balance-button"
          >
            Add Balance
          </Button>
        </Box>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value: number) => formatCurrency(value)} />
              <RechartsTooltip
                formatter={(value: number) => formatCurrency(value)}
                labelStyle={{ color: '#000' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#8884d8"
                name="Balance"
                strokeWidth={2}
              />
              {account.is_investment_account && (
                <Line
                  type="monotone"
                  dataKey="cashBalance"
                  stroke="#82ca9d"
                  name="Cash Balance"
                  strokeWidth={2}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
            No balance history yet. Add your first balance entry to see the chart.
          </Typography>
        )}
      </Paper>

      {/* Table */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Balance History
        </Typography>
        {accountValues.length > 0 ? (
          <TableContainer>
            <Table data-testid="balance-history-table">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Balance</TableCell>
                  {account.is_investment_account && (
                    <TableCell align="right">Cash Balance</TableCell>
                  )}
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accountValues
                  .slice()
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((value) => (
                    <TableRow key={value.id}>
                      <TableCell>{formatDateShort(value.timestamp)}</TableCell>
                      <TableCell align="right">{formatCurrency(value.balance)}</TableCell>
                      {account.is_investment_account && (
                        <TableCell align="right">
                          {value.cash_balance !== undefined && value.cash_balance !== null
                            ? formatCurrency(value.cash_balance)
                            : '—'}
                        </TableCell>
                      )}
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => onEdit(value.id)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => onDelete(value.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
            No balance history yet
          </Typography>
        )}
      </Paper>
    </>
  );
};
