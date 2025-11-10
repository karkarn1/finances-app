/**
 * Account Detail Page - View account details, balance history, and holdings
 */

import { FC, useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  fetchAccountById,
  fetchAccountValues,
  createAccountValue,
  updateAccountValue,
  deleteAccountValue,
  deleteAccount,
  selectSelectedAccount,
  selectAccountValues,
  selectAccountsLoading,
  selectAccountsError,
  clearError,
  setSelectedAccount,
  clearAccountValues,
} from '@/store/slices/accountsSlice';
import {
  fetchHoldings,
  createHolding,
  updateHolding,
  deleteHolding,
  selectAllHoldings,
  selectHoldingsLoading,
  selectHoldingsError,
  clearHoldings,
} from '@/store/slices/holdingsSlice';
import {
  searchSecuritiesAsync,
  selectSearchResults,
  selectIsSearching,
} from '@/store/slices/securitiesSlice';
import type { AccountValueCreate, HoldingCreate, Security } from '@/types';
import {
  formatCurrency,
  formatDateShort,
  getAccountTypeLabel,
  formatNumber,
} from '@/utils';

const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AccountDetail: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const account = useAppSelector(selectSelectedAccount);
  const accountValues = useAppSelector(selectAccountValues);
  const loading = useAppSelector(selectAccountsLoading);
  const error = useAppSelector(selectAccountsError);
  const holdings = useAppSelector(selectAllHoldings);
  const holdingsLoading = useAppSelector(selectHoldingsLoading);
  const holdingsError = useAppSelector(selectHoldingsError);
  const securities = useAppSelector(selectSearchResults);
  const searchingSecurities = useAppSelector(selectIsSearching);

  const [valueDialogOpen, setValueDialogOpen] = useState(false);
  const [holdingDialogOpen, setHoldingDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<string | null>(null);
  const [editingHolding, setEditingHolding] = useState<string | null>(null);

  const [valueFormData, setValueFormData] = useState<AccountValueCreate>({
    balance: 0,
  });

  const [holdingFormData, setHoldingFormData] = useState<HoldingCreate>({
    security_id: '',
    timestamp: new Date().toISOString(),
    shares: 0,
    average_price_per_share: 0,
  });

  const [selectedSecurity, setSelectedSecurity] = useState<Security | null>(null);
  const [securitySearchQuery, setSecuritySearchQuery] = useState('');

  useEffect(() => {
    if (id) {
      void dispatch(fetchAccountById(id));
      void dispatch(fetchAccountValues(id));
    }
    return () => {
      dispatch(setSelectedAccount(null));
      dispatch(clearAccountValues());
      dispatch(clearHoldings());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (account?.is_investment_account && id) {
      void dispatch(fetchHoldings(id));
    }
  }, [account?.is_investment_account, id, dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [error, dispatch]);

  useEffect(() => {
    if (securitySearchQuery.trim().length >= 1) {
      const timer = setTimeout(() => {
        void dispatch(searchSecuritiesAsync(securitySearchQuery.trim()));
      }, 300);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [securitySearchQuery, dispatch]);

  const chartData = useMemo(() => {
    return accountValues
      .slice()
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((value) => ({
        date: formatDateShort(value.timestamp),
        balance: value.balance,
        cashBalance: value.cash_balance ?? undefined,
      }));
  }, [accountValues]);

  const holdingsChartData = useMemo(() => {
    return holdings.map((holding, index) => ({
      name: holding.security?.symbol || 'Unknown',
      value: holding.market_value || holding.shares * holding.average_price_per_share,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [holdings]);

  const totalHoldingsValue = useMemo(() => {
    return holdings.reduce(
      (sum, holding) => sum + (holding.market_value || holding.shares * holding.average_price_per_share),
      0
    );
  }, [holdings]);

  const handleOpenValueDialog = (valueId?: string) => {
    if (valueId) {
      const value = accountValues.find((v) => v.id === valueId);
      if (value) {
        setEditingValue(valueId);
        const newFormData: AccountValueCreate = {
          timestamp: value.timestamp,
          balance: value.balance,
        };
        if (value.cash_balance !== undefined && value.cash_balance !== null) {
          newFormData.cash_balance = value.cash_balance;
        }
        setValueFormData(newFormData);
      }
    } else {
      setEditingValue(null);
      const newFormData: AccountValueCreate = {
        balance: account?.current_balance || 0,
      };
      if (account?.is_investment_account && account?.current_cash_balance !== undefined) {
        newFormData.cash_balance = account.current_cash_balance;
      }
      setValueFormData(newFormData);
    }
    setValueDialogOpen(true);
  };

  const handleCloseValueDialog = () => {
    setValueDialogOpen(false);
    setEditingValue(null);
    setValueFormData({ balance: 0 });
  };

  const handleSubmitValue = async () => {
    if (!id) return;

    try {
      if (editingValue) {
        await dispatch(
          updateAccountValue({
            accountId: id,
            valueId: editingValue,
            data: valueFormData,
          })
        ).unwrap();
      } else {
        await dispatch(
          createAccountValue({
            accountId: id,
            data: valueFormData,
          })
        ).unwrap();
      }
      handleCloseValueDialog();
      void dispatch(fetchAccountById(id));
    } catch (err) {
      console.error('Failed to save account value:', err);
    }
  };

  const handleDeleteValue = async (valueId: string) => {
    if (!id) return;
    try {
      await dispatch(deleteAccountValue({ accountId: id, valueId })).unwrap();
      void dispatch(fetchAccountById(id));
    } catch (err) {
      console.error('Failed to delete account value:', err);
    }
  };

  const handleOpenHoldingDialog = (holdingId?: string) => {
    if (holdingId) {
      const holding = holdings.find((h) => h.id === holdingId);
      if (holding) {
        setEditingHolding(holdingId);
        setHoldingFormData({
          security_id: holding.security_id,
          timestamp: holding.timestamp,
          shares: holding.shares,
          average_price_per_share: holding.average_price_per_share,
        });
        setSelectedSecurity(holding.security || null);
      }
    } else {
      setEditingHolding(null);
      setHoldingFormData({
        security_id: '',
        timestamp: new Date().toISOString(),
        shares: 0,
        average_price_per_share: 0,
      });
      setSelectedSecurity(null);
      setSecuritySearchQuery('');
    }
    setHoldingDialogOpen(true);
  };

  const handleCloseHoldingDialog = () => {
    setHoldingDialogOpen(false);
    setEditingHolding(null);
    setHoldingFormData({
      security_id: '',
      timestamp: new Date().toISOString(),
      shares: 0,
      average_price_per_share: 0,
    });
    setSelectedSecurity(null);
    setSecuritySearchQuery('');
  };

  const handleSubmitHolding = async () => {
    if (!id || !holdingFormData.security_id) return;

    try {
      if (editingHolding) {
        await dispatch(
          updateHolding({
            accountId: id,
            holdingId: editingHolding,
            data: holdingFormData,
          })
        ).unwrap();
      } else {
        await dispatch(
          createHolding({
            accountId: id,
            data: holdingFormData,
          })
        ).unwrap();
      }
      handleCloseHoldingDialog();
      void dispatch(fetchHoldings(id));
      void dispatch(fetchAccountById(id));
    } catch (err) {
      console.error('Failed to save holding:', err);
    }
  };

  const handleDeleteHolding = async (holdingId: string) => {
    if (!id) return;
    try {
      await dispatch(deleteHolding({ accountId: id, holdingId })).unwrap();
      void dispatch(fetchAccountById(id));
    } catch (err) {
      console.error('Failed to delete holding:', err);
    }
  };

  const handleDeleteAccount = async () => {
    if (!id) return;
    try {
      await dispatch(deleteAccount(id)).unwrap();
      navigate('/accounts');
    } catch (err) {
      console.error('Failed to delete account:', err);
    }
  };

  const handleSecuritySelect = (security: Security) => {
    setSelectedSecurity(security);
    setHoldingFormData({
      ...holdingFormData,
      security_id: security.in_database === false ? security.symbol : security.id,
    });
    setSecuritySearchQuery(security.symbol);
  };

  if (loading && !account) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!account) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Account not found</Alert>
        <Button onClick={() => navigate('/accounts')} sx={{ mt: 2 }}>
          Back to Accounts
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
            <IconButton onClick={() => navigate(`/accounts/${id}/edit`)}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => setDeleteDialogOpen(true)} color="error">
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {(error || holdingsError) && (
        <Alert severity="error" sx={{ mb: 3 }} data-testid="error-alert">
          {error || holdingsError}
        </Alert>
      )}

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

      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Balance Over Time</Typography>
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            onClick={() => handleOpenValueDialog()}
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
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
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
                          <IconButton
                            size="small"
                            onClick={() => handleOpenValueDialog(value.id)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteValue(value.id)}
                          >
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

      {account.is_investment_account && (
        <>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Holdings</Typography>
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                onClick={() => handleOpenHoldingDialog()}
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
                            <Typography variant="body2">
                              {formatDateShort(holding.timestamp)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            {formatNumber(holding.shares, 4)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(holding.average_price_per_share)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(
                              holding.market_value ||
                                holding.shares * holding.average_price_per_share
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenHoldingDialog(holding.id)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteHolding(holding.id)}
                              >
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
        </>
      )}

      {/* Add/Edit Balance Dialog */}
      <Dialog open={valueDialogOpen} onClose={handleCloseValueDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingValue ? 'Edit Balance' : 'Add Balance'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!editingValue && (
              <TextField
                label="Date"
                type="datetime-local"
                value={valueFormData.timestamp || new Date().toISOString().slice(0, 16)}
                onChange={(e) =>
                  setValueFormData({
                    ...valueFormData,
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
              value={valueFormData.balance}
              onChange={(e) =>
                setValueFormData({
                  ...valueFormData,
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
                value={valueFormData.cash_balance || ''}
                onChange={(e) => {
                  const newFormData = { ...valueFormData };
                  if (e.target.value) {
                    newFormData.cash_balance = parseFloat(e.target.value);
                  } else {
                    delete newFormData.cash_balance;
                  }
                  setValueFormData(newFormData);
                }}
                fullWidth
                inputProps={{ step: 0.01 }}
                data-testid="cash-balance-input"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseValueDialog}>Cancel</Button>
          <Button onClick={handleSubmitValue} variant="contained" data-testid="submit-balance">
            {editingValue ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Holding Dialog */}
      <Dialog open={holdingDialogOpen} onClose={handleCloseHoldingDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingHolding ? 'Edit Holding' : 'Add Holding'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Holding Date"
              type="datetime-local"
              value={
                holdingFormData.timestamp
                  ? new Date(holdingFormData.timestamp).toISOString().slice(0, 16)
                  : new Date().toISOString().slice(0, 16)
              }
              onChange={(e) =>
                setHoldingFormData({
                  ...holdingFormData,
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
              onChange={(e) => setSecuritySearchQuery(e.target.value)}
              fullWidth
              required
              disabled={!!editingHolding}
              helperText={
                selectedSecurity
                  ? `Selected: ${selectedSecurity.symbol} - ${selectedSecurity.name}`
                  : 'Search for a security'
              }
              data-testid="security-search-input"
            />
            {!editingHolding && searchingSecurities && (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={24} />
              </Box>
            )}
            {!editingHolding && securities.length > 0 && (
              <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                {securities.slice(0, 5).map((security) => (
                  <Button
                    key={security.id}
                    fullWidth
                    onClick={() => handleSecuritySelect(security)}
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
              value={holdingFormData.shares}
              onChange={(e) =>
                setHoldingFormData({
                  ...holdingFormData,
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
              value={holdingFormData.average_price_per_share}
              onChange={(e) =>
                setHoldingFormData({
                  ...holdingFormData,
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
          <Button onClick={handleCloseHoldingDialog}>Cancel</Button>
          <Button
            onClick={handleSubmitHolding}
            variant="contained"
            disabled={!holdingFormData.security_id}
            data-testid="submit-holding"
          >
            {editingHolding ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Account?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &quot;{account.name}&quot;? This will also delete all
            balance history and holdings. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteAccount} color="error" variant="contained">
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AccountDetail;
