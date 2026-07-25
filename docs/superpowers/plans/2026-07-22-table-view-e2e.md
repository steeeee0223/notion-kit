# Table View E2E Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add production-representative controlled and uncontrolled table-view pages, a Chromium Playwright suite for every approved high-value journey, and a separate source-mapped V8 coverage report.

**Architecture:** The Next.js e2e app consumes built `@notion-kit/table-view`. Controlled and uncontrolled pages share deterministic fixtures. Playwright component objects use semantic locators, while E2E V8 coverage remains independent from Vitest and has no percentage threshold.

**Tech Stack:** Next.js 16.1, React 19.2, TypeScript 6.0.3, Playwright 1.57, Chromium, Monocart Coverage Reports, pnpm 11.0.8, Node.js 24.11.1.

## Current implementation state

- Implemented through commits `1e3a1278`, `ee9cec80`, `56628eee`, `4141ef98`, `8735a43b`, `ed8d38dc`, and checkpoint `40a79d3e`.
- Controlled/uncontrolled pages, deterministic fixtures, Playwright configuration, semantic component objects, and source-mapped E2E coverage are present.
- E2E specs exist for resources, cells, sorting, grouping, calculating, header actions, row/group actions, layouts, row views, row/header DnD, and resizing.
- Last targeted Chromium evidence before the environment quota block:
  - header and row actions: 10/10 passed
  - group actions: 3/3 passed
  - layouts and row views: 2/2 passed
  - row DnD and header resize passed in isolated runs
- Header keyboard DnD still needs fresh verification.
- Full Chromium suite, full E2E coverage generation, and app quality gates have not received a final clean run.
- Base UI nested submenu closing after arrow-key focus movement is treated as an upstream limitation and is not a completion blocker.

## Global Constraints

- Run Node.js through nvm `24.11.1` and invoke pnpm only as `$NVM_BIN/pnpm` with store `/Users/awen/Documents/Codex/.pnpm-store`.
- Run Chromium only.
- Keep Playwright and Vitest coverage separate; E2E coverage has no percentage threshold.
- Test the built `@notion-kit/table-view` package, not direct package source imports.
- Use roles, accessible names, labels, and visible text; do not add arbitrary waits or brittle CSS implementation selectors.
- Keep sorting, grouping, and calculating as internal table state.
- Name tests `TestUnit_Scenario_ExpectedOutcome`.
- Do not add tests for unimplemented Edit property, Move to, or Comment actions.

---

### Task 1: Install and configure the Playwright runner

- [x] **Step 1: Declare test dependencies in the workspace catalog**
- [x] **Step 2: Add E2E scripts**
- [x] **Step 3: Configure Chromium Playwright**
- [x] **Step 4: Include Playwright files in typechecking**
- [x] **Step 5: Enable browser and package source maps**
- [x] **Step 6: Install dependencies and Chromium**
- [x] **Step 7: Verify Playwright configuration discovery**
- [x] **Step 8: Commit runner configuration**

### Task 2: Build deterministic fixtures and controlled/uncontrolled pages

- [x] **Step 1: Write route contract tests**
- [x] **Step 2: Verify the routes initially fail**
- [x] **Step 3: Implement the deterministic fixture**
- [x] **Step 4: Implement the internal-state diagnostic**
- [x] **Step 5: Implement the controlled page**
- [x] **Step 6: Implement the uncontrolled page**
- [x] **Step 7: Run route and app checks**
- [x] **Step 8: Commit pages and fixtures**

### Task 3: Add independent V8 coverage collection

- [x] **Step 1: Define source filters and reports**
- [x] **Step 2: Add global cache lifecycle**
- [x] **Step 3: Add the automatic coverage fixture**
- [x] **Step 4: Wire setup/teardown and migrate spec imports**
- [x] **Step 5: Generate and validate a source-mapped report**
- [x] **Step 6: Commit the coverage harness**

### Task 4: Add semantic Playwright component objects

