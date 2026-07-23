# Table View Unit Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Audit every existing table-view unit/component test for behavioral value, replace weak coverage with meaningful contracts, and enforce global Vitest statement and branch coverage of at least 90%.

**Architecture:** Keep the jsdom/Vitest component-object style and organize tests around product contracts. Pure plugin logic uses table-driven tests; menus, cells, layouts, row views, and state use real component interactions. Enable thresholds only after natural statement and branch coverage both exceed 90%.

**Tech Stack:** Vitest 4.1.8, V8 coverage, React Testing Library 16.3, user-event 14.6, jsdom 29.1, TypeScript 6.0.3, pnpm 11.0.8, Node.js 24.11.1.

## Current implementation state

- Checkpoint commit: `40a79d3e test(table-view): checkpoint unit coverage progress`.
- Latest full evidence:
  - 29 test files passed
  - 251 tests passed
  - statements: 88.10% (`1178/1337`)
  - branches: 82.77% (`639/772`)
  - functions: 83.70%
  - lines: 90.09%
- Package typecheck passes.
- The 90% statement/branch threshold is not enabled.
- `packages/table-view/src/__tests__/test-audit.md` has not been created.
- Lint is not clean. It includes pre-existing product warnings/errors and strict-lint errors in new WIP tests.
- Current high-value gaps are concentrated in board/list DnD, table body/header branches, date-time picker, remaining calculation variants, row-view boundaries, and the audit.

## Global Constraints

- Run Node.js through nvm `24.11.1` and invoke pnpm only as `$NVM_BIN/pnpm` with store `/Users/awen/Documents/Codex/.pnpm-store`.
- Apply `testing-strategy`: every test catches a production bug, documents a non-obvious contract, guards a regression, or validates interaction between real components.
- Classify every pre-existing test as Keep, Rewrite, Merge, Remove, or Add, with a concrete reason.
- Global Vitest thresholds are `statements: 90` and `branches: 90`; functions and lines remain diagnostic only.
- Include all runtime `src/**/*.{ts,tsx}` code. Do not exclude difficult runtime components or branches.
- Exclude only test helpers, test files, pure type declarations, and barrel modules with no executable logic.
- Use `TestUnit_Scenario_ExpectedOutcome` names and Arrange/Act/Assert structure.
- Write a failing test before any product-code correction.

---

### Task 1: Create the test-value audit and establish reproducible coverage evidence

- [ ] **Step 1: Enumerate every existing test name**

  Inventory every concrete and parameterized test under `packages/table-view/src`. A parameterized test receives one audit row only when all cases prove the same contract.

- [ ] **Step 2: Write the audit with concrete value decisions**

  Create `packages/table-view/src/__tests__/test-audit.md` with File, Test, Decision, Value rule, and Evidence/replacement columns. Every Rewrite/Merge/Remove row must name its replacement or exact removal reason.

- [x] **Step 3: Reproduce baseline and current coverage diagnostics**

- [ ] **Step 4: Correct README commands and audit policy**

  Update `packages/table-view/src/__tests__/README.md` with the real `coverage` command, the 90% statement/branch policy, and the Keep/Rewrite/Merge/Remove/Add rubric.

- [ ] **Step 5: Commit the audit artifact**

  Commit only the completed audit and README policy.

### Task 2: Strengthen shared test harnesses without encoding DOM structure

- [ ] **Step 1: Add a failing harness contract**

  Specify semantic helpers for row order, named groups, footer results, and controlled data/properties/view probes.

- [ ] **Step 2: Verify the harness contract initially fails**

- [ ] **Step 3: Add deterministic full-plugin data and resource probes**

  Reuse the deterministic E2E values where practical. Continue applying `change.next` in controlled probes.

- [ ] **Step 4: Add only semantic result helpers**

  Prefer roles, accessible names, labels, and visible text. Do not encode DOM index paths.

- [ ] **Step 5: Run the harness contract and existing suite**

- [ ] **Step 6: Commit harness improvements**

### Task 3: Cover plugin conversion and formatting contracts

- [x] **Step 1: Add table-driven scalar conversion tests**
- [x] **Step 2: Add comparison boundary tests**
- [x] **Step 3: Add transfer and grouping tests**
- [x] **Step 4: Add date formatting and range boundaries**
- [x] **Step 5: Run plugin tests and apply test-demonstrated fixes**
- [x] **Step 6: Measure plugin-domain coverage**
- [x] **Step 7: Commit plugin contracts in the checkpoint**

### Task 4: Cover every cell editor's real interaction and boundary behavior

- [ ] **Step 1: Close title/text cancellation and keyboard boundaries**

  Existing tests cover title list commit/placeholder and text display/editor behavior. Add only missing Escape cancellation, clearing, and exact resource payload boundaries.

