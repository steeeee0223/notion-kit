# dnd-kit Milestones 1–3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add dnd-kit 0.5, build shared sortable primitives, and migrate every ordinary single-list sortable consumer while leaving board-view and free-form dragging on the legacy API until the next plan.

**Architecture:** Install the new and legacy package families side by side so each commit remains buildable. Centralize single-list provider, sensor, modifier, item, handle, and overlay behavior in `@notion-kit/ui/primitives`, then migrate table-view ordering APIs from drag events to ordered IDs before moving consumers onto the primitive.

**Tech Stack:** React 19, TypeScript, dnd-kit 0.5, Base UI `useRender`, TanStack Table, Vitest, Testing Library, pnpm workspaces.

---

## Boundaries

Included:

- Milestone 1: add `@dnd-kit/abstract`, `@dnd-kit/dom`, `@dnd-kit/helpers`, and `@dnd-kit/react` at `^0.5.0`.
- Milestone 2: add `Sortable.Root`, `Sortable.List`, `Sortable.Item`, `Sortable.Handle`, and `Sortable.Overlay`.
- Milestone 3: migrate table/list rows, table columns, table-view menu lists, select options, workspace lists, Cool Todo, and the ordinary selectable Storybook list.

Deferred:

- `packages/table-view/src/board-view/**`
- `packages/ui/src/timeline/**`
- `apps/storybook/src/stories/blocks/falling-blocks.stories.tsx`
- removal of legacy dnd-kit dependencies and `packages/table-view/src/common/dnd.tsx`

The deferred consumers require the legacy packages, so zero-legacy-import verification belongs to milestones 4–6.

## File Structure

### Create

- `packages/ui/src/primitives/sortable.tsx`: shared sortable compound primitive.
- `packages/ui/src/primitives/sortable.test.tsx`: primitive behavior and composition tests.
- `packages/table-view/src/features/utils.test.ts`: ordered-ID merge helper tests.
- `packages/table-view/src/__tests__/sortable-rendering.test.tsx`: table/header/list primitive integration smoke tests.
- `packages/ui/src/sidebar/presets/_components/workspace-list.test.tsx`: workspace sortable integration test.

### Modify

- `pnpm-workspace.yaml`, `pnpm-lock.yaml`: add the new package suite while retaining legacy entries.
- `packages/ui/package.json`, `packages/table-view/package.json`, `apps/storybook/package.json`: add direct new dependencies.
- `packages/ui/src/primitives/index.ts`: export the primitive.
- `packages/table-view/src/features/{utils,columns-info,grouping,row-actions}.ts`: add ordered-ID APIs.
- `packages/table-view/src/__tests__/{columns-info,grouping,row-actions}.test.tsx`: stop fabricating legacy events for ordinary ordering.
- `packages/table-view/src/{table-body,list-view,table-header}/**`: adopt shared sortable primitives.
- `packages/table-view/src/menus/{sort-menu,edit-group-menu,props-menu}.tsx`: adopt shared primitives.
- `packages/table-view/src/plugins/select/{select-menu,select-config-menu}/**`: adopt shared primitives and ordered-ID callbacks.
- `packages/table-view/src/common/table-row-action-group.tsx`: attach `Sortable.Handle` directly.
- `packages/ui/src/sidebar/presets/_components/workspace-list.tsx`: adopt shared primitives.
- `apps/storybook/src/stories/blocks/cool-todo/cool-todo.tsx`: use the shared primitive.
- `apps/storybook/src/stories/ui/selectable/draggable.tsx`: use shared items/overlay while keeping its custom multi-selection completion logic.

### Delete

- `apps/storybook/src/stories/blocks/cool-todo/sortable.tsx`: superseded by `@notion-kit/ui/primitives`.

---

## Milestone 1: Dependency Foundation

### Task 1: Add dnd-kit 0.5 Beside The Legacy Packages

**Files:**

- Modify: `pnpm-workspace.yaml`
- Modify: `packages/ui/package.json`
- Modify: `packages/table-view/package.json`
- Modify: `apps/storybook/package.json`
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: Add the new catalog entries**

