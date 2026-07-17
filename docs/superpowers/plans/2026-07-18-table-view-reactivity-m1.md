# Table View Reactivity M1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Milestone 1 from `docs/superpowers/specs/2026-07-13-table-view-reactivity-and-resource-api-design.md` by documenting render dependencies, adding necessary subscription boundaries, and narrowing the internal root table subscription without changing the public resource API.

**Architecture:** Keep `TableViewContext` as an access context for the table instance. Move rendered store dependencies into `table.Subscribe` boundaries at the layout, toolbar, table body, header, footer, list, board, menu, and row-view roots. After stale-UI tests cover the converted dependencies, pass a narrow selector to `useTable` so `TableViewWrapper` no longer rerenders for every TanStack store update.

**Tech Stack:** React 19, TypeScript 6, `@tanstack/react-table` v9 `useTable` and `table.Subscribe`, Vitest, React Testing Library.

## Global Constraints

- M1 must not change the public resource API.
- Automated render-count tracking is not required.
- Necessary first-party render dependencies must use explicit subscriptions.
- The internal root subscription may be narrowed only if the stale-UI suite passes.
- React-owned `data`, `properties`, and `table` resource replacement costs remain tracked separately from TanStack store subscription costs.

---

### Task 1: Stale-UI Characterization Tests

**Files:**

- Create: `packages/table-view/src/table-contexts/table-view-reactivity.test.tsx`
- Modify: none
- Test: `packages/table-view/src/table-contexts/table-view-reactivity.test.tsx`

**Interfaces:**

- Consumes: `renderTableView(props?: Partial<React.ComponentProps<typeof TableView>>)` from `packages/table-view/src/__tests__/component-objects/render-table-view.tsx`.
- Produces: regression tests named with `TableViewReactivity_*` that fail when `TableViewWrapper` stops subscribing to all state before UI dependencies are wrapped in `table.Subscribe`.

- [ ] **Step 1: Write failing stale-UI tests**

```tsx
import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderTableView } from "../__tests__/component-objects/render-table-view";
import { mockResizeObserver } from "../__tests__/mock";

mockResizeObserver();

describe("TableViewReactivity", () => {
  it("TableViewReactivity_LayoutSwitch_RendersSelectedLayout", async () => {
    const tableView = renderTableView();
    const settings = await tableView.openViewSettings();
    const layout = await settings.openLayout();

    await layout.selectLayout("List");
    expect(screen.getByText("Task 1").closest("[data-slot]")).toBeNull();
    expect(screen.getByText("Task 1")).toBeVisible();

    await layout.selectLayout("Board");
    expect(screen.getByText("Select a grouping property")).toBeVisible();
  });

  it("TableViewReactivity_LockToggle_HidesTableAddRow", async () => {
    const tableView = renderTableView();
    const settings = await tableView.openViewSettings();

    expect(screen.getByRole("button", { name: /new page/i })).toBeVisible();
    await settings.toggleLock();

    expect(
      screen.queryByRole("button", { name: /new page/i }),
    ).not.toBeInTheDocument();
    expect(settings.item("Unlock database")).toBeVisible();
  });

  it("TableViewReactivity_SortingChange_ShowsAndClearsSortSelector", async () => {
    const tableView = renderTableView();
    const settings = await tableView.openViewSettings();
    const sort = await settings.openSort();

    await sort.addRule("Name");
    expect(screen.getByRole("button", { name: /name/i })).toBeVisible();

    await sort.removeRule("Name");
    expect(
      screen.queryByRole("button", { name: /name/i }),
    ).not.toBeInTheDocument();
  });

  it("TableViewReactivity_RowViewOpenAndModeChange_RendersSelectedRowView", async () => {
    const tableView = renderTableView();

    await tableView.openRowActions("Task 1");
    await tableView.rowActions.openPage();
    expect(screen.getByRole("dialog")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Task 1" })).toBeVisible();

    const settings = await tableView.openViewSettings();
    const layout = await settings.openLayout();
    await layout.selectRowView("Center peek");

    expect(screen.getByRole("dialog")).toBeVisible();
    expect(
      within(screen.getByRole("dialog")).getByRole("heading", {
        name: "Task 1",
      }),
    ).toBeVisible();
  });
});
```

