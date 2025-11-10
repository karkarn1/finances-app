/**
 * Test user credentials and data for E2E tests
 */

export const testUser = {
  email: 'test@example.com',
  password: 'testpasswd',
  name: 'Alex Johnson',
  username: 'testuser',
};

export const expectedData = {
  netWorth: '$251,401.22',
  totalAssets: '$272,444.01',
  totalDebts: '$21,042.79',
  portfolioValue: '$162,168.90',

  accounts: {
    totalAssets: '$57,770.50',
    totalLiabilities: '$21,340.75',
    totalInvestments: '$214,930.70',
  },

  expenses: {
    totalMonthly: '$3,974.50',
    count: 10,
  },

  income: {
    totalMonthly: '$11,544.00',
    count: 4,
  },

  goals: {
    count: 3,
    achieved: 2,
    inProgress: 1,
  },
};
