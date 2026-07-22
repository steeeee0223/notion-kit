# Table View Unit Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Audit every existing table-view unit/component test for behavioral value, replace weak coverage with meaningful contracts, and enforce global Vitest statement and branch coverage of at least 90%.

**Architecture:** Keep the current jsdom/Vitest component-object style, but organize new tests around product contracts rather than source files or coverage lines. Pure plugin conversion/formatting logic uses table-driven tests; real menu, cell, layout, row-view, and state interactions use render helpers and semantic component objects. Coverage is measured after each domain and the final threshold is enabled only after the suite naturally exceeds it.

**Tech Stack:** Vitest 4.1.8, V8 coverage, React Testing Library 16.3, user-event 14.6, jsdom 29.1, TypeScript 6.0.3, pnpm 11.0.8, Node.js 24.11.1.

## Global Constraints

- Run Node.js through nvm `24.11.1` and invoke pnpm only as `$NVM_BIN/pnpm` with store `/Users/awen/Documents/Codex/.pnpm-store`.
- Apply `testing-strategy`: every test catches a production bug, documents a non-obvious contract, guards a regression, or validates interaction between real components.
- Classify every pre-existing test as Keep, Rewrite, Merge, Remove, or Add, with a concrete reason.
- Global Vitest thresholds are `statements: 90` and `branches: 90`; functions and lines remain diagnostic only.
- Include all runtime `src/**/*.{ts,tsx}` code. Do not exclude a component or branch because it is difficult to test.
- Exclude only test helpers, test files, pure type declarations, and barrel modules with no executable logic.
- Use `TestUnit_Scenario_ExpectedOutcome` names and Arrange/Act/Assert structure.
- Write a failing test before any product-code correction.

---

### Task 1: Create the test-value audit and establish reproducible coverage evidence

**Files:**
- Create: `packages/table-view/src/__tests__/test-audit.md`
- Modify: `packages/table-view/src/__tests__/README.md`

**Interfaces:**
- Produces: a complete audit row for each existing test and exact baseline/reproduction commands.
- Consumes: all `*.test.tsx` files and the existing 59.1% statements / 47.35% branches baseline.

- [ ] **Step 1: Enumerate every existing test name**

Run:

```bash
rg -n 'it(?:\.each)?\(|test(?:\.each)?\(' packages/table-view/src --glob '*.test.tsx'
```

Copy each concrete or parameterized case into the audit. A parameterized test receives one row if every row proves the same contract; otherwise split it before classification.

- [ ] **Step 2: Write the audit table with non-generic reasons**

Use this schema:

```markdown
| File | Test | Decision | Value rule | Evidence / required change |
| --- | --- | --- | --- | --- |
| `tools/toolbar.test.tsx` | `Toolbar_SortTrigger_ExposesMenuSemantics` | Keep | Non-obvious accessibility contract | Fails if trigger loses `menu` semantics used by keyboard and Playwright locators. |
| `menus/row-action-menu.test.tsx` | `RowActionMenu_Open_ShowsActions` | Merge | Duplicated by result tests | Merge labels into duplicate/delete/copy-link outcome tests; labels alone cannot prove actions work. |
```

Every reason must name the bug or contract; reject reasons such as "adds coverage" or "useful test".

- [ ] **Step 3: Reproduce baseline with declared diagnostics**

Run:

```bash
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
source "$NVM_DIR/nvm.sh"
nvm use 24.11.1 --silent
node --version
$NVM_BIN/pnpm --version
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store store path
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-view coverage
```

Expected baseline: 116 tests pass; statements approximately 59.1%, branches approximately 47.35%. Record actual values if the worktree has changed.

- [ ] **Step 4: Correct README commands and audit policy**

Document the real `coverage` script name, the two required thresholds, and the Keep/Rewrite/Merge/Remove/Add rubric. Remove stale `test:coverage` wording.

- [ ] **Step 5: Commit the audit artifact**

```bash
git add packages/table-view/src/__tests__/test-audit.md packages/table-view/src/__tests__/README.md
git commit -m "test(table-view): audit existing test value"
```

