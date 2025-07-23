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