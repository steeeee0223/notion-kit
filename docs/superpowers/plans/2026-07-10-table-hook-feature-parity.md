# Table Hook Feature Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `@notion-kit/table-hook` feature behavior match `@notion-kit/table-view`, including migrated dnd-kit row, Kanban, column, and grouped-row drag behavior, while keeping `table-hook` on TanStack Table v9 beta.

**Architecture:** `packages/table-view/src/features` is the behavioral reference. `packages/table-hook/src/features` keeps its TanStack v9 feature-map shape (`constructTableAPIs`, `TableState_FeatureMap`, object-shaped `DEFAULT_FEATURES`) and ports the v8 package behavior through small v9 adapters. Tests are updated first to lock parity, then source files are changed until the package test/typecheck/build cycle passes.

**Tech Stack:** TypeScript 6.0.3, React 19, Vitest 4.1.8, `@tanstack/react-table@9.0.0-beta.11` in `table-hook`, `@dnd-kit/react` from the workspace `ui` catalog.

## Global Constraints

- Preserve `packages/table-hook` as the TanStack Table v9 beta prototype.
- Treat `packages/table-view/src/features` as the behavioral source of truth.
- Keep `TableState_FeatureMap`, `TableOptions_FeatureMap`, `Table_FeatureMap`, `constructTableAPIs`, and object-shaped `DEFAULT_FEATURES` in `table-hook`.
- Migrate `table-hook` feature and test imports from `@dnd-kit/core` and `@dnd-kit/sortable` to `@dnd-kit/react`.
- Do not change `packages/table-view` public API.
- Do not change the repository-wide TanStack Table catalog version.
- Do not remove failing tests instead of adapting or fixing them.
- Use pnpm through `$NVM_BIN/pnpm` with `/Users/awen/Documents/Codex/.pnpm-store`.

---

## File Structure

- Modify `packages/table-hook/package.json`: replace old dnd-kit dependencies with the migrated dnd-kit packages needed by feature code.
- Modify `packages/table-hook/src/features/utils.ts`: remove stale core/sortable drag updater and keep shared ID/group helpers.
- Modify `packages/table-hook/src/features/row-actions.ts`: port `table-view` row/Kanban drag behavior into v9 `constructTableAPIs`.
- Modify `packages/table-hook/src/features/columns-info.ts`: update column drag to `@dnd-kit/react` operation shape and parity behavior.
- Modify `packages/table-hook/src/features/grouping.ts`: update grouped-row drag to `@dnd-kit/react` operation shape, unskip parity test, and keep v9 table APIs.
- Modify `packages/table-hook/src/features/counting.ts`, `freezing.ts`, `menu.ts`, `extended-grouped-row-model.ts`, `constants.ts`, and `index.ts`: port non-dnd behavior deltas while preserving v9 feature maps.
- Modify `packages/table-hook/src/__tests__/row-actions.test.tsx`: port row/Kanban parity tests from `table-view`.
- Modify `packages/table-hook/src/__tests__/columns-info.test.tsx`: use `@dnd-kit/react` event shape.
- Modify `packages/table-hook/src/__tests__/grouping.test.tsx`: use `@dnd-kit/react` event shape and enable grouped-row drag test.
- Modify `packages/table-hook/src/__tests__/public-api.test.ts` only if dependency or feature export changes affect public feature shape.

---

### Task 1: dnd-kit Dependency And Test Fixture Baseline

**Files:**
- Modify: `packages/table-hook/package.json`
- Modify: `packages/table-hook/src/__tests__/columns-info.test.tsx`
- Modify: `packages/table-hook/src/__tests__/grouping.test.tsx`
- Modify: `packages/table-hook/src/__tests__/row-actions.test.tsx`

**Interfaces:**
- Consumes: current `table-hook` test helper `renderTableHook(...)`.
- Produces: tests importing `DragEndEvent` and `DragOverEvent` from `@dnd-kit/react`; no test imports from `@dnd-kit/core`.

- [ ] **Step 1: Replace stale dnd-kit dependencies**

Edit `packages/table-hook/package.json` dependencies from:

```json
"@dnd-kit/core": "catalog:ui",
"@dnd-kit/sortable": "catalog:ui",
```

to:

```json
"@dnd-kit/abstract": "catalog:ui",
"@dnd-kit/helpers": "catalog:ui",
"@dnd-kit/react": "catalog:ui",
```

