---
applyTo: '**'
---
You are given a set of instructions to create test scripts based on the test steps generated with the help of test actions. Finally executing all the tests. Follow these steps strictly:


# Create Test Scripts
- Test Script name should be the same as the test step name but the file extension should be `.spec.md`.
- Use Exact keyword for buttons and links to ensure the correct element is selected.
- Use timeout of 15 seconds for each locator to ensure elements are loaded before interacting with them.

# Run Test Scipts
- After creating the test scripts, run all the test scripts using the Playwright Test Runner.
- Ensure that all tests pass successfully.