- [ ] **Step 2: Run the test to verify RED**

Run: `source "$NVM_DIR/nvm.sh" && nvm use 24.11.1 --silent && $NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-view test -- --run src/table-contexts/table-view-reactivity.test.tsx`

Expected before production changes: tests may pass with the current broad root subscription. After temporarily narrowing the root selector to `() => null`, at least layout, lock, sorting, or row-view assertions fail, proving the tests catch missing subscriptions.

### Task 2: Subscription Boundary Utilities

**Files:**

- Create: `packages/table-view/src/table-contexts/table-view-subscriptions.tsx`
- Modify: `packages/table-view/src/table-contexts/index.ts`
- Test: `packages/table-view/src/table-contexts/table-view-reactivity.test.tsx`

**Interfaces:**

- Produces: small wrapper components whose children render inside `table.Subscribe` with selectors for the state dependencies they cover.
- Consumes: `useTableViewCtx()` from `packages/table-view/src/table-contexts/table-view-provider.tsx`.

- [ ] **Step 1: Add subscription wrappers**

```tsx
import type React from "react";

import { useTableViewCtx } from "./table-view-provider";

export function SubscribeTableLayout({
  children,
}: {
  children: (layout: "table" | "list" | "board") => React.ReactNode;
}) {
  const { table } = useTableViewCtx();
  return (
    <table.Subscribe selector={(state) => state.tableGlobal.layout}>
      {children}
    </table.Subscribe>
  );
}
```

Add similarly named wrappers for toolbar menu state, table layout content, row model regions, table header, table footer, and row views. Each wrapper should select only the coarse slices read by the wrapped subtree.

- [ ] **Step 2: Export wrappers from `table-contexts/index.ts`**

Run: `sed -n '1,80p' packages/table-view/src/table-contexts/index.ts`

Expected: existing provider exports remain, and the new subscription utility module is available to first-party components.

### Task 3: Convert First-Party Render Dependencies

**Files:**

- Modify: `packages/table-view/src/table-contexts/table-view-provider.tsx`
- Modify: `packages/table-view/src/table-contexts/table-view-content.tsx`
- Modify: `packages/table-view/src/tools/toolbar.tsx`
- Modify: `packages/table-view/src/table-body/table-body.tsx`
- Modify: `packages/table-view/src/table-header/table-header-row.tsx`
- Modify: `packages/table-view/src/table-footer/table-footer.tsx`
- Modify: `packages/table-view/src/list-view/list-view-content.tsx`
- Modify: `packages/table-view/src/board-view/board-view-content.tsx`
- Modify: `packages/table-view/src/row-view/dialog-view.tsx`
- Modify: `packages/table-view/src/row-view/side-view.tsx`
- Modify: `packages/table-view/src/row-view/full-view.tsx`
- Test: `packages/table-view/src/table-contexts/table-view-reactivity.test.tsx`

**Interfaces:**

- Consumes: wrappers from Task 2.
- Produces: component roots whose render-time `table.store.state` and state-dependent builder-method reads are re-evaluated through `table.Subscribe`.

- [ ] **Step 1: Wrap layout selection**

Move the `Content` switch in `table-view-provider.tsx` behind the layout subscription:

```tsx
function Content() {
  return (
    <SubscribeTableLayout>
      {(layout) => {
        switch (layout) {
          case "list":
            return <ListViewContent />;
          case "board":
            return <BoardViewContent />;
          default:
            return <TableViewContent />;
        }
      }}
    </SubscribeTableLayout>
  );
}
```

- [ ] **Step 2: Wrap large layout roots**

For each table/list/board root, keep local React state outside only when it does not read table store state. Put row model reads, sorting checks, grouping checks, and column-size calculations inside a subscription child.

- [ ] **Step 3: Wrap toolbar, menus, header, footer, and row-view roots**

Use selectors matching the state each root reads, for example `state.menu`, `state.tableGlobal`, `state.columnOrder`, `state.columnsInfo`, `state.columnVisibility`, `state.columnPinning`, `state.columnSizing`, `state.columnResizing`, `state.columnCounting`, `state.sorting`, `state.grouping`, and `state.groupingState`.