In the `ui` catalog in `pnpm-workspace.yaml`, retain the legacy entries and add:

```yaml
"@dnd-kit/abstract": ^0.5.0
"@dnd-kit/dom": ^0.5.0
"@dnd-kit/helpers": ^0.5.0
"@dnd-kit/react": ^0.5.0
```

- [ ] **Step 2: Add direct dependencies to each consumer workspace**

Add these entries to `packages/ui/package.json`:

```json
"@dnd-kit/abstract": "catalog:ui",
"@dnd-kit/dom": "catalog:ui",
"@dnd-kit/helpers": "catalog:ui",
"@dnd-kit/react": "catalog:ui"
```

Add these entries to `packages/table-view/package.json`:

```json
"@dnd-kit/abstract": "catalog:ui",
"@dnd-kit/helpers": "catalog:ui",
"@dnd-kit/react": "catalog:ui"
```

Add these entries to `apps/storybook/package.json`:

```json
"@dnd-kit/dom": "catalog:ui",
"@dnd-kit/helpers": "catalog:ui",
"@dnd-kit/react": "catalog:ui"
```

- [ ] **Step 3: Regenerate the lockfile**

Run:

```bash
pnpm install
```

Expected: installation succeeds and `pnpm-lock.yaml` contains `@dnd-kit/*@0.5.0` entries alongside the legacy packages.

- [ ] **Step 4: Verify workspace dependency consistency**

Run:

```bash
pnpm lint:ws
```

Expected: PASS with no workspace dependency errors.

- [ ] **Step 5: Commit**

```bash
git add pnpm-workspace.yaml pnpm-lock.yaml packages/ui/package.json packages/table-view/package.json apps/storybook/package.json
git commit -m "chore: add dnd-kit 0.5 dependencies"
```

---

## Milestone 2: Shared Sortable Primitives

### Task 2: Specify The Primitive With Failing Tests

**Files:**

- Create: `packages/ui/src/primitives/sortable.test.tsx`

- [ ] **Step 1: Mock the provider and sortable hook at module boundaries**

Use `vi.hoisted` to capture the provider completion callback and return stable hook state:

```tsx
const dnd = vi.hoisted(() => ({
  onDragEnd: undefined as
    | ((event: DragEndEvent, manager: DragDropManager) => void)
    | undefined,
  handleRef: vi.fn(),
  itemRef: vi.fn(),
}));

vi.mock("@dnd-kit/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@dnd-kit/react")>();
  return {
    ...actual,
    DragDropProvider: ({ children, onDragEnd }: React.PropsWithChildren<{
      onDragEnd?: typeof dnd.onDragEnd;
    }>) => {
      dnd.onDragEnd = onDragEnd;
      return children;
    },
  };
});

vi.mock("@dnd-kit/react/sortable", () => ({
  useSortable: () => ({
    sortable: { id: "one" },
    isDragging: false,
    isDropping: false,
    isDragSource: false,
    isDropTarget: false,
    handleRef: dnd.handleRef,
    ref: dnd.itemRef,
    sourceRef: vi.fn(),
    targetRef: vi.fn(),
  }),
}));
```

- [ ] **Step 2: Add structural and composition tests**

Add tests that render:

```tsx
<Sortable.Root items={["one", "two"]} onItemsChange={vi.fn()}>
  <Sortable.List>
    <Sortable.Item id="one" index={0}>
      <Sortable.Handle aria-label="Move one" />
    </Sortable.Item>
    <Sortable.Item id="two" index={1} render={<article />} />
  </Sortable.List>
</Sortable.Root>
```

Assert:

```tsx
expect(screen.getByRole("button", { name: "Move one" })).toHaveAttribute(
  "data-slot",
  "sortable-handle",
);
expect(document.querySelector("[data-slot='sortable-list']")).toHaveClass(
  "flex-col",
);
expect(document.querySelector("article")).toHaveAttribute(
  "data-slot",
  "sortable-item",
);
expect(dnd.itemRef).toHaveBeenCalled();
expect(dnd.handleRef).toHaveBeenCalled();
```