- [ ] **Step 2: Update drag test imports**

In `packages/table-hook/src/__tests__/columns-info.test.tsx` and `packages/table-hook/src/__tests__/grouping.test.tsx`, use:

```ts
import type { DragEndEvent } from "@dnd-kit/react";
```

In `packages/table-hook/src/__tests__/row-actions.test.tsx`, use:

```ts
import type { DragEndEvent, DragOverEvent } from "@dnd-kit/react";
```

- [ ] **Step 3: Convert column drag fixtures to the migrated event shape**

Change column drag tests to create inline events shaped like `table-view`:

```ts
act(() => {
  table.handleColumnDragEnd({
    canceled: false,
    operation: {
      canceled: false,
      source: { id: "col1" },
      target: { id: "col2" },
    },
  } as DragEndEvent);
});
```

- [ ] **Step 4: Enable and convert grouped-row drag test**

In `packages/table-hook/src/__tests__/grouping.test.tsx`, change `it.skip("should handle group row drag end"` to `it("should handle group row drag end"` and use:

```ts
act(() => {
  table.handleGroupedRowDragEnd({
    canceled: false,
    operation: {
      canceled: false,
      source: { id: firstGroupId },
      target: { id: secondGroupId },
    },
  } as DragEndEvent);
});
```

- [ ] **Step 5: Add row/Kanban failing tests**

Add these cases to `packages/table-hook/src/__tests__/row-actions.test.tsx` under `describe("handleRowDragEnd", ...)`:

```ts
it("updates row grouping from kanban column drag metadata", () => {
  const { table } = renderTableHook({
    data: mockData,
    properties: mockProperties,
  });

  act(() => {
    table.setGrouping(["col2"]);
  });

  act(() => {
    table.handleRowDragEnd({
      canceled: false,
      operation: {
        canceled: false,
        source: { id: "row1", data: { columnId: "col2:25" } },
        target: { id: "row2", data: { columnId: "col2:30" } },
      },
    } as unknown as DragEndEvent);
  });

  expect(table.getRow("row1").original.properties.col2?.value).toBe(30);
});

it("can commit row grouping without replaying a kanban preview reorder", () => {
  const { table } = renderTableHook({
    data: mockData,
    properties: mockProperties,
  });

  act(() => {
    table.setGrouping(["col2"]);
  });

  act(() => {
    table.handleRowDragEnd(
      {
        canceled: false,
        operation: {
          canceled: false,
          source: { id: "row1", data: { columnId: "col2:25" } },
          target: { id: "row2", data: { columnId: "col2:30" } },
        },
      } as unknown as DragEndEvent,
      { reorder: false },
    );
  });

  expect(table.getCellValues().map((row) => row.id)).toEqual([
    "row1",
    "row2",
  ]);
  expect(table.getRow("row1").original.properties.col2?.value).toBe(30);
});

it("previews kanban row order directly in table data", () => {
  const { table } = renderTableHook({
    data: mockData,
    properties: mockProperties,
  });

  act(() => {
    table.setGrouping(["col2"]);
  });

  act(() => {
    table.handleKanbanRowDragOver({
      canceled: false,
      operation: {
        canceled: false,
        source: {
          id: "row1",
          type: "item",
          data: { columnId: "col2:25" },
          manager: {
            dragOperation: {
              position: { current: { x: 0, y: 0 } },
            },
          },
        },
        target: { id: "row2", type: "item", data: { columnId: "col2:30" } },
      },
    } as unknown as DragOverEvent);
  });

  const targetGroup = table.getGroupedRowModel().rowsById["col2:30"];

  expect(targetGroup?.subRows.map((row) => row.id)).toEqual([
    "row1",
    "row2",
  ]);
  expect(table.getRow("row1").original.properties.col2?.value).toBe(30);
});
```

- [ ] **Step 6: Run focused tests and confirm failures are behavioral**

Run:

```bash
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
source "$NVM_DIR/nvm.sh"
nvm use 24.11.1 --silent
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-hook test -- src/__tests__/row-actions.test.tsx src/__tests__/columns-info.test.tsx src/__tests__/grouping.test.tsx
```

Expected: tests fail because `handleKanbanRowDragOver` and migrated event-shape handling are not implemented yet.

- [ ] **Step 7: Commit Task 1**