- [ ] **Step 4: Run the stale-UI test**

Run: `source "$NVM_DIR/nvm.sh" && nvm use 24.11.1 --silent && $NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-view test -- --run src/table-contexts/table-view-reactivity.test.tsx`

Expected: PASS after production changes.

### Task 4: Narrow Root Table Subscription

**Files:**

- Modify: `packages/table-hook/src/table-contexts/use-table-view.tsx`
- Test: `packages/table-view/src/table-contexts/table-view-reactivity.test.tsx`

**Interfaces:**

- Consumes: `useTable(options, selector?)` from `@tanstack/react-table`.
- Produces: a `useTableView` table instance whose owner hook does not subscribe to every TanStack store update.

- [ ] **Step 1: Add a null root selector**

Change the table construction to:

```tsx
const table = useTable<TableFeatures, Row<TPlugins>, null>(
  {
    features: DEFAULT_FEATURES,
    columns,
    data: dataEntity,
    defaultColumn: defaultColumnOverride ?? defaultColumn,
    columnResizeMode: "onChange",
    groupedColumnMode: false,
    autoResetExpanded: false,
    getRowId: (row) => row.id,
    state: tableState,
    onColumnInfoChange: handleColumnChange,
    onTableDataChange: onDataChange ?? setDataEntity,
    onTableGlobalChange: onTableChange ?? setTableGlobal,
    getRowUrl,
  },
  () => null,
);
```

- [ ] **Step 2: Run stale-UI tests again**

Run: `source "$NVM_DIR/nvm.sh" && nvm use 24.11.1 --silent && $NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-view test -- --run src/table-contexts/table-view-reactivity.test.tsx`

Expected: PASS.

### Task 5: M1 Investigation Report

**Files:**

- Create: `docs/superpowers/reports/2026-07-18-table-view-reactivity-m1.md`
- Test: none

**Interfaces:**

- Consumes: static inventory from `rg "table\\.store\\.state|getTableGlobalState|getRowModel|get.*Headers|getColumnInfo|getColumnCounting" packages/table-view/src`.
- Produces: checked-in report documenting priority, converted dependencies, profiling method, expected impact, and remaining React-owned update costs.

- [ ] **Step 1: Write the report**

Include sections:

```md
# Table View Reactivity M1 Report

## Scope

## Investigation Method

## Render Dependency Inventory

## Optimizations Applied

## Stale-UI Coverage

## Follow-Up Profiling Notes

## Remaining Costs
```

- [ ] **Step 2: Search for untracked raw render reads**

Run: `rg "table\\.store\\.state|getTableGlobalState\\(|getRowModel\\(|get.*Headers\\(|getColumnInfo\\(|getColumnCounting\\(" packages/table-view/src -n`

Expected: any remaining reads are either inside a subscribed subtree or documented as action-time reads, not render-time stale risks.

### Task 6: Focused Verification

**Files:**

- Modify only files touched by previous tasks.
- Test: package tests and typecheck.

**Interfaces:**

- Consumes: all tasks.
- Produces: verified Milestone 1 implementation.

- [ ] **Step 1: Run focused table-view tests**

Run: `source "$NVM_DIR/nvm.sh" && nvm use 24.11.1 --silent && $NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-view test -- --run`

Expected: all `@notion-kit/table-view` tests pass.

- [ ] **Step 2: Run table-hook tests**

Run: `source "$NVM_DIR/nvm.sh" && nvm use 24.11.1 --silent && $NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-hook test -- --run`

Expected: all `@notion-kit/table-hook` tests pass.

- [ ] **Step 3: Run typecheck**

Run: `source "$NVM_DIR/nvm.sh" && nvm use 24.11.1 --silent && $NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store typecheck`

Expected: typecheck exits 0.

- [ ] **Step 4: Review the diff**

Run: `git diff -- docs/superpowers packages/table-hook packages/table-view`

Expected: no public resource API changes; changes are limited to M1 docs, subscriptions, tests, and the root selector.
