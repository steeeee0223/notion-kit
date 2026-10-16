# Testing guidelines

Keep tests focused on observable behavior. Follow these rules when writing tests and component objects:

- Call existing component/page object methods directly. Do not add test-local aliases that only forward the same arguments or rename an existing operation (for example, `setCalculation(table, ...)` wrapping `table.setCalculation(...)`).
- Reuse existing object queries and workflows instead of duplicating their selectors or interaction sequences in a spec. Keep reusable UI ownership and interactions in the corresponding component object.
- Extract a test helper only when it adds meaningful setup, data construction, synchronization, a multi-step workflow, or a shared behavioral assertion. A short function is not inherently redundant; scoped semantic queries belong in component objects.
- Keep the action and expected outcome visible in tests. Assert the behavior named by the test, including prerequisites such as a group boundary; choose an initial state that makes a missing action fail the assertion.
- Browser specs must import `test` and `expect` from the repository's `./fixtures` so automatic coverage collection runs. Import Playwright types separately.
