---
applyTo: '**'
---
You are given a set of instructions to create test scripts based on the test steps generated with the help of test actions. Finally executing all the tests. Follow these steps strictly:


# Create Test Scripts
- Use the login helper function to log in before running the test steps - Inside helpers directory.
- If the test actions have words that the user is already logged in, ensure to use the login helper function to log in before running the test steps.
- Use timeout of 15 seconds for each locator to ensure elements are loaded before interacting with them.

# Run Test Scipts
- After creating the test scripts, run all the test scripts using the Playwright Test Runner.
- Ensure that all tests pass successfully.