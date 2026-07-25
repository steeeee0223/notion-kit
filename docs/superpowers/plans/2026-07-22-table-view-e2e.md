# Table View E2E Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add production-representative controlled and uncontrolled table-view pages, a Chromium Playwright suite for every approved high-value journey, and a separate source-mapped V8 coverage report.

**Architecture:** The Next.js e2e app continues consuming built `@notion-kit/table-view`. Two pages share deterministic data and properties; the controlled page owns the three public resources while the uncontrolled page passes defaults. Playwright semantic component objects drive the UI, and an automatic fixture sends per-test V8 coverage to a worker-safe Monocart report.

**Tech Stack:** Next.js 16.1, React 19.2, TypeScript 6.0.3, Playwright 1.57, Chromium, Monocart Coverage Reports, pnpm 11.0.8, Node.js 24.11.1.

## Global Constraints

- Run Node.js through nvm `24.11.1` and invoke pnpm only as `$NVM_BIN/pnpm` with store `/Users/awen/Documents/Codex/.pnpm-store`.
- Run Chromium only.
- Keep Playwright and Vitest coverage separate; E2E coverage has no percentage threshold.
- Test the built `@notion-kit/table-view` package, not direct package source imports.
- Use roles, accessible names, labels, and visible text; do not add arbitrary waits or brittle CSS implementation selectors.
- Keep sorting, grouping, and calculating as internal table state; only data, properties, and the public view fields are parent-controlled.
- Name tests `TestUnit_Scenario_ExpectedOutcome`.
- Do not add tests for unimplemented Edit property, Move to, or Comment actions.

---

### Task 1: Install and configure the Playwright runner

**Files:**
- Modify: `pnpm-workspace.yaml`
- Modify: `apps/e2e/package.json`
- Modify: `apps/e2e/tsconfig.json`
- Create: `apps/e2e/playwright.config.ts`
- Modify: `apps/e2e/next.config.ts`
- Modify: `packages/table-view/tsdown.config.ts`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Consumes: existing `@notion-kit/e2e` Next server on port 3001 and `@notion-kit/table-view` build.
- Produces: `test:e2e`, `test:e2e:coverage`, a Chromium project, browser source maps, and package source maps.

- [ ] **Step 1: Declare test dependencies in the workspace catalog**

Add `@playwright/test: ^1.57.0` beside `playwright`, and add `monocart-coverage-reports: ^2.11.5` in the `test` catalog. Reference both as `catalog:test` dev dependencies from `apps/e2e/package.json`.

```yaml
test:
  "@playwright/test": ^1.57.0
  monocart-coverage-reports: ^2.11.5
  playwright: ^1.57.0
```

- [ ] **Step 2: Add scripts without nesting a bare pnpm invocation**

```json
{
  "scripts": {
    "pretest:e2e": "turbo run build --filter=@notion-kit/table-view",
    "pretest:e2e:coverage": "turbo run build --filter=@notion-kit/table-view",
    "test:e2e": "playwright test",
    "test:e2e:coverage": "E2E_COVERAGE=1 playwright test"
  }
}
```

- [ ] **Step 3: Configure Playwright**

Create `apps/e2e/playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3001",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "next dev -p 3001",
    url: "http://127.0.0.1:3001",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
```

- [ ] **Step 4: Include Playwright files in typechecking**

Change the `include` array to:

```json
["src", "tests", "playwright.config.ts", "vitest.*.ts"]
```

- [ ] **Step 5: Enable source maps**

Set `productionBrowserSourceMaps: true` in `apps/e2e/next.config.ts` and `sourcemap: true` in the object returned from `packages/table-view/tsdown.config.ts`.

- [ ] **Step 6: Install with the declared runtime and store**

Run:

```bash
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
source "$NVM_DIR/nvm.sh"
nvm use 24.11.1 --silent
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store install
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/e2e exec playwright install chromium
```

Expected: install succeeds, the lockfile records the declared packages, and Chromium is available.

- [ ] **Step 7: Verify configuration discovery**

Run:

```bash
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/e2e exec playwright test --list
```

Expected: `Total: 0 tests in 0 files`; Playwright loads the config without error.

- [ ] **Step 8: Commit runner configuration**

