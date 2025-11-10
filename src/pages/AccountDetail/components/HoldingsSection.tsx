/**
 * HoldingsSection Component
 * Displays holdings table and pie chart
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
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatDateShort, formatNumber } from '@/utils';
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
      {holdingsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : holdings.length > 0 ? (
        <>
          <TableContainer sx={{ mb: 4 }}>
            <Table data-testid="holdings-table">
              <TableHead>
                <TableRow>
                  <TableCell>Security</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Shares</TableCell>
                  <TableCell align="right">Avg Price</TableCell>
                  <TableCell align="right">Market Value</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {holdings
                  .slice()
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((holding) => (
                    <TableRow key={holding.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {holding.security?.symbol || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {holding.security?.name || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatDateShort(holding.timestamp)}</Typography>
                      </TableCell>
                      <TableCell align="right">{formatNumber(holding.shares, 4)}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(holding.average_price_per_share)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(
                          holding.market_value || holding.shares * holding.average_price_per_share
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => onEdit(holding.id)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => onDelete(holding.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography variant="body1" fontWeight="bold">
                      Total
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" fontWeight="bold">
                      {formatCurrency(totalHoldingsValue)}
                    </Typography>
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

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
      ) : (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
          No holdings yet. Add your first holding to track your investments.
        </Typography>
      )}
    </Paper>
  );
};