### Task 2: Strengthen shared test harnesses without encoding DOM structure

**Files:**
- Modify: `packages/table-view/src/__tests__/mock.ts`
- Modify: `packages/table-view/src/__tests__/component-objects/render-table-view.tsx`
- Modify: `packages/table-view/src/__tests__/component-objects/table-view.ts`
- Modify: `packages/table-view/src/__tests__/component-objects/menu-surface.ts`
- Create: `packages/table-view/src/__tests__/component-objects/header-menu.ts`
- Create: `packages/table-view/src/__tests__/component-objects/footer.ts`
- Modify: relevant existing component objects only when a new behavior needs them.
- Test: `packages/table-view/src/__tests__/component-objects.test.tsx`

**Interfaces:**
- Produces: deterministic full-plugin fixture, controlled resource probes, row-order/group/footer helpers, and semantic header/footer actions.
- Consumes: real `TableView`, `DEFAULT_PLUGINS`, roles and accessible names.

- [ ] **Step 1: Write a failing harness contract test**

```tsx
it("TableViewObject_ResultHelpers_ReportRowsGroupsAndFooter", async () => {
  const table = renderTableView({
    defaultData: fullPluginData,
    defaultProperties: fullPluginProperties,
  });

  expect(table.rowNames()).toEqual(["Alpha", "Empty", "Omega"]);
  expect(table.group("Active").rowNames()).toEqual(["Alpha"]);
  expect(table.footer("Score").button()).toHaveAccessibleName(/calculate/i);
});
```

- [ ] **Step 2: Verify failure before adding helpers**

Run the single test. Expected: FAIL because result helpers and full fixture are absent.

- [ ] **Step 3: Add deterministic full-plugin data and resource probes**

Mirror the E2E fixture's fixed values. Extend `renderTableView` to optionally expose `onDataChange`, `onPropertiesChange`, and `onViewChange` spies while continuing to apply `change.next`; do not add hidden shared state between tests.

- [ ] **Step 4: Add semantic result helpers**

Implement helpers that derive row names from `role=row`, groups from visible group headings, footer cells from the corresponding accessible header/name relationship, and menus from heading/item semantics. A helper must throw a descriptive error when the contract is missing.

- [ ] **Step 5: Run harness contract and existing suite**

Expected: the new contract and all pre-existing tests PASS.

- [ ] **Step 6: Commit harness improvements**

```bash
git add packages/table-view/src/__tests__/mock.ts packages/table-view/src/__tests__/component-objects packages/table-view/src/__tests__/component-objects.test.tsx
git commit -m "test(table-view): strengthen component test harness"
```

### Task 3: Exhaustively cover plugin conversion and formatting contracts

**Files:**
- Create: `packages/table-view/src/plugins/plugins.test.tsx`
- Create: `packages/table-view/src/plugins/date/utils.test.ts`
- Modify: product plugin files only if a failing contract reveals a defect.

**Interfaces:**
- Consumes: `title()`, `text()`, `number()`, `checkbox()`, `select()`, `multiSelect()`, `email()`, `phone()`, `url()`, `date()`, `createdTime()`, `lastEditedTime()`, and date utilities.
- Produces: value conversion, comparison, grouping, and display-format boundaries for every default plugin.

- [ ] **Step 1: Add table-driven scalar conversion tests**

```tsx
it.each([
  ["title null", title(), null, ""],
  ["text number", text(), 42, "42"],
  ["number invalid", number(), "not-a-number", null],
  ["number zero", number(), 0, "0"],
  ["checkbox input", checkbox(), "truthy", false],
  ["url input", url(), 42, "42"],
])("PluginFromValue_%s_ReturnsCanonicalData", (_name, plugin, input, expected) => {
  expect(plugin.fromValue(input, plugin.default.config, baseRow)).toEqual(expected);
});
```

Separate `toValue` tests must explicitly protect number zero, empty strings, null selection, multi-select order, and link strings.

- [ ] **Step 2: Add comparison boundary tests**

