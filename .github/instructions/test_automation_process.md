# Test Automation Process

This document outlines the general process and best practices for creating automated tests from Azure DevOps test cases. For product-specific instructions, please refer to [Product Specific Instructions](product_specific_instructions.md).

## Helper Methods

The project includes reusable helper methods in `src/helpers` to standardize common operations across tests. Always use helper methods when available to ensure consistency and reduce code duplication.

## Steps

1. **Fetch Test Cases from Azure DevOps**
   ```bash
   npm run convert azure <test-plan-id> <test-suite-id> ./test-steps
   ```
   - Creates step files in the test-steps directory, named based on test case title and ID

2. **Verify and Capture Using Playwright MCP**
   - For each step in the test step:
     1. Use appropriate MCP tool to verify the action
     2. Capture the playwright code used by the MCP tool to use in the test script

3. **Create Test Scripts**
   - Create a `.spec.ts` file in `tests` directory matching steps file name
   - Use networkidle wait doing login
   - for every locators and assertions use timeout of 15 seconds
   - Import and use helper methods for common operations:
   - Verify with the same steps used in MCP:

4. **Test Environment Waiting Considerations - Important**
     - Apply standard waits for every interaction:
     - Use networkidle wait before login
     - Only use networkidle wait before login
     - Use 15 seconds timeout for every locators and assertions.

5. **Execute and Validate Tests**
   ```bash
   npx playwright test <test-file-path>
   ```
   - Run tests immediately after creation
   - Debug any failures and adjust waiting conditions
   - Verify all assertions pass consistently