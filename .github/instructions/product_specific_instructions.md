# Product-Specific Test Instructions

This document contains product-specific test automation instructions and examples.

## Authentication

### Login Helper Usage
For any test requiring login, use the `loginToPortal` helper from `src/helpers/authHelper.ts`:

```typescript
import { loginToPortal } from '../../src/helpers/authHelper';

test('Your Test Name', async ({ page }) => {
    // Login with default credentials (Employee: 100, Password: test1)
    await loginToPortal(page);
    
    // Or login with specific credentials
    await loginToPortal(page, 'employee123', 'customPassword');
    
    // Continue with test-specific steps...
});
```

## Common Page Elements

### Login Form Elements
- Employee ID field: Use `page.getByRole('textbox', { name: 'Employee ID' })`
- Password field: Use `page.getByRole('textbox', { name: 'Password' })`
- Sign In button: Use `page.getByRole('button', { name: 'Sign In', exact: true })`

### Navigation Elements
```typescript
// Main navigation menu
const mainMenu = page.getByRole('button', { name: 'Employee Tools' });

// Common page header elements
const pageHeader = page.getByRole('banner');
const userInfo = page.getByText(/Employee #/);
```

## Page-Specific Wait Conditions

### Login Page
```typescript
// Wait for login form to be ready
await page.waitForLoadState('networkidle');
await expect(page.getByRole('heading', { name: 'Employee Login' })).toBeVisible();

// After login submission
await Promise.all([
    page.waitForLoadState('networkidle'),
    page.waitForURL('**/home'),
    page.getByRole('navigation').waitFor({ state: 'visible' })
]);
```

### Dashboard Page
```typescript
// Wait for dashboard elements
await page.waitForLoadState('networkidle');
await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
await expect(page.getByRole('grid')).toBeVisible();
```

## Common Verification Patterns

### Login Verification
```typescript
async function verifyLoginSuccess(page: Page) {
    // URL verification
    await expect(page).toHaveURL(/.*\/home/);
    
    // Navigation structure verification
    await expect(page.getByRole('navigation')).toBeVisible();
    
    // Critical UI element verification
    const mainMenu = await getUniqueElement(
        page.getByRole('button', { name: 'Employee Tools' }),
        'Main navigation menu'
    );
    await expect(mainMenu).toBeVisible();
    
    // Verify logged-out state is not present
    await expect(page.getByRole('button', { name: /sign in/i }))
        .not.toBeVisible();
}
```

## Environment-Specific Configurations

### Development Environment
- Base URL: https://dev.example.com
- Default test account: Employee #100
- Extended timeout: 45 seconds

### Staging Environment
- Base URL: https://staging.example.com
- Default test account: Employee #200
- Extended timeout: 30 seconds

### Production Environment
- Base URL: https://example.com
- Test accounts must be requested from admin team
- Standard timeout: 30 seconds
