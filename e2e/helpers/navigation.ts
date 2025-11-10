import { Page } from '@playwright/test';

/**
 * Navigation helpers for Finance Manager E2E tests
 */

export class NavigationHelper {
  constructor(private page: Page) {}

  async login(email: string, password: string) {
    await this.page.goto('/');
    await this.page.fill('input[type="text"], input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button:has-text("Log in")');

    // Wait for dashboard to load
    await this.page.waitForSelector('h2:has-text("Dashboard")');
  }

  async navigateToDashboard() {
    await this.page.click('button:has-text("Dashboard")');
    await this.page.waitForSelector('h2:has-text("Dashboard")');
  }

  async navigateToAccounts() {
    await this.page.click('button:has-text("Accounts")');
    await this.page.waitForSelector('h2:has-text("Account Management")');
  }

  async navigateToHoldings() {
    await this.page.click('button:has-text("Holdings")');
    await this.page.waitForSelector('h2:has-text("Portfolio Holdings")');
  }

  async navigateToRebalancing() {
    await this.page.click('button:has-text("Rebalancing")');
    await this.page.waitForSelector('h2:has-text("Portfolio Rebalancing")');
  }

  async navigateToExpenses() {
    await this.page.click('button:has-text("Expenses")');
    await this.page.waitForSelector('h2:has-text("Recurring Expenses")');
  }

  async navigateToIncome() {
    await this.page.click('button:has-text("Income")');
    await this.page.waitForSelector('h2:has-text("Recurring Income")');
  }

  async navigateToGoals() {
    await this.page.click('button:has-text("Goals")');
    await this.page.waitForSelector('h2:has-text("Financial Goals")');
  }

  async navigateToSettings() {
    await this.page.click('button:has-text("Settings")');
    await this.page.waitForSelector('h2:has-text("Settings")');
  }
}