For text/title/link, number, checkbox, select, multi-select, date, created-time, and last-edited-time, assert less/equal/greater plus null/empty-last behavior. Tests call the real plugin comparator with rows, not copied comparison code.

- [ ] **Step 3: Add transfer/grouping tests**

Cover text-to-select conversion with trimming, duplicates, empty tokens, and single vs multi selection; existing select config preservation; unsupported type fallback; multi-select first-tag grouping; empty date grouping; fixed created/edited date grouping.

- [ ] **Step 4: Add date formatting and range boundaries**

Cover no start, start only, start/end, includeTime, 12/24-hour, full/relative formats supported by the product, same-day ranges, timezone, and invalid ordering. Assert exact canonical strings under fixed timezone/fake timers.

- [ ] **Step 5: Run plugin tests and fix defects test-first**

Expected: tests pass after minimal product corrections. In particular, confirm whether number zero survives `toValue`; if it does not, keep the regression test and change the truthiness check to an explicit empty/null check.

- [ ] **Step 6: Measure domain coverage**

Run full coverage. Expected: plugin utility/plugin files materially increase; record uncovered lines that still require real component interaction.

- [ ] **Step 7: Commit plugin contracts**

```bash
git add packages/table-view/src/plugins
git commit -m "test(table-view): cover plugin value contracts"
```

### Task 4: Cover every cell editor's real interaction and boundary behavior

**Files:**
- Create: `packages/table-view/src/plugins/title/title-cell.test.tsx`
- Create: `packages/table-view/src/plugins/text/text-cell.test.tsx`
- Create: `packages/table-view/src/plugins/number/number-cell.test.tsx`
- Create: `packages/table-view/src/plugins/checkbox/checkbox-cell.test.tsx`
- Create: `packages/table-view/src/plugins/link/link-cell.test.tsx`
- Create: `packages/table-view/src/plugins/date/date-cell/date-cell.test.tsx`
- Strengthen: existing select menu/config tests.
- Modify: product cell files only for test-demonstrated defects.

**Interfaces:**
- Consumes: real `renderTableView` and semantic cell/menu objects.
- Produces: edit, clear, cancel, commit, keyboard, invalid-input, read-only, and display contracts for all cells.

- [ ] **Step 1: Add title/text commit and cancellation tests**

Cover double/click activation as implemented, Enter/blur commit, Escape cancel, clearing, row icon shown/hidden config, empty placeholder, and exact `data.cell.update` previous/next payload.

- [ ] **Step 2: Add number editor table tests**

Cover zero, negative, decimal, invalid text, empty-to-null, blur/Enter/Escape, comma/currency/percent formats, round 0–5/default, number/bar/ring displays, divide-by zero/normal boundary, and show-number toggle.

- [ ] **Step 3: Add checkbox and link tests**

Checkbox must toggle once per user action and expose its accessible state. Email/phone/url editors cover valid/empty input, link target generation, displayed text, copy/open behavior where owned by the component, and cancel vs commit.

- [ ] **Step 4: Add date editor tests**

Cover empty-to-date, single/range, include-time, start/end editing, clearing, invalid/boundary range, calendar navigation, 12/24-hour input, Escape cancel, and exact resource payload.

- [ ] **Step 5: Strengthen select tests**

Retain create/filter/replace/accumulate/delete/rename/color/sort contracts, merge pure presence tests, add empty/backspace and duplicate validation assertions, and assert exact rows changed when an option is renamed/deleted.

- [ ] **Step 6: Run cell suites and full regression**

Expected: all tests pass; failures in value shape or callback payload are fixed in product logic rather than test adapters.

- [ ] **Step 7: Commit cell contracts**

```bash
git add packages/table-view/src/plugins packages/table-view/src/__tests__/component-objects
git commit -m "test(table-view): cover cell editor behavior"
```

### Task 5: Replace superficial menu tests with result-bearing contracts

