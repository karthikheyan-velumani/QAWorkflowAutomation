# Test Automation Process

This document outlines the general process and best practices for creating automated tests from Azure DevOps test cases. For product-specific instructions, please refer to [Product Specific Instructions](product_specific_instructions.md).

## Prerequisites
- Ensure `.env` is configured with proper Azure DevOps credentials:
  - AZURE_DEVOPS_PAT
  - AZURE_DEVOPS_ORG
  - AZURE_DEVOPS_PROJECT
  - AZURE_DEVOPS_API_VERSION

## Helper Methods

The project includes reusable helper methods in `src/helpers` to standardize common operations across tests. Always use helper methods when available to ensure consistency and reduce code duplication.

## Steps

1. **Fetch Test Cases from Azure DevOps**
   ```bash
   npm run convert azure <test-plan-id> <test-suite-id> ./test-steps
   ```
   - Creates step files in the test-steps directory, named based on test case title and ID

2. **Verify and Capture Using Playwright MCP**
   - For each step in the test case:
     1. Use appropriate MCP tool to verify the action:
        ```typescript
        // Example MCP verifications:
        browser_navigate({ url: 'https://example.com' });
        browser_snapshot(); // Get element references
        browser_click({ ref: 'e123', element: 'Submit button' });
        ```
     2. Capture element references from browser_snapshot responses
     3. Document the element reference to use in test script