- [ ] **Step 3: Add reorder and no-op tests**

Invoke the captured callback with minimal typed event fixtures:

```tsx
const event = {
  canceled: false,
  operation: {
    canceled: false,
    source: { id: "one" },
    target: { id: "two" },
  },
} as DragEndEvent;

dnd.onDragEnd?.(event, {} as DragDropManager);
expect(onItemsChange).toHaveBeenCalledWith(["two", "one"], event);
```

Add separate assertions that canceled events, missing targets, identical IDs, and IDs absent from `items` do not call `onItemsChange`.

- [ ] **Step 4: Run the test and verify failure**

```bash
pnpm --filter @notion-kit/ui test -- src/primitives/sortable.test.tsx
```

Expected: FAIL because `./sortable` does not exist.

- [ ] **Step 5: Commit the failing test**

```bash
git add packages/ui/src/primitives/sortable.test.tsx
git commit -m "test: specify sortable primitives"
```

### Task 3: Implement The Primitive Family

**Files:**

- Create: `packages/ui/src/primitives/sortable.tsx`
- Modify: `packages/ui/src/primitives/index.ts`
- Test: `packages/ui/src/primitives/sortable.test.tsx`

- [ ] **Step 1: Define provider context and pointer sensors**

Use the current API imports:

```tsx
"use client";

import React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import {
  RestrictToHorizontalAxis,
  RestrictToVerticalAxis,
  type UniqueIdentifier,
} from "@dnd-kit/abstract";
import {
  PointerActivationConstraints,
  PointerSensor,
} from "@dnd-kit/dom";
import { RestrictToElement } from "@dnd-kit/dom/modifiers";
import { move } from "@dnd-kit/helpers";
import {
  DragDropProvider,
  DragOverlay,
  type DragEndEvent,
} from "@dnd-kit/react";
import {
  useSortable,
  type UseSortableInput,
} from "@dnd-kit/react/sortable";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";

import { Button, type ButtonProps } from "./button";
import { composeRefs } from "./compose-refs";

type Orientation = "horizontal" | "vertical";

const sensors: React.ComponentProps<typeof DragDropProvider>["sensors"] =
  (defaults) => [
    ...defaults.filter((sensor) => sensor !== PointerSensor),
    PointerSensor.configure({
      activationConstraints(event) {
        return event.pointerType === "touch"
          ? [
              new PointerActivationConstraints.Delay({
                value: 250,
                tolerance: { x: 5, y: 5 },
              }),
            ]
          : [new PointerActivationConstraints.Distance({ value: 5 })];
      },
    }),
  ];
```

The root context stores `orientation`, `disabled`, and default item modifiers. Use `RestrictToElement.configure({ element: (operation) => operation.source?.element?.parentElement ?? null })` with the orientation axis modifier.

- [ ] **Step 2: Implement `Sortable.Root`**

Define its controlled contract:

```tsx
interface SortableRootProps
  extends Omit<
      React.ComponentProps<typeof DragDropProvider>,
      "onDragEnd" | "sensors"
    > {
  children?: React.ReactNode;
  items: UniqueIdentifier[];
  orientation?: Orientation;
  disabled?: boolean;
  onItemsChange?: (items: UniqueIdentifier[], event: DragEndEvent) => void;
  onDragEnd?: React.ComponentProps<typeof DragDropProvider>["onDragEnd"];
  sensors?: React.ComponentProps<typeof DragDropProvider>["sensors"];
}
```

The completion handler must call the consumer callback, reject canceled/stale/no-target operations, and then call `move`:

```tsx
const handleDragEnd: NonNullable<SortableRootProps["onDragEnd"]> = (
  event,
  manager,
) => {
  onDragEnd?.(event, manager);
  const { source, target } = event.operation;
  if (
    event.canceled ||
    !source ||
    !target ||
    source.id === target.id ||
    !items.includes(source.id) ||
    !items.includes(target.id)
  ) {
    return;
  }
  const next = move(items, event);
  if (next !== items) onItemsChange?.(next, event);
};
```