**Files:**
- Strengthen: `packages/table-view/src/menus/*.test.tsx`
- Create: `packages/table-view/src/menus/prop-menu.test.tsx`
- Create: `packages/table-view/src/menus/calc-menu.test.tsx`
- Modify: menu product files only for demonstrated defects.
- Update: `packages/table-view/src/__tests__/test-audit.md`

**Interfaces:**
- Consumes: existing menu component objects and controlled resource probes.
- Produces: all implemented table/header/property/row menu actions with state/result assertions.

- [ ] **Step 1: Merge label-only tests into action tests**

For each audit row marked Merge/Rewrite, preserve label/search assertions only inside the nearest result-bearing test. Examples: row action labels belong in duplicate/delete/copy outcomes; property type labels belong in create/change-type outcomes; grouping labels belong in membership outcomes.

- [ ] **Step 2: Add property menu outcomes**

Test type change and title guard, sort order, grouped membership, count result, freeze/unfreeze state, hide/restore, wrap, insert left/right position, duplicate data/config, delete/restore, and locked disabled behavior. Assert exact `properties.*` action payloads.

- [ ] **Step 3: Add calculation outcome matrix**

```tsx
it.each([
  ["all", "Count all", "3"],
  ["values", "Count values", "2"],
  ["unique", "Unique values", "2"],
  ["empty", "Empty", "1"],
  ["nonempty", "Not empty", "2"],
])("CalcMenu_%s_DisplaysExpectedResult", async (_method, label, result) => {
  const table = renderFullTable();
  await table.footer("Score").choose(label);
  expect(table.footer("Score").button()).toHaveTextContent(result);
});
```

Add zero-row and checkbox checked/unchecked/percentage cases, plus update-after-edit/add/delete.

- [ ] **Step 4: Strengthen row and group outcomes**

Test icon update/remove/upload, open/current/new-tab URL guards, clipboard, duplicate new ID, delete target, shortcuts, add-above/below, group add/visibility/aggregation/delete confirmation, locked absence, and search behavior.

- [ ] **Step 5: Re-run audit and delete only fully subsumed tests**

Mark each rewritten/merged/removed row with the replacement test name. No deletion is complete until the stronger replacement passes.

- [ ] **Step 6: Run menus and coverage**

Expected: menus pass and coverage for `src/menus`, `src/common`, `src/table-footer`, and row action code materially increases.

- [ ] **Step 7: Commit menu contracts and audit updates**

```bash
git add packages/table-view/src/menus packages/table-view/src/common packages/table-view/src/table-footer packages/table-view/src/__tests__/test-audit.md
git commit -m "test(table-view): replace menu smoke tests with outcomes"
```

### Task 6: Cover table, list, board, row-view, header, footer, and DnD state transitions

**Files:**
- Strengthen: `packages/table-view/src/table-contexts/table-view-reactivity.test.tsx`
- Create: `packages/table-view/src/table-body/table-body.test.tsx`
- Create: `packages/table-view/src/table-header/table-header.test.tsx`
- Create: `packages/table-view/src/table-footer/table-footer.test.tsx`
- Create: `packages/table-view/src/list-view/list-view.test.tsx`
- Create: `packages/table-view/src/board-view/board-view.test.tsx`
- Create: `packages/table-view/src/row-view/row-view.test.tsx`
- Modify: product files only for test-demonstrated defects.

**Interfaces:**
- Consumes: deterministic full table, controlled resource probes, mocked geometry only at the browser boundary.
- Produces: layout, locking, navigation, pinned/visibility/sizing, grouped rendering, aggregate, and deterministic DnD transition contracts.

- [ ] **Step 1: Cover table body/header/footer boundaries**

Test empty body, first/last/only row, grouped vs flat rows, pinned and hidden columns, resizing start/end payload, column reorder payload, footer hidden/visible rules, and live count refresh.

- [ ] **Step 2: Cover list layout**

Assert title fallback, visible properties, row open, add row, lock hides add, empty list, and changes reflected after controlled parent updates.

- [ ] **Step 3: Cover board layout**

Assert select/checkbox/date/empty group columns, card membership, add to group, group visibility, aggregation, lock disables mutation, empty board, card move/group transition, and board DnD updater payload.