```bash
git add packages/table-hook/package.json packages/table-hook/src/__tests__/columns-info.test.tsx packages/table-hook/src/__tests__/grouping.test.tsx packages/table-hook/src/__tests__/row-actions.test.tsx
git commit -m "test: add table-hook dnd parity coverage"
```

---

### Task 2: Row Actions And Kanban Drag Parity

**Files:**
- Modify: `packages/table-hook/src/features/row-actions.ts`
- Modify: `packages/table-hook/src/features/utils.ts`
- Modify: `packages/table-hook/src/__tests__/row-actions.test.tsx`

**Interfaces:**
- Consumes: `DragEndEvent` and `DragOverEvent` from `@dnd-kit/react`.
- Consumes: `getKanbanColumnTargetId`, `getKanbanItemsAfterDrag`, and `type KanbanItems` from `@notion-kit/ui/kanban`.
- Consumes: `getSortableItemsAfterDrag` from `@notion-kit/ui/primitives`.
- Produces: `handleKanbanRowDragOver(event: DragOverEvent): void`.
- Produces: `handleRowDragEnd(event: DragEndEvent, options?: { reorder?: boolean }): void`.

- [ ] **Step 1: Remove stale sortable updater from utils**

Edit `packages/table-hook/src/features/utils.ts` so it no longer imports dnd-kit packages and only exports:

```ts
import type { Updater } from "@tanstack/react-table";

import { insertAt } from "../lib/utils";
import type { ComparableValue } from "../plugins";

export function createIdsUpdater(
  targetId: string,
  at?: { id: string; side: "left" | "right" },
): Updater<string[]> {
  return (prev) => {
    if (at === undefined) return [...prev, targetId];
    const idx = prev.indexOf(at.id);
    return at.side === "right"
      ? insertAt(prev, targetId, idx + 1)
      : insertAt(prev, targetId, idx);
  };
}

export function createGroupId(colId: string, value: ComparableValue): string {
  return `${colId}:${String(value)}`;
}
```

- [ ] **Step 2: Add migrated imports to row actions**

In `packages/table-hook/src/features/row-actions.ts`, replace the old dnd import and local updater import with:

```ts
import type { DragEndEvent, DragOverEvent } from "@dnd-kit/react";
import {
  getKanbanColumnTargetId,
  getKanbanItemsAfterDrag,
  type KanbanItems,
} from "@notion-kit/ui/kanban";
import { getSortableItemsAfterDrag } from "@notion-kit/ui/primitives";

import { createGroupId } from "./utils";
```

- [ ] **Step 3: Add the row drag options interface**

Add next to `RowActionsOptions`:

```ts
export interface RowDragEndOptions {
  reorder?: boolean;
}
```

Update `RowActionsTableApi`:

```ts
handleKanbanRowDragOver: (e: DragOverEvent) => void;
handleRowDragEnd: (e: DragEndEvent, options?: RowDragEndOptions) => void;
```

- [ ] **Step 4: Port row grouping helper functions**

Add these helpers before `RowActionsFeature`, adapting imports to relative `table-hook` paths:

```ts
function getRowGroupingValue(
  table: Table<Row>,
  row: Row,
  groupingColumnId: string,
): ComparableValue | null {
  const cell = row.properties[groupingColumnId];
  if (!cell) return null;

  const plugin = table.getColumnPlugin(groupingColumnId);
  return (plugin.toGroupValue ?? plugin.toValue)(cell.value, row);
}

function createKanbanItemsFromRows(
  table: Table<Row>,
  rows: Row[],
  groupingColumnId: string,
  groupOrder: string[],
): KanbanItems {
  const items = Object.fromEntries(
    groupOrder.map((groupId) => [groupId, [] as string[]]),
  );

  for (const row of rows) {
    const groupingValue = getRowGroupingValue(table, row, groupingColumnId);
    const groupId = createGroupId(groupingColumnId, groupingValue);
    items[groupId]?.push(row.id);
  }

  return items;
}

function applyKanbanItemsToRows(
  rows: Row[],
  items: KanbanItems,
  groupOrder: string[],
  groupingColumnId: string,
  groupValues: Record<string, { original: unknown } | undefined>,
  options: { touchMovedRow?: boolean } = {},
) {
  const rowById = new Map(rows.map((row) => [row.id, row]));
  const nextRows: Row[] = [];
  const consumedIds = new Set<string>();
  const now = Date.now();

  for (const groupId of groupOrder) {
    const groupValue = groupValues[groupId];
    const itemIds = items[groupId] ?? [];
    for (const itemId of itemIds) {
      const row = rowById.get(itemId);
      if (!row) continue;

      consumedIds.add(itemId);
      if (!groupValue || !row.properties[groupingColumnId]) {
        nextRows.push(row);
        continue;
      }

      nextRows.push({
        ...row,
        properties: {
          ...row.properties,
          [groupingColumnId]: {
            ...row.properties[groupingColumnId],
            id: options.touchMovedRow
              ? v4()
              : row.properties[groupingColumnId].id,
            value: structuredClone(groupValue.original),
          },
        },
        lastEditedAt: options.touchMovedRow ? now : row.lastEditedAt,
      });
    }
  }

  return [...nextRows, ...rows.filter((row) => !consumedIds.has(row.id))];
}
```

