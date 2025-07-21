# test_scenario.md
---
tools: ['playwright']
mode: 'agent'
---
# Configuration
Use the following Azure DevOps config:
- Plan ID: 625330
- Suite ID: 625332

# Prerequisites
1. Review and understand all instructions in test_automation_process.md BEFORE starting any implementation
2. Verify that all helper methods described in test_automation_process.md are available
3. Ensure .env is configured properly with:
   - AZURE_DEVOPS_PAT
   - AZURE_DEVOPS_ORG
   - AZURE_DEVOPS_PROJECT
   - AZURE_DEVOPS_API_VERSION

# Required Helper Methods
The following helper methods MUST be used as specified in test_automation_process.md:
1. Helper methods specified in test_automation_process.md that are relevant to the test case

# Implementation Steps
1. First read and understand test_automation_process.md completely

2. IMPORTANT: Use Playwright MCP (Model Context Protocol) to verify and capture element locators:
   - For each step in the test case:
     1. Use MCP tools (browser_navigate, browser_click, browser_type, etc.) to verify the step interactively
     2. Record the exact element references (ref) from the MCP snapshot for each interaction
     3. Use these same element references when implementing the test script
     4. Analayze element waiting strategies at the time of verifying with MCP to implement in Test script creation.
     5. After completing all verification steps, make sure to close the browser

# Steps Execution Order
1. Prerequisites and Configuration
   - Verify all prerequisites are met
   - Check helper methods availability

2. Test Case Retrieval
   - Use the provided Plan ID and Suite ID to fetch test cases
   - Validate the test steps are created in test-steps directory

3. Usage of MCP for test verification
   - For each step in the test step:
     1. Use MCP tools to verify the step interactively
     2. Record exact element references from MCP snapshot
     3. Use these references in test implementation
     4. Close browser after verification

5. Test Validation
   - Run tests to verify implementation
   - Fix any failures

# Important Notes
- ALWAYS check for and use available helper methods before implementing new code
- ALWAYS use MCP for element verification
- ALWAYS include proper waits for navigation
- ALWAYS close browser after MCP verification