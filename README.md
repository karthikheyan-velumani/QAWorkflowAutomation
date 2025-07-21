# QA Workflow Automation

This project automates test cases from Azure DevOps using Playwright.

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure the `.env` file with your Azure DevOps credentials:
   ```
   AZURE_DEVOPS_PAT=your_personal_access_token
   AZURE_DEVOPS_ORG=your_organization_name
   AZURE_DEVOPS_PROJECT=your_project_name
   AZURE_DEVOPS_API_VERSION=7.0
   ```

## Features

1. **Fetch Test Cases**: Retrieve test cases from Azure DevOps using Test Plan ID and Test Suite ID.
2. **Generate Test Steps**: Convert Azure DevOps test steps into markdown files.
3. **Automate Tests**: Implement test scripts using Playwright with Model Context Protocol.

## Usage

### Fetch Test Cases from Azure DevOps
```
npm run convert azure <test-plan-id> <test-suite-id> ./test-steps
```

### Run Tests
```
npx playwright test [test-file-path]
```

## Implemented Tests

1. **TC627129_vista-web-login-and-expense.spec.ts**: Automates the process of logging into the Vista web portal and navigating to the Expense page.

2. **TC627345_vista-web-login-and-timecard.spec.ts**: Automates the process of logging into the Vista web portal and navigating to the Timecard page.

## Helper Methods

The project includes helper methods in the `src/helpers` directory to standardize common operations:

- **authHelper.ts**: Contains the `loginToPortal()` method for logging into the Vista web portal.

## Locators and Element References

All element locators have been verified using Playwright's Model Context Protocol (MCP) to ensure reliable test automation.