- [ ] **Step 3: Implement list, item, handle, and overlay parts**

`Sortable.List` uses `useRender`, applies `data-slot="sortable-list"`, and defaults to `relative flex flex-col` or `relative flex flex-row`.

`Sortable.Item` combines DOM props with these options:

```tsx
type SortableItemOptions = Omit<
  UseSortableInput,
  "id" | "index" | "element" | "handle" | "target"
>;

interface SortableItemState {
  dragging: boolean;
  dropping: boolean;
  dragSource: boolean;
  dropTarget: boolean;
}

interface SortableItemProps
  extends useRender.ComponentProps<"div", SortableItemState>,
    SortableItemOptions {
  id: UniqueIdentifier;
  index: number;
}
```

Pass explicit item options to `useSortable`, merge root disabled/modifier defaults, attach `ref`, and render state attributes through `useRender`. Apply:

```tsx
className: cn(
  "relative cursor-grab data-dragging:z-50 data-dragging:cursor-grabbing data-dragging:opacity-80",
  className,
)
```

`Sortable.Handle` consumes the item context and renders a `Button`:

```tsx
<Button
  ref={composeRefs(handleRef, ref)}
  type="button"
  variant="hint"
  data-slot="sortable-handle"
  aria-label={ariaLabel ?? "Drag item"}
  className={cn("cursor-grab touch-none active:cursor-grabbing", className)}
  render={render}
  {...props}
>
  {children ?? <Icon.DragHandle className="size-3.5 fill-icon" />}
</Button>
```

Throw `new Error("Sortable.Handle must be used inside Sortable.Item")` when the item context is absent.

`Sortable.Overlay` wraps `DragOverlay`, defaults `dropAnimation={null}`, and portals to `document.body` when the document exists.

Export both named functions and:

```tsx
const Sortable = {
  Root: SortableRoot,
  List: SortableList,
  Item: SortableItem,
  Handle: SortableHandle,
  Overlay: SortableOverlay,
};
```

- [ ] **Step 4: Export the primitive**

Add to `packages/ui/src/primitives/index.ts`:

```tsx
export * from "./sortable";
```

- [ ] **Step 5: Run primitive verification**

```bash
pnpm --filter @notion-kit/ui test -- src/primitives/sortable.test.tsx
pnpm --filter @notion-kit/ui typecheck
```

