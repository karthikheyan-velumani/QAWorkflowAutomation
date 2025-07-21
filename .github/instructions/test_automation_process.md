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
   - For each step in the test step:
     1. Use appropriate MCP tool to verify the action
     2. Capture element references from browser_snapshot responses
     3. Document the element reference to use in test script
     4. Analyze element waiting methods at the time of verification using MCP and log that to execute at test script creation.

3. **Create Test Scripts**
   - Create a `.spec.ts` file in `tests` directory matching steps file name
   - Import and use helper methods for common operations:
   - Verify with the same selectors used in MCP:

4. **Test Environment Considerations**
     - Always start with global timeouts from config
     - Apply standard waits for every interaction:
       - Wait for elements to be visible and enabled
       - Wait for dynamic content to load
       - Wait for DOM updates to complete

5. **Execute and Validate Tests**
   ```bash
   npx playwright test <test-file-path>
   ```
   - Run tests immediately after creation
   - Debug any failures and adjust waiting conditions
   - Verify all assertions pass consistently