```bash
git add pnpm-workspace.yaml pnpm-lock.yaml apps/e2e/package.json apps/e2e/tsconfig.json apps/e2e/playwright.config.ts apps/e2e/next.config.ts packages/table-view/tsdown.config.ts
git commit -m "test(e2e): configure Playwright for table view"
```

### Task 2: Build deterministic fixtures and controlled/uncontrolled pages

**Files:**
- Create: `apps/e2e/src/test-fixtures/table-view.ts`
- Create: `apps/e2e/src/app/table-view/controlled/page.tsx`
- Create: `apps/e2e/src/app/table-view/uncontrolled/page.tsx`
- Create: `apps/e2e/src/app/table-view/_components/table-view-state-diagnostic.tsx`
- Create: `apps/e2e/tests/pages.spec.ts`

**Interfaces:**
- Produces: `createTableViewFixture(): { data; properties; view }`, routes `/table-view/controlled` and `/table-view/uncontrolled`, `data-testid="controlled-state"`, `data-testid="internal-state"`, and `Reset controlled state`.
- Consumes: public `TableView`, `useTableViewCtx`, `ResourceChange`, `DataResourceAction`, `PropertiesResourceAction`, and `ViewResourceAction` exports.

- [ ] **Step 1: Write route contract tests first**

```ts
import { expect, test } from "@playwright/test";

for (const mode of ["controlled", "uncontrolled"] as const) {
  test(`TableViewPage_${mode}_RendersDeterministicRows`, async ({ page }) => {
    await page.goto(`/table-view/${mode}`);
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByRole("row").filter({ hasText: "Alpha" })).toBeVisible();
    await expect(page.getByRole("row").filter({ hasText: "Omega" })).toBeVisible();
  });
}

test("ControlledTable_Reset_RestoresParentResources", async ({ page }) => {
  await page.goto("/table-view/controlled");
  await expect(page.getByTestId("controlled-state")).toContainText('"layout":"table"');
  await expect(page.getByRole("button", { name: "Reset controlled state" })).toBeVisible();
});
```

- [ ] **Step 2: Run the tests and verify the routes fail**

Run: `$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/e2e test:e2e -- pages.spec.ts`

Expected: FAIL because both routes return 404.

- [ ] **Step 3: Implement the deterministic fixture**

Use fixed IDs and timestamps. Export a fresh clone on every call to avoid state leakage:

```ts
import type { ColumnInfo, Row, TableViewState } from "@notion-kit/table-view";

const INITIAL_PROPERTIES: ColumnInfo[] = [
  { id: "title", name: "Name", type: "title", width: "220", config: { showIcon: true } },
  { id: "notes", name: "Notes", type: "text", width: "180", config: undefined },
  {
    id: "score",
    name: "Score",
    type: "number",
    width: "120",
    config: { format: "number", round: "default", showAs: "number", options: { color: "green", divideBy: 100, showNumber: true } },
  },
  {
    id: "status",
    name: "Status",
    type: "select",
    width: "140",
    config: {
      sort: "manual",
      options: {
        names: ["Backlog", "Active", "Done"],
        items: {
          Backlog: { id: "option-backlog", name: "Backlog", color: "gray" },
          Active: { id: "option-active", name: "Active", color: "blue" },
          Done: { id: "option-done", name: "Done", color: "green" },
        },
      },
    },
  },
  {
    id: "tags",
    name: "Tags",
    type: "multi-select",
    width: "160",
    config: {
      sort: "manual",
      options: {
        names: ["Frontend", "Backend"],
        items: {
          Frontend: { id: "option-frontend", name: "Frontend", color: "purple" },
          Backend: { id: "option-backend", name: "Backend", color: "orange" },
        },
      },
    },
  },
  { id: "complete", name: "Complete", type: "checkbox", width: "100", config: undefined },
  { id: "due", name: "Due", type: "date", width: "160", config: { dateFormat: "full", timeFormat: "24-hour", tz: "UTC" } },
  { id: "email", name: "Email", type: "email", width: "180", config: undefined },
  { id: "phone", name: "Phone", type: "phone", width: "160", config: undefined },
  { id: "website", name: "Website", type: "url", width: "180", config: undefined },
  { id: "created", name: "Created", type: "created-time", width: "180", config: { dateFormat: "full", timeFormat: "24-hour", tz: "UTC" } },
  { id: "edited", name: "Edited", type: "last-edited-time", width: "180", config: { dateFormat: "full", timeFormat: "24-hour", tz: "UTC" } },
];

const INITIAL_DATA: Row[] = [
  {
    id: "row-alpha",
    createdAt: 1_735_689_600_000,
    lastEditedAt: 1_735_689_600_000,
    properties: {
      title: { id: "cell-alpha-title", value: "Alpha" },
      notes: { id: "cell-alpha-notes", value: "first note" },
      score: { id: "cell-alpha-score", value: "10" },
      status: { id: "cell-alpha-status", value: "Active" },
      tags: { id: "cell-alpha-tags", value: ["Frontend"] },
      complete: { id: "cell-alpha-complete", value: true },
      due: { id: "cell-alpha-due", value: { start: 1_735_689_600_000 } },
      email: { id: "cell-alpha-email", value: "alpha@example.com" },
      phone: { id: "cell-alpha-phone", value: "+886900000001" },
      website: { id: "cell-alpha-website", value: "https://example.com/alpha" },
      created: { id: "cell-alpha-created", value: null },
      edited: { id: "cell-alpha-edited", value: null },
    },
  },
  {
    id: "row-empty",
    createdAt: 1_735_776_000_000,
    lastEditedAt: 1_735_776_000_000,
    properties: {
      title: { id: "cell-empty-title", value: "Empty" },
      notes: { id: "cell-empty-notes", value: "" },
      score: { id: "cell-empty-score", value: null },
      status: { id: "cell-empty-status", value: null },
      tags: { id: "cell-empty-tags", value: [] },
      complete: { id: "cell-empty-complete", value: false },
      due: { id: "cell-empty-due", value: {} },
      email: { id: "cell-empty-email", value: "" },
      phone: { id: "cell-empty-phone", value: "" },
      website: { id: "cell-empty-website", value: "" },
      created: { id: "cell-empty-created", value: null },
      edited: { id: "cell-empty-edited", value: null },
    },
  },
  {
    id: "row-omega",
    createdAt: 1_735_862_400_000,
    lastEditedAt: 1_735_862_400_000,
    properties: {
      title: { id: "cell-omega-title", value: "Omega" },
      notes: { id: "cell-omega-notes", value: "last note" },
      score: { id: "cell-omega-score", value: "90" },
      status: { id: "cell-omega-status", value: "Done" },
      tags: { id: "cell-omega-tags", value: ["Frontend", "Backend"] },
      complete: { id: "cell-omega-complete", value: false },
      due: { id: "cell-omega-due", value: { start: 1_736_035_200_000 } },
      email: { id: "cell-omega-email", value: "omega@example.com" },
      phone: { id: "cell-omega-phone", value: "+886900000003" },
      website: { id: "cell-omega-website", value: "https://example.com/omega" },
      created: { id: "cell-omega-created", value: null },
      edited: { id: "cell-omega-edited", value: null },
    },
  },
];

export function createTableViewFixture() {
  return structuredClone({
    data: INITIAL_DATA,
    properties: INITIAL_PROPERTIES,
    view: { layout: "table", rowView: "side", openedRowId: null, locked: false } satisfies TableViewState,
  });
}
```

- [ ] **Step 4: Implement the diagnostic child**

Use `useTableViewCtx()` inside `TableView` children and subscribe to `sorting`, `grouping`, `groupingState`, and `columnCounting`. Render JSON in `data-testid="internal-state"` and label it `Internal table state (not parent controlled)`.

- [ ] **Step 5: Implement the controlled page**

Hold all three resources in `useState`, apply each `change.next`, and render deterministic JSON with this exact shape: `{ dataCount, propertiesCount, viewCount, lastDataAction, lastPropertiesAction, lastViewAction, data, properties, view }`. Render the internal diagnostic as a child of `TableView`. The reset button must replace all resources with a newly cloned fixture, set all counts to `0`, and set all last-action fields to `null`.

- [ ] **Step 6: Implement the uncontrolled page**

Pass `defaultData`, `defaultProperties`, `defaultView`, and `getRowUrl={(id) => `/table-view/rows/${id}`}`. Render the same internal diagnostic but no controlled-state region.

- [ ] **Step 7: Run route and app checks**

Run:

```bash
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/e2e test:e2e -- pages.spec.ts
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/e2e typecheck
```

Expected: route tests PASS and typecheck exits 0.

- [ ] **Step 8: Commit pages and fixtures**