Expected: both commands PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/primitives/sortable.tsx packages/ui/src/primitives/sortable.test.tsx packages/ui/src/primitives/index.ts
git commit -m "feat(ui): add sortable primitives"
```

---

## Milestone 3: Ordinary Sortable Migration

### Task 4: Add Ordered-ID Table APIs

**Files:**

- Create: `packages/table-view/src/features/utils.test.ts`
- Modify: `packages/table-view/src/features/utils.ts`
- Modify: `packages/table-view/src/features/columns-info.ts`
- Modify: `packages/table-view/src/features/grouping.ts`
- Modify: `packages/table-view/src/features/row-actions.ts`
- Modify: `packages/table-view/src/__tests__/columns-info.test.tsx`
- Modify: `packages/table-view/src/__tests__/grouping.test.tsx`
- Modify: `packages/table-view/src/__tests__/row-actions.test.tsx`

- [ ] **Step 1: Test ordered subset merging**

Add tests for this public helper contract:

```tsx
expect(reorderByIds(["a", "b", "c"], ["c", "a", "b"], (id) => id)).toEqual([
  "c",
  "a",
  "b",
]);
expect(
  reorderByIds(["a", "deleted", "b"], ["b", "a"], (id) => id),
).toEqual(["b", "deleted", "a"]);
expect(reorderByIds(["a", "b"], ["missing", "a"], (id) => id)).toEqual([
  "a",
  "b",
]);
```

Also update feature tests to call:

```tsx
table.handleColumnOrderChange(["col2", "col1"]);
table.handleGroupedRowOrderChange([secondGroupId, firstGroupId]);
table.handleRowOrderChange(["row2", "row1"]);
```

Remove the skipped marker from the grouped-row ordering test.

- [ ] **Step 2: Run the focused tests and verify failure**

```bash
pnpm --filter @notion-kit/table-view test -- src/features/utils.test.ts src/__tests__/columns-info.test.tsx src/__tests__/grouping.test.tsx src/__tests__/row-actions.test.tsx
```

Expected: FAIL because the helper and ordered-ID APIs do not exist.

- [ ] **Step 3: Implement `reorderByIds`**

Add to `features/utils.ts`:

```tsx
export function reorderByIds<T>(
  items: T[],
  orderedIds: string[],
  selector: (item: T) => string,
): T[] {
  if (new Set(orderedIds).size !== orderedIds.length) return items;
  const itemsById = new Map(items.map((item) => [selector(item), item]));
  if (orderedIds.some((id) => !itemsById.has(id))) return items;

  const ordered = orderedIds.map((id) => itemsById.get(id)!);
  const orderedSet = new Set(orderedIds);
  let index = 0;
  return items.map((item) =>
    orderedSet.has(selector(item)) ? ordered[index++]! : item,
  );
}
```

- [ ] **Step 4: Add ordered-ID APIs without removing legacy adapters yet**

Add these table API signatures:

```tsx
handleColumnOrderChange: (orderedIds: string[]) => void;
handleGroupedRowOrderChange: (orderedIds: string[]) => void;
handleRowOrderChange: (
  orderedIds: string[],
  moved?: { rowId: string; groupId: string },
) => void;
```

Implement all three through `reorderByIds`. `handleRowOrderChange` updates the grouping cell only when `moved` and a grouping column exist. Keep the legacy `handle*DragEnd` methods temporarily because board-view still compiles against them.

- [ ] **Step 5: Run focused verification**

```bash
pnpm --filter @notion-kit/table-view test -- src/features/utils.test.ts src/__tests__/columns-info.test.tsx src/__tests__/grouping.test.tsx src/__tests__/row-actions.test.tsx
```

Expected: PASS, including the formerly skipped group ordering test.

- [ ] **Step 6: Commit**

```bash
git add packages/table-view/src/features packages/table-view/src/__tests__/columns-info.test.tsx packages/table-view/src/__tests__/grouping.test.tsx packages/table-view/src/__tests__/row-actions.test.tsx
git commit -m "refactor(table-view): accept ordered ids for sorting"
```

### Task 5: Migrate Table Rows And Columns

**Files:**

- Create: `packages/table-view/src/__tests__/sortable-rendering.test.tsx`
- Modify: `packages/table-view/src/table-body/table-body.tsx`
- Modify: `packages/table-view/src/table-body/table-row.tsx`
- Modify: `packages/table-view/src/list-view/list-view-content.tsx`
- Modify: `packages/table-view/src/list-view/list-row.tsx`
- Modify: `packages/table-view/src/table-header/table-header-row.tsx`
- Modify: `packages/table-view/src/table-header/table-header-cell.tsx`
- Modify: `packages/table-view/src/common/table-row-action-group.tsx`

- [ ] **Step 1: Add a failing rendering test**

Render a default `TableView` using the existing mock data and assert:

```tsx
expect(document.querySelector("[data-slot='sortable-list']")).toBeInTheDocument();
expect(document.querySelectorAll("[data-slot='sortable-item']").length).toBeGreaterThan(1);
expect(document.querySelector("[data-slot='sortable-handle']")).toBeInTheDocument();
```

Run:

```bash
pnpm --filter @notion-kit/table-view test -- src/__tests__/sortable-rendering.test.tsx
```

Expected: FAIL because table rows and headers still use legacy hooks.

- [ ] **Step 2: Migrate body and list roots**

Replace each `SortableDnd` with:

```tsx
<Sortable.Root items={rows.map((row) => row.id)} onItemsChange={handleOrderChange}>
  <Sortable.List>
    {rows.map((row, index) => (
      <TableRow key={row.id} row={row} index={index} />
    ))}
  </Sortable.List>
