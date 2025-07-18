import { test, expect } from '@playwright/test';

test.describe('Login Test Suite', () => {
    test('should log in successfully with valid credentials', async ({ page }) => {
        // Step 1: Navigate to the website
        await page.goto('https://practicetestautomation.com/practice-test-login/');

        // Step 2: Enter Username - student
        await page.getByRole('textbox', { name: 'Username' }).fill('student');

        // Step 3: Enter Password - Password123
        await page.getByRole('textbox', { name: 'Password' }).fill('Password123');

        // Step 4: Click Submit button
        await page.getByRole('button', { name: 'Submit' }).click();

        // Step 5: Verify success message is displayed
        // First, check that the URL contains the expected path
        await expect(page).toHaveURL(/.*logged-in-successfully/);

        // Verify the success text is displayed
        const successMessage = page.getByText('Congratulations student. You successfully logged in!');
        await expect(successMessage).toBeVisible();

        // Verify that the Log out button is displayed
        const logoutButton = page.getByRole('link', { name: 'Log out' });
        await expect(logoutButton).toBeVisible();
    });
});