```bash
git add apps/e2e/src/test-fixtures/table-view.ts apps/e2e/src/app/table-view apps/e2e/tests/pages.spec.ts
git commit -m "test(e2e): add controlled table view fixtures"
```

### Task 3: Add independent V8 coverage collection

**Files:**
- Create: `apps/e2e/tests/coverage-options.ts`
- Create: `apps/e2e/tests/global-setup.ts`
- Create: `apps/e2e/tests/global-teardown.ts`
- Create: `apps/e2e/tests/fixtures.ts`
- Modify: `apps/e2e/playwright.config.ts`
- Modify: `apps/e2e/tests/pages.spec.ts`

**Interfaces:**
- Produces: `test` and `expect` exports from `tests/fixtures.ts`; `apps/e2e/coverage/e2e/index.html`, `coverage.json`, and `coverage.txt` when `E2E_COVERAGE=1`.
- Consumes: Playwright `page.coverage`, Monocart `MCR(options).add()` and `generate()`.

- [ ] **Step 1: Define source filters and reports**

```ts
import path from "node:path";
import type { CoverageReportOptions } from "monocart-coverage-reports";

const appRoot = path.resolve(import.meta.dirname, "..");

export const coverageOptions: CoverageReportOptions = {
  name: "table-view Playwright coverage",
  baseDir: path.resolve(appRoot, "../.."),
  outputDir: path.resolve(appRoot, "coverage/e2e"),
  reports: [
    ["v8", { outputFile: "index.html" }],
    ["v8-json", { outputFile: "coverage.json" }],
    ["text", { file: "coverage.txt" }],
    "console-details",
  ],
  entryFilter: { "**/_next/static/chunks/**": true, "**": false },
  sourceFilter: { "**/packages/table-view/src/**/*.{ts,tsx}": true, "**": false },
  clean: true,
  cleanCache: false,
};
```

- [ ] **Step 2: Add global cache lifecycle**

`global-setup.ts` calls `MCR(coverageOptions).cleanCache()` only when `E2E_COVERAGE === "1"`. `global-teardown.ts` calls `await MCR(coverageOptions).generate()` under the same condition.

- [ ] **Step 3: Add the automatic fixture**

```ts
import { test as base, expect } from "@playwright/test";
import MCR from "monocart-coverage-reports";
import { coverageOptions } from "./coverage-options";

export const test = base.extend<{ collectCoverage: void }>({
  collectCoverage: [
    async ({ page }, use) => {
      if (process.env.E2E_COVERAGE !== "1") {
        await use();
        return;
      }
      await page.coverage.startJSCoverage({ resetOnNavigation: false });
      try {
        await use();
      } finally {
        const coverage = await page.coverage.stopJSCoverage();
        await MCR(coverageOptions).add(coverage);
      }
    },
    { auto: true },
  ],
});

export { expect };
```

- [ ] **Step 4: Wire setup/teardown and migrate imports**

Add `globalSetup: "./tests/global-setup.ts"` and `globalTeardown: "./tests/global-teardown.ts"` to Playwright config. Change spec imports from `@playwright/test` to `./fixtures`.

- [ ] **Step 5: Generate a one-file coverage report**

Run: `$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/e2e test:e2e:coverage -- pages.spec.ts`

Expected: tests PASS; all three report files exist; report paths resolve to `packages/table-view/src`, not only `_next/static/chunks`.

- [ ] **Step 6: Commit the coverage harness**

```bash
git add apps/e2e/tests apps/e2e/playwright.config.ts
git commit -m "test(e2e): collect table view V8 coverage"
```

### Task 4: Add semantic Playwright component objects

**Files:**
- Create: `apps/e2e/tests/component-objects/table-view.ts`
- Create: `apps/e2e/tests/component-objects/menu-surface.ts`
- Create: `apps/e2e/tests/component-objects/view-settings-menu.ts`
- Create: `apps/e2e/tests/component-objects/sort-menu.ts`
- Create: `apps/e2e/tests/component-objects/grouping-menu.ts`
- Create: `apps/e2e/tests/component-objects/header-menu.ts`
- Create: `apps/e2e/tests/component-objects/row-actions.ts`
- Create: `apps/e2e/tests/component-objects/cell-editors.ts`
- Test: `apps/e2e/tests/component-objects.spec.ts`