- [ ] **Step 5: Port `handleRowDragEnd` behavior with v9 state access**

Inside `constructTableAPIs`, replace stale `createDragEndUpdater` usage with logic equivalent to `table-view`, using `table.store.state` where v9 requires it:

```ts
table.handleRowDragEnd = (event, options = {}) => {
  if (event.canceled) return;

  const { grouping, groupingState } = table.store.state;
  const groupingColumnId = grouping[0];

  table.setTableData((rows) => {
    const rowIds = rows.map((row) => row.id);
    const reorderedIds =
      options.reorder === false
        ? rowIds
        : getSortableItemsAfterDrag(rowIds, event);
    const rowById = new Map(rows.map((row) => [row.id, row]));
    const orderedRows = reorderedIds.map((id) => rowById.get(id)!);
    const remainingRows = rows.filter((row) => !rowById.has(row.id));
    let nextRows = [...orderedRows, ...remainingRows];

    const targetGroupId = getKanbanColumnTargetId(event.operation.target);
    if (groupingColumnId && targetGroupId) {
      const items = createKanbanItemsFromRows(
        table,
        nextRows,
        groupingColumnId,
        groupingState.groupOrder,
      );
      const activeId = String(event.operation.source?.id);
      const targetId = String(event.operation.target?.id);
      const sourceGroupId = getKanbanColumnTargetId(event.operation.source);
      const sourceItems = sourceGroupId ? (items[sourceGroupId] ?? []) : [];
      const targetItems = items[targetGroupId] ?? [];

      if (!targetItems.includes(activeId)) {
        items[targetGroupId] = targetId.startsWith("content:")
          ? [...targetItems, activeId]
          : targetItems.flatMap((id) => (id === targetId ? [activeId, id] : id));
        if (sourceGroupId) {
          items[sourceGroupId] = sourceItems.filter((id) => id !== activeId);
        }
      }

      nextRows = applyKanbanItemsToRows(
        nextRows,
        items,
        groupingState.groupOrder,
        groupingColumnId,
        groupingState.groupValues,
        { touchMovedRow: true },
      );
    }

    return nextRows;
  });
};
```

If the exact `getSortableItemsAfterDrag` return contract differs, inspect `packages/table-view/src/features/row-actions.ts` and align the v9 implementation with that source before committing.

- [ ] **Step 6: Port `handleKanbanRowDragOver` behavior**

Add this API in `constructTableAPIs`:

```ts
table.handleKanbanRowDragOver = (event) => {
  if (event.canceled) return;

  const groupingColumnId = table.store.state.grouping[0];
  if (!groupingColumnId) return;

  table.setTableData((rows) => {
    const { groupingState } = table.store.state;
    const items = createKanbanItemsFromRows(
      table,
      rows,
      groupingColumnId,
      groupingState.groupOrder,
    );
    const nextItems = getKanbanItemsAfterDrag(items, event);
    if (nextItems === items) return rows;

    return applyKanbanItemsToRows(
      rows,
      nextItems,
      groupingState.groupOrder,
      groupingColumnId,
      groupingState.groupValues,
      { touchMovedRow: false },
    );
  });
};
```

- [ ] **Step 7: Run row action tests**

Run:

```bash
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
source "$NVM_DIR/nvm.sh"
nvm use 24.11.1 --silent
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-hook test -- src/__tests__/row-actions.test.tsx
```

Expected: row-actions tests pass, or fail only on v9 API typing/runtime gaps found during this task.

- [ ] **Step 8: Commit Task 2**

