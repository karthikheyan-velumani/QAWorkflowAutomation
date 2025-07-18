import { test, expect } from '@playwright/test';

/**
 * Access Expense Test Suite
 * Based on steps from Access Expense Steps.md
 */
test.describe('Access Expense Test Suite', () => {
    test('should access expense page successfully', async ({ page }) => {
        // Step 1: Navigate to the login page
        await page.goto('https://release-ncus.vistaqa.com:451/account/login');

        // Wait for the login page to load completely
        await expect(page).toHaveTitle('Regression portal');
        await expect(page.getByRole('heading', { name: 'Welcome to the Employee Portal!' })).toBeVisible();

        // Step 2: Click on "Sign In with Employee #" 
        await page.getByRole('button', { name: 'Sign In with Employee #' }).click();

        // Wait for the login modal to appear
        await expect(page.getByRole('heading', { name: 'Employee #' })).toBeVisible();

        // Enter Employee Number 100
        await page.getByRole('spinbutton', { name: 'Employee Number *' }).fill('100');

        // Enter Password test1
        await page.getByRole('textbox', { name: 'Password *' }).fill('test1');

        // Click Sign In button
        await page.getByRole('button', { name: 'Sign In', exact: true }).click();

        // Wait for the home page to load completely
        await expect(page).toHaveURL(/.*home/);
        await expect(page.getByRole('heading', { name: 'Welcome Brent Kuenzi' })).toBeVisible();

        // Step 3: Go to Employee Tools > Expenses
        // Click on Employee Tools
        await page.getByRole('link', { name: 'Employee Tools' }).click();

        // Wait for the dropdown menu to appear
        const expensesLink = page.getByRole('link', { name: 'Expenses' });
        await expect(expensesLink).toBeVisible();

        // Click on Expenses
        await expensesLink.click();

        // Wait for the expenses page to load completely
        await expect(page).toHaveURL(/.*expensereport/);
        await expect(page.getByRole('heading', { name: 'Submit Expense' })).toBeVisible();

        // Step 4: Click New Expense Receipt
        await page.getByRole('button', { name: 'New Expense Receipt' }).click();

        // Step 5: Verify Edit Expense Receipt page opens
        await expect(page).toHaveURL(/.*editexpensereceipt/);
        await expect(page.getByRole('heading', { name: 'Edit Expense Receipt' })).toBeVisible();

        // Verify key elements on the page are visible
        await expect(page.getByText('Receipt Description')).toBeVisible();
        await expect(page.getByText('Transaction Date')).toBeVisible();
        await expect(page.getByText('Vendor')).toBeVisible();
    });
});