**Interfaces:**
- Produces: `TableViewObject`, `MenuSurfaceObject`, `SortMenuObject`, `GroupingMenuObject`, `HeaderMenuObject`, `RowActionsObject`, and plugin-specific editor helpers.
- Consumes: Playwright `Page` and `Locator`; no raw `document.querySelector` calls.

- [ ] **Step 1: Write a contract test for semantic object operations**

```ts
test("TableViewObject_ToolbarAndRows_ResolveByAccessibleContract", async ({ page }) => {
  const table = await TableViewObject.open(page, "uncontrolled");
  await expect(table.table()).toBeVisible();
  await expect(table.row("Alpha")).toBeVisible();
  await expect(table.settingsButton()).toBeEnabled();
  await expect(table.sortButton()).toBeEnabled();
});
```

- [ ] **Step 2: Verify the contract fails before objects exist**

Run the single spec. Expected: FAIL at import resolution.

- [ ] **Step 3: Implement the root object**

`TableViewObject.open(page, mode)` navigates to the route and waits for `role=table`. `row(name)` filters `role=row` by text. `cell(row, accessibleName)` resolves a button within the row. Toolbar, settings, sort, header, footer, and diagnostics receive named methods.

- [ ] **Step 4: Implement menu objects**

Every menu object takes a root `Locator`, returns role-based items, and uses Playwright web-first waits. Menu transitions return the next object. Header menu operations include sort, group, calculate, freeze, hide, wrap, insert, duplicate, delete, type, and plugin config.

- [ ] **Step 5: Implement row and cell objects**

Row actions expose add, search, icon, open, new-tab, copy, duplicate, delete, and keyboard helpers. Cell helpers expose editable textbox/popover/combobox/date interactions based on accessible UI rather than column indices.

- [ ] **Step 6: Run the object contract and lint**

Run the contract spec and `@notion-kit/e2e` lint. Expected: both PASS.

- [ ] **Step 7: Commit component objects**

```bash
git add apps/e2e/tests/component-objects apps/e2e/tests/component-objects.spec.ts
git commit -m "test(e2e): add table view component objects"
```

### Task 5: Cover controlled resources and all cell plugins

**Files:**
- Create: `apps/e2e/tests/controlled-resources.spec.ts`
- Create: `apps/e2e/tests/uncontrolled-state.spec.ts`
- Create: `apps/e2e/tests/cell-editing.spec.ts`

**Interfaces:**
- Consumes: `TableViewObject`, controlled diagnostics, deterministic cells.
- Produces: proof of `data`, `properties`, and public `view` controlled contracts plus title/text/number/select/multi-select/checkbox/date/email/phone/URL/created-time/last-edited-time browser behavior.

- [ ] **Step 1: Write focused failing journeys**

Start `controlled-resources.spec.ts` with a complete parent-sync contract:

```ts
import { expect, test } from "./fixtures";
import { TableViewObject } from "./component-objects/table-view";

test("ControlledData_CellEdits_ParentStateAndUIStaySynchronized", async ({ page }) => {
  const table = await TableViewObject.open(page, "controlled");
  await table.editTextCell("Alpha", "Notes", "updated note");

  await expect(table.row("Alpha")).toContainText("updated note");
  await expect(table.controlledState()).toContainText('"type":"data.cell.update"');
  await expect(table.controlledState()).toContainText('"rowId":"row-alpha"');
  await expect(table.controlledState()).toContainText('"propertyId":"notes"');
  await expect(table.controlledState()).toContainText('"nextValue":"updated note"');
});

test("ControlledResources_ParentReset_RestoresAllInitialResources", async ({ page }) => {
  const table = await TableViewObject.open(page, "controlled");
  await table.editTextCell("Alpha", "Notes", "changed");
  await page.getByRole("button", { name: "Reset controlled state" }).click();

  await expect(table.row("Alpha")).toContainText("first note");
  await expect(table.controlledState()).toContainText('"dataCount":0');
  await expect(table.controlledState()).toContainText('"propertiesCount":0');
  await expect(table.controlledState()).toContainText('"viewCount":0');
});
```

Add these exact contracts in the named spec files, each with rendered-result assertions and exact diagnostic action type/payload when the resource is public:

- `ControlledProperties_CreateRenameHideDeleteRestore_ParentAndHeadersStaySynchronized`
- `ControlledView_LayoutLockRowViewAndOpenedRow_ParentStateStaysSynchronized`
- `UncontrolledState_ConsecutiveEditsAndLayoutChanges_PersistWithoutParentWriteback`
- `UncontrolledState_PageReload_RestoresDeterministicDefaults`
- `CellEditors_EmptyAndExistingValues_RoundTripEveryEditablePlugin`
- `GeneratedTimeCells_FixedTimestamps_RenderReadOnlyValues`
- `SelectEditor_DuplicateOption_ShowsValidationWithoutMutation`

- [ ] **Step 2: Run and record product/locator failures**

Run all three specs. Expected: failures identify missing object operations or real product behavior; do not loosen selectors.

- [ ] **Step 3: Implement the journeys and fix real logic defects test-first**

Use title/text clear-and-fill, number valid/invalid input, select replace/create/duplicate, multi-select accumulate/clear, checkbox toggle, date start/end/time, email edit/mail link, phone edit/tel link, and URL edit/open. Assert created-time and last-edited-time display the fixed row timestamps and expose no editable control. If product state disagrees with the UI, keep the failing case and fix `packages/table-view` logic in the smallest relevant file.

- [ ] **Step 4: Verify both modes remain isolated**

Run the specs twice. Expected: both runs PASS without order dependence. The uncontrolled diagnostic must show no parent resource region, edits must survive table/list/board switches during one page lifetime, and reload must restore Alpha/Empty/Omega defaults.

- [ ] **Step 5: Commit cell and resource journeys**

```bash
git add apps/e2e/tests/controlled-resources.spec.ts apps/e2e/tests/uncontrolled-state.spec.ts apps/e2e/tests/cell-editing.spec.ts apps/e2e/tests/component-objects packages/table-view/src
git commit -m "test(e2e): cover controlled resources and cells"
```

### Task 6: Cover sorting, grouping, and calculating results

**Files:**
- Create: `apps/e2e/tests/sorting.spec.ts`
- Create: `apps/e2e/tests/grouping.spec.ts`
- Create: `apps/e2e/tests/calculating.spec.ts`

**Interfaces:**
- Consumes: deterministic Alpha/Empty/Omega rows and internal diagnostic.
- Produces: result-oriented assertions for row order, group membership, visibility, board cards, and footer values.

- [ ] **Step 1: Add sorting journeys**

Assert these exact contracts: score ascending is `Alpha, Omega, Empty`; descending is `Omega, Alpha, Empty`; multi-sort honors the first rule; removing rules restores source order; changing Alpha score above Omega repositions Alpha. Assert internal sorting diagnostics but no `onViewChange` action.

- [ ] **Step 2: Add grouping journeys**

Group by Status and Complete. Assert Active contains Alpha, Done contains Omega, empty contains Empty, hide/show one group and Hide all/Show all change the rendered member rows, hiding empty groups removes the empty group, remove grouping restores flat rows, and board columns contain the same cards.

- [ ] **Step 3: Add calculating journeys**

Assert count all `3`, values `2`, unique `2`, empty `1`, non-empty `2`, checked `1`, unchecked `2`, checked percentage `33.3%`, and immediate updates after edit/add/delete. The exact percentage follows `getPercentage()` in `packages/table-hook/src/methods.ts`, which uses one decimal place.

- [ ] **Step 4: Run all three specs and diagnose failures**

Expected: tests PASS. A wrong order, membership, or footer value is a product defect, not a selector issue.

- [ ] **Step 5: Commit result-oriented journeys**

```bash
git add apps/e2e/tests/sorting.spec.ts apps/e2e/tests/grouping.spec.ts apps/e2e/tests/calculating.spec.ts apps/e2e/tests/component-objects packages/table-view/src
git commit -m "test(e2e): cover table sorting grouping and calculations"
```

### Task 7: Cover table header and property actions

**Files:**
- Create: `apps/e2e/tests/header-actions.spec.ts`
- Create: `apps/e2e/tests/property-config.spec.ts`

**Interfaces:**
- Consumes: `HeaderMenuObject`, horizontal table scrolling, controlled properties diagnostic.
- Produces: end-to-end proof for every implemented header action and plugin config.

- [ ] **Step 1: Test result-bearing header actions**

Cover change type (and title immutability), sort, group, calculate, freeze/unfreeze, hide/restore, wrap/unwrap, insert left/right, duplicate, delete/restore, and locked disabled state. Assert property order and exact controlled `properties.*` action types where applicable.