</Sortable.Root>
```

The table and list handlers store pending ordered IDs when sorting is active. On confirmation they reset sorting and call `table.handleRowOrderChange(pendingOrder)`. Without active sorting they call `table.handleRowOrderChange(orderedIds)` immediately.

- [ ] **Step 3: Migrate row components and handles**

Add `index: number` to `TableRowProps` and `ListRowProps`. Replace `useSortable` and transform styles with:

```tsx
<Sortable.Item
  id={row.id}
  index={index}
  disabled={locked}
  data={{ type: "table-row", groupId: row.parentId }}
  render={
    <div
      data-block-id={row.id}
      className="group/row flex h-[calc(100%+2px)]"
    />
  }
>
```

Replace the matching outer closing `</div>` with `</Sortable.Item>` and leave
the row's existing descendants unchanged.

Remove `isDragging` from `RowActions` and `TableRowActionGroup`. Add
`group-data-dragging/row:opacity-100` to the action group's opacity classes and
remove the tooltip's `disabled={isDragging}` prop; active dnd-kit feedback
already prevents pointer interaction during the drag.

In `RowActions`, remove `dragHandleProps`. Render its action button through:

```tsx
<PopoverTrigger
  render={
    <Sortable.Handle
      render={
        <Button variant="hint" aria-label="Row actions" className="h-6 w-4.5">
          <Icon.DragHandle className="size-3.5 fill-icon" />
        </Button>
      }
    />
  }
/>
```

- [ ] **Step 4: Migrate the header**

Wrap the header columns with a horizontal `Sortable.Root` and `Sortable.List`, using `table.handleColumnOrderChange`. In `TableHeaderCell`, compute:

```tsx
const index = table.getState().columnOrder.indexOf(header.column.id);
```

Render the cell through `Sortable.Item` and the existing header button through `Sortable.Handle`. Remove `SortableContext`, legacy sensor hooks, transforms, and legacy modifiers.

- [ ] **Step 5: Verify**

```bash
pnpm --filter @notion-kit/table-view test -- src/__tests__/sortable-rendering.test.tsx src/__tests__/row-actions.test.tsx src/__tests__/columns-info.test.tsx
pnpm --filter @notion-kit/table-view typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/table-view/src/table-body packages/table-view/src/list-view packages/table-view/src/table-header packages/table-view/src/common/table-row-action-group.tsx packages/table-view/src/__tests__/sortable-rendering.test.tsx
git commit -m "refactor(table-view): use sortable primitives for rows and columns"
```

### Task 6: Migrate Table Menus And Select Options

**Files:**

- Modify: `packages/table-view/src/menus/sort-menu.tsx`
- Modify: `packages/table-view/src/menus/edit-group-menu.tsx`
- Modify: `packages/table-view/src/menus/props-menu.tsx`
- Modify: `packages/table-view/src/plugins/select/select-menu/select-menu.tsx`
- Modify: `packages/table-view/src/plugins/select/select-menu/option-item.tsx`
- Modify: `packages/table-view/src/plugins/select/select-menu/use-select-menu.ts`
- Modify: `packages/table-view/src/plugins/select/select-config-menu/select-config-menu.tsx`
- Modify: `packages/table-view/src/plugins/select/select-config-menu/option-item.tsx`
- Modify: `packages/table-view/src/plugins/select/select-config-menu/use-select-config-menu.ts`
- Test: `packages/table-view/src/menus/sort-menu.test.tsx`
- Test: `packages/table-view/src/menus/props-menu.test.tsx`
- Test: `packages/table-view/src/menus/edit-group-menu.test.tsx`
- Test: `packages/table-view/src/plugins/select/select-config-menu/select-config-menu.test.tsx`

- [ ] **Step 1: Add primitive-rendering assertions to existing menu tests**

After opening each list-bearing menu, assert:

```tsx
expect(document.querySelector("[data-slot='sortable-list']")).toBeInTheDocument();
expect(document.querySelector("[data-slot='sortable-handle']")).toBeInTheDocument();
```

Run the four test files and expect these assertions to fail.

- [ ] **Step 2: Replace each menu root**

Use this controlled pattern:

```tsx
<Sortable.Root items={ids} onItemsChange={onOrderChange}>
  <Sortable.List className="flex flex-col">
    {items.map((item, index) => (
      <Item key={item.id} item={item} index={index} />
    ))}
  </Sortable.List>