3. **Create Test Scripts**
   - Create a `.spec.ts` file in `tests` directory matching steps file name
   - Import and use helper methods for common operations:
     ```typescript
     import { test, expect } from '@playwright/test';
     import { loginToPortal } from '../../src/helpers/authHelper';

     test('Your Test Name', async ({ page }) => {
         // Use login helper instead of implementing login steps
         await loginToPortal(page);

         // Continue with test-specific steps using MCP-verified locators
         await page.locator('[aria-ref="e123"]').click();
         
         // For navigation/state changes, use appropriate waits
         await page.waitForURL('**/expected-path');
         await expect(page.getByRole('heading')).toBeVisible();
     });
     ```
   - Verify with the same selectors used in MCP:
     ```typescript
     // Verify using MCP-verified ref
     await expect(page.locator('[aria-ref="e789"]')).toBeVisible();
     ```
        });
        ```

4. **Test Environment Considerations**
     - Always start with global timeouts from config
     - Apply standard waits for every interaction:
       - Wait for elements to be visible and enabled
       - Wait for network idle after navigation
       - Wait for loading indicators to disappear
       - Wait for route changes to complete
       - Wait for dynamic content to load
       - Wait for DOM updates to complete
     - Document any elements that consistently need longer timeouts
     - Monitor and log timing-related issues
     - Consider environment-specific timing factors

5. **Execute and Validate Tests**
   ```bash
   npx playwright test <test-file-path>
   ```
   - Run tests immediately after creation
   - Debug any failures and adjust waiting conditions
   - Verify all assertions pass consistently

## Best Practices

1. **Element Selectors**
   - Prefer unique, stable locators in this order of priority:
     1. Test ID (data-testid) - Most reliable:
        ```typescript
        page.getByTestId('submit-button')
        ```
     2. Role with name - Good for semantic elements:
        ```typescript
        // Always include exact: true when using name to avoid partial matches
        page.getByRole('button', { name: 'Submit', exact: true })
        ```
     3. Label - Good for form fields:
        ```typescript
        page.getByLabel('Username', { exact: true })
        ```
     4. Placeholder - For input fields:
        ```typescript
        page.getByPlaceholder('Enter username', { exact: true })
        ```
     
   - Avoid these anti-patterns:
     ```typescript
     // ❌ Too generic, might match multiple elements
     page.getByRole('button')
     page.getByText('Sign In')
     
     // ❌ Brittle, breaks if structure changes
     page.locator('div > button').nth(2)
     
     // ❌ Not reliable, text might change
     page.locator('button:has-text("Sign")')
     ```
     
   - Make selectors more specific:
     ```typescript
     // ✅ Specific and unique
     page.getByRole('button', { name: 'Sign In', exact: true })
     page.getByRole('textbox', { name: 'Username *', exact: true })
     ```

   - When multiple similar elements exist:
     ```typescript
     // ✅ Use parent containers for context
     const form = page.getByRole('form', { name: 'Login Form' });
     await form.getByRole('button', { name: 'Sign In', exact: true }).click();
     
     // ✅ Use aria-label or other distinguishing attributes
     page.getByRole('button', { name: 'Sign In', exact: true })
         .filter({ hasText: 'with Employee #' })
     ```

   - Document ambiguous elements:
     ```typescript
     // Add comments explaining why a specific selector was chosen
     // This button appears multiple times, using exact name and filter to get employee login
     const employeeLoginBtn = page
       .getByRole('button', { name: 'Sign In', exact: true })
       .filter({ hasText: 'Employee #' });
     ```

2. **MCP Verification Best Practices**
   - When using MCP tools to verify elements:
     1. Take a snapshot before interacting with elements
     2. Analyze the page structure for unique identifiers
     3. Note any duplicate elements with similar attributes
     4. Document required waiting conditions
     5. Test different selector strategies before implementation

3. **Element Verification**
   - Always verify element uniqueness:
     ```typescript
     // Add assertions to verify element count when needed
     await expect(page.getByRole('button', { name: 'Sign In' }))
       .toHaveCount(1, { message: 'Expected exactly one Sign In button' });
     ```

   - Add helper functions for common patterns:
     ```typescript
     async function verifyUniqueElement(locator, description) {
       const count = await locator.count();
       if (count > 1) {
         throw new Error(`Found ${count} elements matching ${description}. Selector is not specific enough.`);
       }
     }
     ```

4. **Waiting Strategies**
   - Begin with global timeouts in playwright.config.ts
   - Every element interaction must include:
     ```typescript
     // Basic wait pattern for all elements
     await element.waitFor({ state: 'visible' });
     await element.waitFor({ state: 'enabled' });
     ```
   - Navigation actions must wait for completion:
     ```typescript
     await page.goto(url, { waitUntil: 'networkidle' });
     await waitForPageLoad(page);
     ```
   - Click actions that cause page changes:
     ```typescript
     await Promise.all([
       page.waitForLoadState('networkidle'),
       element.click()
     ]);
     ```
   - Only add custom timeouts when global ones are insufficient
   - Document any deviations from standard wait patterns

3. **Test Structure**
   - One test case per file
   - Clear, descriptive test names
   - Test should be named along with the testcase_id as same as the step name
   - Comments explaining complex waiting or verification steps
   - Handle cleanup if needed (e.g., logging out)

4. **Assertions**
   - Verify each critical step
   - Include meaningful error messages
   - Check for success indicators
   - Validate proper page/state transitions

5. **Error Handling**
   - Add retry logic for flaky operations
   - Include proper error messages
   - Handle cleanup in case of failures

## Maintenance

1. **Regular Updates**
   - Update test scripts when application changes
   - Keep locators current
   - Adjust timeouts if application performance changes
   - Review and update waiting strategies as needed

2. **Documentation**
   - Keep test step files in sync with Azure DevOps
   - Document any special handling required
   - Note environment-specific configurations

5. **Text-Based Selector Strategies**
   
   When dealing with text-based selectors, follow these guidelines to create robust tests:

   a. **Exact vs Partial Text Matching**
   ```typescript
   // ❌ Avoid relying on exact text that might include whitespace
   page.getByRole('button', { name: 'Sign In', exact: true })
   
   // ✅ Use filter with regex for precise text matching
   page.getByRole('button').filter({ hasText: /^Sign In$/ })
   
   // ✅ Use partial text matching for dynamic content
   page.getByRole('heading').filter({ hasText: 'Welcome' })
   ```

   b. **Verification Strategy**
   ```typescript
   // ❌ Don't rely on specific welcome messages that might change
   await expect(page.getByText('Welcome, John!')).toBeVisible();
   
   // ✅ Verify page state through stable UI elements
   await expect(page.getByRole('navigation')).toBeVisible();
   await expect(page.getByRole('button', { name: 'Employee Tools' })).toBeVisible();
   ```

   c. **Complex Text Patterns**
   ```typescript
   // ❌ Avoid direct text matches with special characters
   page.getByText('Employee # Login')
   
   // ✅ Use contains or regex for special characters
   page.getByRole('button').filter({ hasText: 'Employee #' })
   ```

   d. **Dynamic Content Handling**
   ```typescript
   // ❌ Don't assume specific text order or format
   page.getByText('John Doe - ID: 12345')
   
   // ✅ Use multiple assertions for parts of the content
   const userElement = page.getByText(/John Doe/);
   await expect(userElement).toBeVisible();
   await expect(userElement).toContainText('ID:');
   ```

6. **Selector Debugging Best Practices**
   
   When a selector fails, follow these debugging steps:

   a. Use the `getUniqueElement` helper:
   ```typescript
   const submitButton = await getUniqueElement(
     page.getByRole('button', { name: 'Sign In' }),
     'Submit button in login form'
   );
   ```

   b. Debug selector issues:
   ```typescript
   // Add debug logging for ambiguous selectors
   const elements = await page
     .getByRole('button', { name: 'Sign In' })
     .evaluateAll(els => 
       els.map(el => ({
         text: el.textContent,
         classes: el.className,
         attributes: Object.fromEntries(
           Array.from(el.attributes).map(attr => 
             [attr.name, attr.value]
           )
         )
       }))
     );
   console.log('Found elements:', elements);
   ```

   c. Document selector decisions:
   ```typescript
   // Add comments explaining selector strategy
   // Using partial text match due to inconsistent whitespace in button text
   const loginButton = await getUniqueElement(
     page.getByRole('button').filter({ hasText: 'Employee #' }),
     'Employee login button'
   );
   ```

7. **Verification Strategies**
   
   Use a combination of checks to verify page state:

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

8. **Test Helper Functions**
   - Create reusable functions for common test patterns
   - Examples:
     - Login/logout sequences
     - Data setup and teardown
     - Common navigation paths
