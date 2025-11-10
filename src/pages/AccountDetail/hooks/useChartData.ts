/**
 * useChartData Hook
 * Transforms account values and holdings into chart-ready data
 */
import { useMemo } from 'react';
import { formatDateShort } from '@/utils';
import type { AccountValue, Holding } from '@/types';

const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const useChartData = (accountValues: AccountValue[], holdings: Holding[]) => {
  const chartData = useMemo(() => {
    return accountValues
      .slice()
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((value) => {
        const result: { date: string; balance: number; cashBalance?: number | undefined } = {
          date: formatDateShort(value.timestamp),
          balance: value.balance,
        };
        if (value.cash_balance !== undefined) {
          result.cashBalance = value.cash_balance;
        }
        return result;
      });
  }, [accountValues]);

  const holdingsChartData = useMemo(() => {
    return holdings.map((holding, index) => {
      const fill = CHART_COLORS[index % CHART_COLORS.length];
      return {
        name: holding.security?.symbol || 'Unknown',
        value: holding.market_value || holding.shares * holding.average_price_per_share,
        fill: fill !== undefined ? fill : '#8884d8',
      };
    });
  }, [holdings]);

  const totalHoldingsValue = useMemo(() => {
    return holdings.reduce(
      (sum, holding) => sum + (holding.market_value || holding.shares * holding.average_price_per_share),
      0
    );
  }, [holdings]);

  return {
    chartData,
    holdingsChartData,
    totalHoldingsValue,
  };
};