- [ ] **Step 4: Cover row views**

Test center/side/full rendering, first/last navigation disabling, previous/next transitions, close action, missing/opened deleted row guard, view property rendering, row-view mode changes, and URL absent/present. In `row-view.test.tsx`, exercise the SSR guard by temporarily deleting `globalThis.window` with `vi.stubGlobal`, calling the exported URL/open behavior through the table instance, asserting no throw/open call, and restoring globals after the test.

- [ ] **Step 5: Cover DnD hooks as state contracts**

Call table/hook drag-end handlers with deterministic active/over IDs. Assert no-op for missing/self targets and exact move payload for valid row, column, board card, and group moves. Do not simulate browser pointer geometry in jsdom.

- [ ] **Step 6: Run layout suites and coverage**

Expected: all suites pass and previously low board/list/date/row-view/table-body/header/footer files have behavior-based execution.

- [ ] **Step 7: Commit layout and transition contracts**

```bash
git add packages/table-view/src/table-contexts packages/table-view/src/table-body packages/table-view/src/table-header packages/table-view/src/table-footer packages/table-view/src/list-view packages/table-view/src/board-view packages/table-view/src/row-view
git commit -m "test(table-view): cover layouts views and transitions"
```

### Task 7: Close only meaningful coverage gaps and enable the 90% gate

**Files:**
- Modify: the exact test files created or strengthened in Tasks 3–6.
- Modify: the corresponding runtime files under `packages/table-view/src/plugins`, `menus`, `common`, `table-body`, `table-header`, `table-footer`, `list-view`, `board-view`, or `row-view` only when a new failing test proves a defect or dead branch.
- Modify: `packages/table-view/vitest.config.ts`
- Finalize: `packages/table-view/src/__tests__/test-audit.md`

**Interfaces:**
- Consumes: JSON coverage report and completed audit.
- Produces: passing global 90% statement/branch thresholds without runtime-source exclusions.

- [ ] **Step 1: Generate machine-readable gap list**

Run full coverage and inspect `packages/table-view/coverage/coverage-final.json`. Rank uncovered branches by production risk: resource mutation and guards first, display variants second, unreachable/dead code last.

- [ ] **Step 2: Add one focused failing test per remaining meaningful contract**

For each gap, write a test whose name states the scenario and outcome, run it alone to prove failure, then make the smallest product correction if needed. Never assert private variables or duplicate implementation logic.

- [ ] **Step 3: Remove dead or unreachable product code**

When a branch cannot occur through public inputs and has no defensive value, demonstrate that through call sites/types, delete it, and run affected tests. Do not add `istanbul ignore`, `v8 ignore`, or file exclusions.

- [ ] **Step 4: Repeat coverage until both natural metrics exceed 90%**

Expected before adding gates: statements >=90% and branches >=90%. Keep a small margin where possible so rounding does not make the suite flaky.

- [ ] **Step 5: Enable exact Vitest thresholds**

```ts
coverage: {
  provider: "v8",
  reporter: ["text", "json", ["html", { subdir: "coverage" }]],
  include: ["src/**/*.{ts,tsx}"],
  exclude: ["src/__tests__/**", "src/**/*.test.{ts,tsx}"],
  thresholds: {
    statements: 90,
    branches: 90,
  },
},
```

Do not add component-specific runtime exclusions. Verify whether Vitest already excludes test files by default; retain the explicit test-file exclusion only to keep the denominator stable and documented.

- [ ] **Step 6: Complete the audit evidence**

Ensure every original test has a final Keep/Rewrite/Merge/Remove row, every non-Keep row names its replacement or deletion reason, and every added suite has at least one value-rule reason.

- [ ] **Step 7: Run final package gates**

Run:

```bash
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-view test
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-view coverage
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-view typecheck
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-view lint
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-view format
```

Expected: every command exits 0 and coverage reports statements/branches >=90%.

- [ ] **Step 8: Commit the final gate**

```bash
git add packages/table-view
git commit -m "test(table-view): enforce 90 percent unit coverage"
```
