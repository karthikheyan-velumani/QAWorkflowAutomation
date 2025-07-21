import { test, expect } from '@playwright/test';
import { loginToPortal } from '../src/helpers/authHelper';

test.describe('Vista Web Login and Open Expense page', () => {
    test('should access expense page successfully', async ({ page }) => {
        // Step 1: Navigate to login page and login using helper method
        await loginToPortal(page);

        // Step 2: Go to Employee Tools > Expenses
        // Click on Employee Tools
        await page.getByRole('link', { name: 'Employee Tools' }).click();

        // Wait for the dropdown menu to appear and click Expenses
        const expensesLink = page.getByRole('link', { name: 'Expenses' });
        await expect(expensesLink).toBeVisible();
        await expensesLink.click();

        // Wait for the expenses page to load completely and verify
        await expect(page).toHaveURL(/.*expensereport/);
        await expect(page.getByRole('heading', { name: 'Submit Expense' })).toBeVisible();

        // Close the browser after verification
        const browser = page.context().browser();
        if (browser) {
            await browser.close();
        }
    });
});