```bash
git add packages/table-hook/src/features/row-actions.ts packages/table-hook/src/features/utils.ts packages/table-hook/src/__tests__/row-actions.test.tsx
git commit -m "feat: port table-hook row drag parity"
```

---

### Task 3: Column And Group Drag Parity

**Files:**
- Modify: `packages/table-hook/src/features/columns-info.ts`
- Modify: `packages/table-hook/src/features/grouping.ts`
- Modify: `packages/table-hook/src/__tests__/columns-info.test.tsx`
- Modify: `packages/table-hook/src/__tests__/grouping.test.tsx`

**Interfaces:**
- Consumes: `DragEndEvent` from `@dnd-kit/react`.
- Consumes: `getSortableItemsAfterDrag` from `@notion-kit/ui/primitives`.
- Produces: `handleColumnDragEnd(event: DragEndEvent): void`.
- Produces: `handleGroupedRowDragEnd(event: DragEndEvent): void`.

- [ ] **Step 1: Update feature imports**

In both feature files, use:

```ts
import type { DragEndEvent } from "@dnd-kit/react";
import { getSortableItemsAfterDrag } from "@notion-kit/ui/primitives";
```

Remove imports of `createDragEndUpdater`.

- [ ] **Step 2: Port column reorder implementation**

In `columns-info.ts`, implement `handleColumnDragEnd` using migrated event shape:

```ts
table.handleColumnDragEnd = (event) => {
  if (event.canceled) return;
  table.setColumnOrder((prev) => getSortableItemsAfterDrag(prev, event));
};
```

Keep the rest of the column API on `constructTableAPIs` and `constructColumnAPIs` if present in the v9 file.

- [ ] **Step 3: Port grouped-row reorder implementation**

In `grouping.ts`, implement grouped-row drag with v9 grouping state updater:

```ts
table.handleGroupedRowDragEnd = (event) => {
  if (event.canceled) return;
  table._setGroupingState((prev) => ({
    ...prev,
    groupOrder: getSortableItemsAfterDrag(prev.groupOrder, event),
  }));
};
```

- [ ] **Step 4: Run focused column/group tests**

Run:

```bash
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
source "$NVM_DIR/nvm.sh"
nvm use 24.11.1 --silent
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-hook test -- src/__tests__/columns-info.test.tsx src/__tests__/grouping.test.tsx
```

Expected: column and grouping tests pass.

- [ ] **Step 5: Commit Task 3**

```bash
git add packages/table-hook/src/features/columns-info.ts packages/table-hook/src/features/grouping.ts packages/table-hook/src/__tests__/columns-info.test.tsx packages/table-hook/src/__tests__/grouping.test.tsx
git commit -m "feat: port table-hook column and group drag parity"
```

---

### Task 4: Non-dnd Feature Behavior Parity

**Files:**
- Modify: `packages/table-hook/src/features/counting.ts`
- Modify: `packages/table-hook/src/features/freezing.ts`
- Modify: `packages/table-hook/src/features/menu.ts`
- Modify: `packages/table-hook/src/features/extended-grouped-row-model.ts`
- Modify: `packages/table-hook/src/features/constants.ts`
- Modify: `packages/table-hook/src/features/index.ts`
- Modify: related `packages/table-hook/src/__tests__/*.test.tsx` files when assertions need parity updates.

**Interfaces:**
- Consumes: current `table-view` behavior from matching feature files.
- Produces: v9-compatible feature implementations that match `table-view` public behavior.

- [ ] **Step 1: Compare each remaining feature file**

Run:

```bash
git diff --no-index packages/table-hook/src/features/counting.ts packages/table-view/src/features/counting.ts
git diff --no-index packages/table-hook/src/features/freezing.ts packages/table-view/src/features/freezing.ts
git diff --no-index packages/table-hook/src/features/menu.ts packages/table-view/src/features/menu.ts
git diff --no-index packages/table-hook/src/features/extended-grouped-row-model.ts packages/table-view/src/features/extended-grouped-row-model.ts
git diff --no-index packages/table-hook/src/features/constants.ts packages/table-view/src/features/constants.ts
git diff --no-index packages/table-hook/src/features/index.ts packages/table-view/src/features/index.ts
```

Expected: diffs identify behavior changes to port while v9 extension syntax remains different.

- [ ] **Step 2: Port table option/state naming without v8 syntax**