- [ ] **Step 2: Test plugin configuration**

Cover number currency/rounding/display, select add/rename/color/delete/sort with affected rows, date format/time format, and title icon visibility. Assertions target rendered cells and parent properties.

- [ ] **Step 3: Test real pointer resize and reorder**

Use `locator.boundingBox()` and `page.mouse` to drag a resize handle and header handle. Assert the new width/action and property order/action rather than only visual movement.

- [ ] **Step 4: Run the specs at the configured viewport**

Expected: PASS without forced actions. If actionability fails, inspect layout and accessible state first.

- [ ] **Step 5: Commit header journeys**

```bash
git add apps/e2e/tests/header-actions.spec.ts apps/e2e/tests/property-config.spec.ts apps/e2e/tests/component-objects packages/table-view/src
git commit -m "test(e2e): cover table header actions"
```

### Task 8: Cover row/group actions, layouts, row views, and DnD

**Files:**
- Create: `apps/e2e/tests/row-actions.spec.ts`
- Create: `apps/e2e/tests/group-actions.spec.ts`
- Create: `apps/e2e/tests/layouts-and-row-views.spec.ts`
- Create: `apps/e2e/tests/drag-and-drop.spec.ts`

**Interfaces:**
- Consumes: row/group component objects, clipboard context permission, popup events, pointer coordinates.
- Produces: all approved row/group/menu/keyboard/layout/navigation/DnD contracts.

- [ ] **Step 1: Test every implemented row action**

Cover add below, Option-click add above, choose/remove/upload icon, configured row view, new tab URL, clipboard URL, duplicate with new ID, delete target only, search filtering, and duplicate/delete/new-tab shortcuts.

- [ ] **Step 2: Test group actions**

Cover add into the selected group, show/hide aggregation, hide group, cancel group deletion, confirm group deletion, and locked absence of mutation actions.

- [ ] **Step 3: Test layouts and row-view boundaries**

Switch table/list/board while preserving edits. Open first and last rows in side and center modes, assert previous/next disabled boundaries, close, and use full view only when the deterministic URL behavior can be observed without leaving the fixture permanently.

- [ ] **Step 4: Test row DnD with real pointers**

Drag Alpha below Omega with `page.mouse`; assert rendered order and controlled `data.row.move` payload. Repeat header DnD only here if Task 7 exposed a shared DnD helper.

- [ ] **Step 5: Run the four specs twice**

Expected: PASS twice with isolated default state and no leaked popup, clipboard, or upload state.

- [ ] **Step 6: Commit row/layout journeys**

```bash
git add apps/e2e/tests/row-actions.spec.ts apps/e2e/tests/group-actions.spec.ts apps/e2e/tests/layouts-and-row-views.spec.ts apps/e2e/tests/drag-and-drop.spec.ts apps/e2e/tests/component-objects packages/table-view/src
git commit -m "test(e2e): cover row actions layouts and drag drop"
```

### Task 9: Verify the complete E2E story and reports

**Files:**
- Modify: `apps/e2e/README.md`

**Interfaces:**
- Consumes: all prior E2E deliverables.
- Produces: documented commands and final proof of browser behavior plus source-mapped reports.

- [ ] **Step 1: Document Playwright commands and artifacts**

Add Chromium install, `test:e2e`, `test:e2e:coverage`, HTML report paths, the built-package precondition, and the rule that E2E coverage is informational and separate from Vitest.

- [ ] **Step 2: Run the full Chromium suite**

Run:

```bash
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/e2e test:e2e
```

Expected: every approved domain passes under the `chromium` project.

- [ ] **Step 3: Generate and inspect full E2E coverage**

Run:

```bash
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/e2e test:e2e:coverage
```

Expected: text, JSON, and HTML reports are non-empty and contain table-view source paths; no percentage gate is evaluated.

- [ ] **Step 4: Run app quality checks**

Run e2e `test`, `typecheck`, `lint`, and `format`. Expected: all exit 0.

- [ ] **Step 5: Commit documentation and final E2E corrections**

```bash
git add apps/e2e/README.md apps/e2e packages/table-view/src packages/table-view/tsdown.config.ts pnpm-workspace.yaml pnpm-lock.yaml
git commit -m "test(e2e): verify table view browser journeys"
```