- [ ] **Step 2: Close number editor boundaries**

  Existing tests cover valid/invalid/empty commits, displays, display type, divide-by, show-number, color, currency, and rounding selection. Add missing Escape behavior and the remaining supported rounding/format boundaries.

- [ ] **Step 3: Close checkbox and link ownership boundaries**

  Existing tests cover checkbox toggling and email/phone/URL edit/display boundaries. Add copy/open/cancel behavior only where the cell component owns that behavior.

- [ ] **Step 4: Close date editor boundaries**

  Existing tests cover invalid/valid dates, independent start/end updates, end-date/include-time toggles, formats, clearing, and empty board/row-view behavior. Add calendar selection/navigation, Escape cancellation, and exact resource payload assertions.

- [x] **Step 5: Strengthen select tests and propagation contracts**

- [x] **Step 6: Run cell suites and full regression**

- [x] **Step 7: Commit current cell contracts**

### Task 5: Replace superficial menu tests with result-bearing contracts

- [ ] **Step 1: Finish the audit-driven merge/rewrite pass**

  Do not remove label-only tests until the audit names a passing result-bearing replacement.

- [ ] **Step 2: Close remaining property-menu outcomes**

  Existing tests cover rename/duplicate validation/description, wrap, freeze, group, duplicate, hide/restore, delete, insert-right, title guards, type creation, and sorting interactions. Add missing change-type outcome, insert-left unit boundary, locked behavior, and exact action payload gaps.

- [ ] **Step 3: Complete the calculation outcome matrix**

  Existing tests cover checked count, unchecked percentage, and cap state. Add count all/values/unique/empty/non-empty, zero-row behavior, remaining checkbox methods, and live recomputation after edit/add/delete.

- [ ] **Step 4: Close remaining row/group menu outcomes**

  Existing tests cover row search/copy/duplicate/delete/shortcut and group add/aggregation/hide/delete confirmation. Add only missing icon/config actions, supported shortcuts, locked boundaries, and exact payload assertions.

- [ ] **Step 5: Finalize the audit and remove only fully subsumed tests**

- [x] **Step 6: Run menu suites and coverage**

- [x] **Step 7: Commit current menu contracts**

### Task 6: Cover table, list, board, row-view, header, footer, and DnD transitions

- [ ] **Step 1: Close table body/header/footer boundaries**

  Existing reactivity tests cover visibility, pinning, sizing, counting, sorting, locking, and resource refresh. Add empty/first/last/grouped body cases, resize start/end, column reorder, and remaining footer refresh branches.

- [ ] **Step 2: Close list-layout boundaries**

  Existing tests cover add above/below, row open, title editing, and lock behavior. Add empty list and controlled-parent refresh boundaries.

- [ ] **Step 3: Close board-layout and DnD boundaries**

  Existing tests cover missing-group selection, title edit, add within group, card open, grouped membership, and lock behavior. Add select/checkbox/date/empty columns, group visibility/aggregation, empty board, card movement, and board DnD payloads.

- [ ] **Step 4: Close row-view boundaries**

  Existing tests cover side/center/full rendering, mode change, Escape close, full-page action, and data refresh. Add first/last navigation, previous/next transitions, deleted-row guards, URL present/absent behavior, and the SSR guard.

- [ ] **Step 5: Cover DnD hooks as deterministic state contracts**

  Call public table/hook drag-end handlers with deterministic active/over IDs. Assert missing/self no-ops and exact row, column, board-card, and group move payloads without browser geometry.

- [x] **Step 6: Run layout suites and coverage**

- [x] **Step 7: Commit current layout and transition contracts**

### Task 7: Close meaningful coverage gaps and enable the 90% gate

- [x] **Step 1: Generate and rank the machine-readable gap list**

- [ ] **Step 2: Add focused tests for remaining meaningful contracts**

  Prioritize resource mutations and guards, then display variants. Current natural metrics require at least 26 more covered statements and 56 more covered branches, assuming the denominator remains `1337/772`.

- [ ] **Step 3: Remove proven dead or unreachable product code**

  Demonstrate unreachability through public call sites/types before deletion. Do not add ignore directives or runtime exclusions.

- [ ] **Step 4: Repeat coverage until both natural metrics exceed 90%**

  Keep a small margin above 90% to avoid rounding instability.

- [ ] **Step 5: Enable exact Vitest thresholds**

  Add only:

  ```ts
  thresholds: {
    statements: 90,
    branches: 90,
  }
  ```

  Keep runtime sources included and test/helper/type/barrel exclusions explicit and minimal.

- [ ] **Step 6: Complete audit evidence**

- [ ] **Step 7: Run final package gates**

  Run `test`, `coverage`, `typecheck`, `lint`, and `format`. Current known state is test/coverage/typecheck passing; lint and format still require cleanup.

- [ ] **Step 8: Commit the final 90% gate**

  Commit only when the audit is complete, all package gates pass, and statements/branches are both at least 90%.