</Sortable.Root>
```

Apply it with these exact callbacks:

- Sort rules: reorder the `ColumnSort[]` by the emitted IDs.
- Edit groups: `table.handleGroupedRowOrderChange`.
- Properties: `table.handleColumnOrderChange`; disable items while search is non-empty.
- Select menu/config options: dispatch `update:sort:manual` with the emitted names array.

- [ ] **Step 3: Replace item hooks**

Add `index` to `SortRule`, `GroupItem`, `PropertyItem`, and both `OptionItem` prop interfaces. Render their existing menu element through `Sortable.Item`, and render every drag icon through:

```tsx
<Sortable.Handle
  aria-label={`Move ${label}`}
  render={<Button variant="hint" className="size-6" />}
>
  <Icon.DragHandle className="size-3 fill-icon" />
</Sortable.Handle>
```

For non-button icon slots, pass the existing `<div>` through `render`. Preserve `onPointerDown={(event) => event.stopPropagation()}` in the select-config submenu handle.

- [ ] **Step 4: Remove legacy array/event code from migrated menus**

Remove imports of `DragEndEvent`, `arrayMove`, `useSortable`, and `CSS` from these files. Change both select hook callbacks to:

```tsx
const reorderOptions = useCallback(
  (names: string[]) =>
    dispatch({ action: "update:sort:manual", updater: names }),
  [dispatch],
);
```

- [ ] **Step 5: Verify menu and select behavior**

```bash
pnpm --filter @notion-kit/table-view test -- src/menus/sort-menu.test.tsx src/menus/props-menu.test.tsx src/menus/edit-group-menu.test.tsx src/plugins/select/select-menu/select-menu.test.tsx src/plugins/select/select-config-menu/select-config-menu.test.tsx
pnpm --filter @notion-kit/table-view typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/table-view/src/menus packages/table-view/src/plugins/select
git commit -m "refactor(table-view): share sortable menu primitives"
```

### Task 7: Migrate Workspace And Storybook Sortable Lists

**Files:**

- Create: `packages/ui/src/sidebar/presets/_components/workspace-list.test.tsx`
- Modify: `packages/ui/src/sidebar/presets/_components/workspace-list.tsx`
- Modify: `apps/storybook/src/stories/blocks/cool-todo/cool-todo.tsx`
- Delete: `apps/storybook/src/stories/blocks/cool-todo/sortable.tsx`
- Modify: `apps/storybook/src/stories/ui/selectable/draggable.tsx`

- [ ] **Step 1: Add a failing workspace integration test**

Render two workspaces and assert two sortable items plus accessible handles:

```tsx
expect(document.querySelectorAll("[data-slot='sortable-item']")).toHaveLength(2);
expect(screen.getAllByRole("button", { name: /move workspace/i })).toHaveLength(2);
```

Run:

```bash
pnpm --filter @notion-kit/ui test -- src/sidebar/presets/_components/workspace-list.test.tsx
```

Expected: FAIL because workspace items still use legacy hooks.

- [ ] **Step 2: Migrate `WorkspaceList`**

Replace `DndContext` and `SortableContext` with:

```tsx
<Sortable.Root items={order} onItemsChange={(ids) => setOrder(ids.map(String))}>
  <Sortable.List render={<MenuGroup />}>
    {workspaceList.map((workspace, index) => (
      <WorkspaceItem
        key={workspace.id}
        workspace={workspace}
        index={index}
        activeWorkspace={activeWorkspace}
        onSelect={onSelect}
      />
    ))}
  </Sortable.List>
