import { Page } from '@playwright/test';

export async function loginToPortal(page: Page, employeeNumber: string = '100', password: string = 'test1') {
    // Navigate to login page
    await page.goto("https://release-ncus.vistaqa.com:451/account/login", { waitUntil: 'networkidle' });

    // Click Sign In with Employee # button 
    await page.getByRole('button', { name: 'Sign In with Employee #' }).click();

    // Enter employee number and password
    await page.getByRole('spinbutton', { name: 'Employee Number *' }).fill(employeeNumber);
    await page.getByRole('textbox', { name: 'Password *' }).fill(password);

    // Click Sign In button
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await page.waitForURL('**/home');

    // Verify login was successful by checking for welcome message
    await page.getByRole('heading', { name: /Welcome/ }).waitFor({ state: 'visible' });
}
