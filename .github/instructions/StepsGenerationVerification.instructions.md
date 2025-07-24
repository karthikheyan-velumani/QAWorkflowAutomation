---
applyTo: '**'
---
You are given a set of instructions to generate test steps from Azure DevOps and then execute the steps with playwright MCP and store the actions in a file for reference. Before and After completing each step ensure that you have followed these steps strictly.

**1. Create Test Steps**
Run the cli.ts to generate test steps from Azure DevOps

**2. Verify Test Steps**
- Run the Steps using playwright MCP.
- Verify each and every step for each test case.
- Close the browser after the final test is verified.
- Run and verify all the test cases one by one.(e.g. if there are 5 test cases, run and verify them using playwright MCP one after another)

**3. Store Test Actions**
- The test action here referred is the actual playwright code used by the playright MCP in the verification
- Store the test actions in a .md file format for future reference.
- All the actions which are actually taken into the test flow should be stored.
- Failed actions should not be included.
- Store the test actions as the same file name as test step but with "actions" added a different extension (e.g., .actions.md) in the 'test-actions' directory.