</Sortable.Root>
```

Wrap each existing workspace menu item in `Sortable.Item`, and use `Sortable.Handle aria-label={`Move workspace ${name}`}` for its drag button.

- [ ] **Step 3: Replace the Cool Todo local abstraction**

Import `Sortable` from `@notion-kit/ui/primitives`, rename `Sortable.DragHandle` to `Sortable.Handle`, add explicit item indexes, and change the store API to accept ordered active IDs:

```tsx
reorderTodos: (orderedIds) =>
  set((state) => {
    const byId = new Map(state.todos.map((todo) => [todo.id, todo]));
    const active = orderedIds.flatMap((id) => {
      const todo = byId.get(id);
      return todo ? [todo] : [];
    });
    const inactive = state.todos.filter((todo) => todo.status !== "active");
    return { todos: [...active, ...inactive] };
  }),
```

Delete `apps/storybook/src/stories/blocks/cool-todo/sortable.tsx`.

- [ ] **Step 4: Migrate the selectable ordinary list**

Use `Sortable.Root` without `onItemsChange`, retaining the custom `onDragEnd` that moves multiple selected items. Replace item hooks with `Sortable.Item` and split the presentational card from registration so `Sortable.Overlay` renders only presentation:

```tsx
<Sortable.Overlay>
  {(source) => <DraggableItemPreview source={source} />}
</Sortable.Overlay>
```

Do not call `useSortable` inside the overlay preview.

- [ ] **Step 5: Verify UI and Storybook**

```bash
pnpm --filter @notion-kit/ui test -- src/sidebar/presets/_components/workspace-list.test.tsx src/primitives/sortable.test.tsx
pnpm --filter @notion-kit/ui typecheck
pnpm --filter @notion-kit/storybook typecheck
pnpm --filter @notion-kit/storybook test
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/sidebar/presets/_components apps/storybook/src/stories/blocks/cool-todo apps/storybook/src/stories/ui/selectable/draggable.tsx
git commit -m "refactor: migrate shared sortable consumers"
```

### Task 8: Verify Milestones 1–3 And Record The Boundary

**Files:**

- Modify only files required to fix failures caused by milestones 1–3.

- [ ] **Step 1: Confirm remaining legacy imports are deferred only**

```bash
rg -l '@dnd-kit/(core|modifiers|sortable|utilities)|SortableDnd|useDndSensors' packages apps --glob '!**/dist/**'
```

Expected remaining paths are limited to board-view, timeline, falling blocks, `packages/table-view/src/common/dnd.tsx`, and manifests retaining legacy dependencies.

- [ ] **Step 2: Run affected package checks**

```bash
pnpm --filter @notion-kit/ui format
pnpm --filter @notion-kit/ui lint
pnpm --filter @notion-kit/ui typecheck
pnpm --filter @notion-kit/ui test
pnpm --filter @notion-kit/table-view format
pnpm --filter @notion-kit/table-view lint
pnpm --filter @notion-kit/table-view typecheck
pnpm --filter @notion-kit/table-view test
pnpm --filter @notion-kit/storybook typecheck
pnpm --filter @notion-kit/storybook test
```

Expected: all commands PASS.

- [ ] **Step 3: Build affected workspaces**

```bash
pnpm --filter @notion-kit/ui build
pnpm --filter @notion-kit/table-view build
pnpm --filter @notion-kit/storybook build
```

Expected: all builds complete successfully.

- [ ] **Step 4: Commit verification fixes, if the checks required changes**

```bash
git add packages/ui packages/table-view apps/storybook
git commit -m "fix: stabilize sortable consumer migration"
```

Skip this commit when verification required no file changes.

## Milestone Exit Criteria

- dnd-kit 0.5 packages are installed alongside legacy packages.
- The shared sortable primitive is exported and tested.
- Every ordinary single-list consumer uses the shared primitive.
- Table ordering APIs accept ordered IDs instead of requiring dnd-kit events.
- Board-view, timeline, and falling blocks still compile on the legacy API.
- UI, table-view, and Storybook tests, typechecks, and builds pass.

## References

- Migration guide: https://dndkit.com/react/guides/migration/
- Multiple sortable lists guide: https://dndkit.com/react/guides/multiple-sortable-lists/
- `useSortable`: https://dndkit.com/react/hooks/use-sortable/