When a `table-view` feature uses v8 names like:

```ts
getDefaultOptions: (table) => ({})
createTable: (table) => {}
```

Keep the v9 shape in `table-hook`:

```ts
getDefaultTableOptions: (table) => ({})
constructTableAPIs: (table) => {}
```

Move the function bodies and state defaults across after replacing `table.getState()` with `table.store.state` only where the existing v9 package requires direct store access.

- [ ] **Step 3: Preserve v9 feature map exports**

In `packages/table-hook/src/features/index.ts`, keep this shape:

```ts
declare module "@tanstack/react-table" {
  interface TableState_FeatureMap {
    columnsInfoFeature: ColumnsInfoTableState;
    countingFeature: CountingTableState;
    freezingFeature: FreezingTableState;
    tableMenuFeature: TableMenuTableState;
    rowActionsFeature: {};
    extendedGroupingFeature: ExtendedGroupingTableState;
  }
}

export const DEFAULT_FEATURES = {
  columnsInfoFeature: ColumnsInfoFeature,
  countingFeature: CountingFeature,
  freezingFeature: FreezingFeature,
  tableMenuFeature: TableMenuFeature,
  rowActionsFeature: RowActionsFeature,
  extendedGroupingFeature: ExtendedGroupingFeature,
};
```

Add only the missing type/API entries needed by parity changes.

- [ ] **Step 4: Run full table-hook test suite**

Run:

```bash
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
source "$NVM_DIR/nvm.sh"
nvm use 24.11.1 --silent
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-hook test
```

Expected: `@notion-kit/table-hook` tests pass.

- [ ] **Step 5: Commit Task 4**

```bash
git add packages/table-hook/src/features packages/table-hook/src/__tests__
git commit -m "feat: align table-hook feature behavior"
```

---

### Task 5: Verification And Cleanup

**Files:**
- Modify: `packages/table-hook/src/features/*.ts` only for cleanup found by verification.
- Modify: `packages/table-hook/src/__tests__/*.test.tsx` only for assertion corrections found by verification.
- Modify: `packages/table-hook/package.json` only if dependency verification finds stale dnd entries.

**Interfaces:**
- Consumes: all task outputs.
- Produces: passing package checks and no stale dnd-kit imports.

- [ ] **Step 1: Confirm stale dnd-kit packages are gone**

Run:

```bash
rg "@dnd-kit/core|@dnd-kit/sortable|createDragEndUpdater|arrayMove" packages/table-hook
```

Expected: no matches.

- [ ] **Step 2: Confirm migrated dnd APIs are present**

Run:

```bash
rg "@dnd-kit/react|handleKanbanRowDragOver|handleRowDragEnd" packages/table-hook/src packages/table-hook/package.json
```

Expected: matches in feature code, tests, and `package.json`.

- [ ] **Step 3: Run package typecheck**

Run:

```bash
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
source "$NVM_DIR/nvm.sh"
nvm use 24.11.1 --silent
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-hook typecheck
```

Expected: typecheck passes.

- [ ] **Step 4: Run package build**

Run:

```bash
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
source "$NVM_DIR/nvm.sh"
nvm use 24.11.1 --silent
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-hook build
```

Expected: build passes.

- [ ] **Step 5: Run final package tests**

Run:

```bash
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
source "$NVM_DIR/nvm.sh"
nvm use 24.11.1 --silent
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-hook test
```

Expected: tests pass.

- [ ] **Step 6: Inspect final diff**

Run:

```bash
git diff --stat
git diff -- packages/table-hook
```

Expected: diff is scoped to `table-hook` source, tests, and dependency metadata.

- [ ] **Step 7: Commit Task 5**

```bash
git add packages/table-hook
git commit -m "chore: verify table-hook feature parity"
```

---

## Self-Review

- Spec coverage: Tasks cover dnd-kit migration, row/Kanban drag parity, column/group drag parity, non-dnd feature parity, v9 API preservation, dependency cleanup, and package test/typecheck/build verification.
- Placeholder scan: The plan contains concrete file paths, commands, expected outcomes, and code snippets for each code-changing task.
- Type consistency: Task signatures use `DragEndEvent` and `DragOverEvent` from `@dnd-kit/react`; `handleRowDragEnd(event, options?: { reorder?: boolean })`; `handleKanbanRowDragOver(event)`; v9 feature maps remain object-shaped.