- [x] **Step 1: Write a semantic object contract**
- [x] **Step 2: Verify the contract initially fails**
- [x] **Step 3: Implement the root table object**
- [x] **Step 4: Implement menu objects**
- [x] **Step 5: Implement row and cell objects**
- [x] **Step 6: Run the object contract and lint**
- [x] **Step 7: Commit component objects**

### Task 5: Cover controlled resources and all cell plugins

- [x] **Step 1: Add controlled, uncontrolled, and cell journeys**
- [x] **Step 2: Record product and locator failures**
- [x] **Step 3: Implement journeys and test-demonstrated product fixes**
- [x] **Step 4: Verify controlled and uncontrolled isolation**
- [x] **Step 5: Commit resource and cell journeys**

### Task 6: Cover sorting, grouping, and calculating results

- [x] **Step 1: Add sorting journeys**
- [x] **Step 2: Add grouping journeys**
- [x] **Step 3: Add calculating journeys**
- [x] **Step 4: Diagnose and correct result failures**
- [x] **Step 5: Commit result-oriented journeys**

### Task 7: Cover table header and property actions

- [x] **Step 1: Test result-bearing header actions**

- [ ] **Step 2: Finish plugin-configuration journeys**

  Add browser-level rendered-result coverage for number currency/rounding/display, select add/rename/color/delete/sort with affected rows, date/time formats, and title icon visibility. Avoid Base UI keyboard-submenu assertions that only reproduce the upstream focus bug.

- [ ] **Step 3: Reverify header DnD; preserve the passing resize journey**

  Run `HeaderKeyboardDnD_NotesAfterScore_MovesPropertyAndReportsAction` alone under Chromium. Assert property order and the exact `properties.move` action. Keep `HeaderResize_NotesFortyPixelsWider_ReportsExactWidthChange` as the resize contract.

- [ ] **Step 4: Run header specs at the configured Chromium viewport**

  Run:

  ```bash
  $NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/e2e test:e2e -- header-actions.spec.ts drag-and-drop.spec.ts
  ```

  Expected: every header action, resize, and DnD test passes without forced actions except the intentional locked-control assertion.

- [x] **Step 5: Commit current header journeys**

### Task 8: Cover row/group actions, layouts, row views, and DnD

- [ ] **Step 1: Close remaining row-action boundaries**

  Existing coverage includes search, configured open, add above/below, duplicate/delete, duplicate shortcut, new tab, clipboard, icon URL, and icon removal. Add only the remaining supported keyboard shortcuts and a real file-upload journey if file upload is part of the implemented product contract.

- [x] **Step 2: Test group actions**

- [ ] **Step 3: Close row-view navigation boundaries**

  Existing coverage switches table/list/board and opens side, center, and full views. Add first/last previous-next disabled boundaries and explicit close/navigation outcomes without permanently leaving the deterministic fixture.

- [x] **Step 4: Test row DnD with real pointers**

- [ ] **Step 5: Run row/group/layout/DnD specs twice**

  Run the four specs twice in Chromium and confirm deterministic defaults, no leaked popup/clipboard/upload state, and no order dependence.

- [x] **Step 6: Commit current row/layout journeys**

### Task 9: Verify the complete E2E story and reports

- [ ] **Step 1: Document Playwright commands and artifacts**

  Update `apps/e2e/README.md` with the required Node/pnpm invocation, Chromium installation, `test:e2e`, `test:e2e:coverage`, report paths, built-package precondition, and the separate informational E2E coverage policy.

- [ ] **Step 2: Run the full Chromium suite**

  ```bash
  $NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/e2e test:e2e
  ```

  Expected: every approved journey passes under the `chromium` project.

- [ ] **Step 3: Generate and inspect full E2E coverage**

  ```bash
  $NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/e2e test:e2e:coverage
  ```

  Expected: non-empty text, JSON, and HTML reports contain `packages/table-view/src` paths; no percentage gate is evaluated.

- [ ] **Step 4: Run app quality checks**

  Run e2e `test`, `typecheck`, `lint`, and `format`. Every command must exit 0.

- [ ] **Step 5: Commit documentation and final E2E corrections**

  Commit only after Steps 1–4 are clean.
