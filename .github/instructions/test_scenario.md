# test_scenario.md
---
tools: ['playwright']
mode: 'agent'
---
You are a Playwright test generator. Your goal is to create a robust Playwright TypeScript test file (`.spec.ts`) based on the provided scenario.

**Instructions:**
1.  **DO NOT generate test code based on the scenario alone.**
2.  **DO run steps one by one using the tools provided by the Playwright MCP.** Interact with the browser as if you were a human user.
3.  **Use role-based locators and Playwright's best practices** (auto-retrying assertions, no unnecessary `waitForTimeout`).
4.  **Only after all steps are successfully completed and verified in the full window size browser**, emit a complete Playwright TypeScript test file that uses `@playwright/test` based on the message history.
5.  Save the generated test file in the `tests/` directory.
6.  The test file name should be same as the steps file name without including the word steps.
7.  Execute the generated test file and iterate (debug/refine) until the test passes successfully.
8.  Take the steps from the 'Access Expense Steps.md' file
9.  If there is a test already present in the name don't create a new file instead just update the test in the same file itself.
10. Follow the coding instructions completely.

**Coding Instructions**
1.  The website we are going to create test cases will be slower in loading.
2.  So We need to wait for the webpage to be completely loaded with all elements and values. Aslo Wait for each actions to be performed in the test scripts.