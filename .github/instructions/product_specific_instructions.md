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
### Test steps help
- In the test steps wherever the portal word is mentioned, it refers to the staging portal: `https://staging-ncus.vistaqa.com:451/`