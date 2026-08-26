# Table View Search and Advanced Filter UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add transient toolbar search and a full nested advanced-filter editor shared by all table-view layouts.

**Architecture:** A minimal `ViewControls` component moves the existing toolbar and active selector bar above the layout switch. It owns one Base UI detached popover handle shared by the toolbar Filter icon, active filter selector, and add-filter action; filter state remains authoritative in `table-hook` and is updated immediately through `table.setFilters`.

**Tech Stack:** React 19, TypeScript, TanStack Table atoms, Base UI-backed `@notion-kit/ui` primitives, Tailwind CSS, Vitest, Testing Library.

## Global Constraints

- Do not add dependencies or modify `packages/table-hook`.
- Search remains transient and uses `table.setGlobalFilter` / `table.resetGlobalFilter`.
- Advanced filters remain solely in `view.filters`; do not mirror them in React state.
- Support nested groups through the existing maximum of three group levels.
- Apply every valid filter edit immediately.
- Keep the active bar hidden when both recursive filter-rule count and sorting count are zero.
- Render controls for every layout selected by `Content`, excluding row view.
- Keep row-view surfaces above toolbar and active-bar stacking.

---

### Task 1: Pure filter-tree UI operations

**Files:**

- Create: `packages/table-view/src/tools/filter-tree.ts`
- Create: `packages/table-view/src/tools/filter-tree.test.ts`

**Interfaces:**

- Consumes: `FilterGroup`, `FilterRule`, `FilterLogic`, and `FilterValue` from `@notion-kit/table-hook`.
- Produces: `countFilterRules`, `appendFilterNode`, `updateFilterNode`, `removeFilterNode`, and `createFilterRule` for the editor.

- [ ] **Step 1: Write failing tests for counting and immutable nested mutations**

Cover a three-level fixture and assert recursive count, append, update, removal,
unchanged sibling identity, and `null` when the last root rule is removed:

```ts
expect(countFilterRules(tree)).toBe(4);
const appended = appendFilterNode(tree, "nested", newRule);
expect(appended).not.toBeNull();
expect(appended?.children[1]).not.toBe(tree.children[1]);
expect(
  updateFilterNode(tree, "rule-2", (rule) => ({
    ...rule,
    operator: "is-empty",
  })),
).toMatchObject({ kind: "group" });
expect(removeFilterNode(singleRuleTree, "rule-1")).toBeNull();
```

- [ ] **Step 2: Run the focused test and verify failure**

Run:

```sh
pnpm --filter @notion-kit/table-view test -- filter-tree.test.ts
```

Expected: FAIL because `filter-tree.ts` does not exist.

- [ ] **Step 3: Implement only the required pure helpers**

Use one recursive node mapper; do not introduce a reducer framework:

```ts
export function countFilterRules(state: TableFilterState | undefined): number {
  if (!state) return 0;
  return state.children.reduce(
    (count, child) =>
      count + (child.kind === "rule" ? 1 : countFilterRules(child)),
    0,
  );
}

export function createFilterRule(
  propertyId: string,
  operator: string,
): FilterRule {
  return { kind: "rule", id: v4(), propertyId, operator };
}
```

`appendFilterNode` creates an `and` root only when the state is nullish.
`updateFilterNode` and `removeFilterNode` recurse by ID and return untouched
branches by reference. Removing the last child of the root returns `null`;
empty nested groups remain editable until explicitly deleted.

- [ ] **Step 4: Run the focused tests**

Run the same command. Expected: PASS.

- [ ] **Step 5: Commit the pure helper slice**

```sh
git add packages/table-view/src/tools/filter-tree.ts packages/table-view/src/tools/filter-tree.test.ts
git commit -m "feat(table-view): add filter tree editor helpers"
```

### Task 2: Shared controls and transient toolbar search

**Files:**

- Create: `packages/table-view/src/tools/view-controls.tsx`
- Create: `packages/table-view/src/tools/active-bar.tsx`
- Modify: `packages/table-view/src/tools/toolbar.tsx`
- Modify: `packages/table-view/src/tools/index.ts`
- Modify: `packages/table-view/src/table-contexts/table-view-provider.tsx`
- Modify: `packages/table-view/src/table-contexts/table-view-content.tsx`
- Modify: `packages/table-view/src/row-view/full-view.tsx`
- Modify: `packages/table-view/src/tools/toolbar.test.tsx`
- Create: `packages/table-view/src/tools/view-controls.test.tsx`

**Interfaces:**

- Consumes: `countFilterRules` from Task 1 and `PopoverHandle<FilterPopoverPayload>` from UI primitives.
- Produces: `FilterPopoverPayload = { action?: "view" | "add-root-rule" }`, `ViewControls`, and a layout-independent `ActiveBar`.

- [ ] **Step 1: Add failing search and shared-layout tests**

Extend the component object with `searchInput()` and assert:

```ts
await tableView.clickButton("Search");
expect(tableView.searchInput()).toHaveFocus();
await tableView.user.type(tableView.searchInput(), "john");
expect(tableView.rows("John")).toHaveLength(1);
await tableView.user.clear(tableView.searchInput());
expect(tableView.rows()).toHaveLength(mockData.length);
```

Add parameterized layout cases for `table`, `list`, `board`, and `timeline`.
For each, assert the Search and Filter toolbar buttons exist. With one sort,
assert the active bar and SortSelector exist; without sorting/filter rules,
assert the active bar is absent. Assert the full row-view section has the
chosen overlay z-index class.

- [ ] **Step 2: Run the focused tests and verify failure**

```sh
pnpm --filter @notion-kit/table-view test -- toolbar.test.tsx view-controls.test.tsx
```

Expected: FAIL because search is not interactive and non-table layouts do not
render the active bar.

- [ ] **Step 3: Replace the Search placeholder in `Toolbar`**

Keep the behavior local and mirror `people.tsx`:

```tsx
const inputRef = useRef<HTMLInputElement>(null);
const [searchOpen, setSearchOpen] = useState(false);

<Button
  variant="nav-icon"
  aria-label="Search"
  onClick={() => {
    setSearchOpen((open) => !open);
    inputRef.current?.focus();
  }}
>
  <Icon.MagnifyingGlassSmall />
</Button>
<Input
  ref={inputRef}
  clear
  variant="flat"
  className={cn(
    "transition-[width,opacity] duration-200 ease-in-out",
    searchOpen ? "w-[150px] opacity-100" : "w-0 p-0 opacity-0",
  )}
  aria-label="Search table"
  placeholder="Search"
  value={String(table.atoms.globalFilter.get() ?? "")}
  onChange={(event) => table.setGlobalFilter(event.target.value)}
  onCancel={() => table.resetGlobalFilter()}
/>
```

Wrap it in `table.Subscribe` for `state.globalFilter` so controlled rendering
follows the table atom without a duplicated query state.

- [ ] **Step 4: Move control ownership above `Content`**

Create `ViewControls` with one memoized detached handle and render it once from
`TableView`:

```tsx
const filterHandle = useMemo(
  () => Popover.createHandle<FilterPopoverPayload>(),
  [],
);

return (
  <>
    <Toolbar filterHandle={filterHandle} />
    <ActiveBar filterHandle={filterHandle} />
    <Popover handle={filterHandle}>{/* Task 4 content */}</Popover>
  </>
);
```

`ActiveBar` subscribes to `sorting` and `tableGlobal.filters`, renders nothing
when both counts are zero, and otherwise renders `SortSelector` plus the
temporary filter slots Task 4 will fill. Remove the selector bar and placeholder
Filter button from `TableViewContent`.

- [ ] **Step 5: Correct full row-view stacking**

Add an explicit overlay layer to the fixed full-view section, using the same
menu-layer token as row-view dialog/sheet surfaces:

```tsx
className = "fixed inset-0 z-(--z-menu) overflow-y-auto bg-main";
```

Keep the toolbar/active bar at the existing row layer; do not increase them.

- [ ] **Step 6: Run focused tests**

Run the command from Step 2. Expected: PASS.

- [ ] **Step 7: Commit shared controls and search**

```sh
git add packages/table-view/src/tools packages/table-view/src/table-contexts packages/table-view/src/row-view/full-view.tsx
git commit -m "feat(table-view): share controls across layouts"
```

### Task 3: Recursive filter editor and operand controls

**Files:**

- Create: `packages/table-view/src/tools/filter-menu.tsx`
- Create: `packages/table-view/src/tools/filter-menu.test.tsx`
- Modify: `packages/table-view/src/__tests__/component-objects/table-view.ts`

**Interfaces:**

- Consumes: the Task 1 mutations; `table.getFilters`, `table.setFilters`, `table.clearFilters`, `table.getColumnPlugin`, and `columnsInfo`.
- Produces: `FilterMenu({ initialAction?: "view" | "add-root-rule" })`.

- [ ] **Step 1: Write failing recursive editor tests**

Add a `FilterMenuObject` component object and cover:

```ts
await filter.chooseProperty("Name");
await filter.chooseOperator("Contains");
await filter.typeTextOperand("alpha");
expect(onViewChange).toHaveBeenLastCalledWith(
  expect.objectContaining({
    next: expect.objectContaining({ filters: expect.any(Object) }),
  }),
);
```

Also cover adding a group within a group, changing group logic to OR, disabling
group creation at level three, deleting a rule/group, clearing the root, and
rendering an unavailable stored property without throwing.

Parameterize operand tests for:

- text string;
- finite number;
- select option name;
- `{ timestamp }`;
- `{ start, end }`; and
- `{ offsetDays }`.

- [ ] **Step 2: Run the focused test and verify failure**

```sh
pnpm --filter @notion-kit/table-view test -- filter-menu.test.tsx
```

Expected: FAIL because `FilterMenu` does not exist.

- [ ] **Step 3: Implement one recursive group renderer**

Keep group and rule rendering in `filter-menu.tsx`; do not create one file per
control. The recursive boundary is one `FilterGroupEditor`:

```tsx
function FilterGroupEditor({ group, depth, root = false }: Props) {
  return (
    <div
      data-depth={depth}
      className={cn(!root && "rounded-lg bg-secondary/40 p-3")}
    >
      {group.children.map((child, index) =>
        child.kind === "group" ? (
          <FilterGroupEditor key={child.id} group={child} depth={depth + 1} />
        ) : (
          <FilterRuleEditor key={child.id} rule={child} />
        ),
      )}
      <AddFilterNode groupId={group.id} depth={depth} />
    </div>
  );
}
```

Use existing `Select`, `Popover`, `Autocomplete`, `Input`, `Calendar`,
`DropdownMenu`, and `Button` primitives. Property choices come from live
`columnsInfo`, excluding deleted columns and plugins without operators.

- [ ] **Step 4: Implement metadata-driven operands**

Switch only on the seven existing `operand.kind` values. Persist the exact
shapes from the design. On property or operator replacement, omit `value`:

```ts
updateRule(rule.id, (current) => ({
  kind: "rule",
  id: current.id,
  propertyId,
  operator: plugin.filtering!.operators[0]!.id,
}));
```

Reject non-finite numbers and incomplete date ranges before calling
`table.setFilters`. Use the selected property's `config.options` for option
values and its date timezone for displayed dates.

- [ ] **Step 5: Implement add/delete and logic behavior**

Use `v4()` IDs. Root creation uses `logic: "and"`. Add-group is unavailable at
depth three. The ellipsis menu contains Delete only. Removing the final root
rule calls `table.clearFilters()`. Root `Delete filter` always clears the tree.

- [ ] **Step 6: Run focused tests**

Run the Step 2 command. Expected: PASS.

- [ ] **Step 7: Commit the editor**

```sh
git add packages/table-view/src/tools/filter-menu.tsx packages/table-view/src/tools/filter-menu.test.tsx packages/table-view/src/__tests__/component-objects
git commit -m "feat(table-view): add nested filter editor"
```

### Task 4: Wire both detached triggers and finish the active bar

**Files:**

- Create: `packages/table-view/src/tools/filter-selector.tsx`
- Modify: `packages/table-view/src/tools/view-controls.tsx`
- Modify: `packages/table-view/src/tools/active-bar.tsx`
- Modify: `packages/table-view/src/tools/toolbar.tsx`
- Modify: `packages/table-view/src/tools/index.ts`
- Modify: `packages/table-view/src/tools/toolbar.test.tsx`
- Modify: `packages/table-view/src/tools/view-controls.test.tsx`

**Interfaces:**

- Consumes: `FilterMenu` from Task 3 and the detached handle/payload from Task 2.
- Produces: the complete shared two-trigger filter workflow.

- [ ] **Step 1: Add failing detached-trigger integration tests**

Assert that the toolbar button and active pill each expose popover semantics and
open exactly one editor. With no filters, toolbar open must show the property
picker and closing must not call `onViewChange`. With filters, `+ Filter` must
open the root picker for a new rule.

- [ ] **Step 2: Run the focused tests and verify failure**

```sh
pnpm --filter @notion-kit/table-view test -- toolbar.test.tsx view-controls.test.tsx
```

Expected: FAIL because filter triggers are not wired to `FilterMenu`.

- [ ] **Step 3: Add the SortSelector-shaped filter pill**

Use the same soft-blue, rounded trigger treatment as `sort-selector.tsx`:

```tsx
<PopoverTrigger
  handle={filterHandle}
  payload={{ action: "view" }}
  render={
    <Button
      variant="soft-blue"
      size="xs"
      className="gap-1 rounded-full px-2 text-sm"
    >
      <Icon.FilterSmall className="size-4" />
      {count} {count === 1 ? "rule" : "rules"}
      <Icon.Chevron side="down" className="size-3" />
    </Button>
  }
/>
```

The toolbar Filter icon uses the same handle and `view` payload. The active
bar `+ Filter` action uses `{ action: "add-root-rule" }`.

- [ ] **Step 4: Render one shared popover content instance**

```tsx
<Popover handle={filterHandle}>
  {({ payload }) => (
    <PopoverContent
      align="start"
      side="bottom"
      collisionPadding={12}
      className="max-h-[min(70vh,720px)] w-[min(960px,calc(100vw-24px))] overflow-auto"
    >
      <FilterMenu initialAction={payload?.action} />
    </PopoverContent>
  )}
</Popover>
```

`FilterMenu` auto-opens the first/root property picker when filters are empty
or the action is `add-root-rule`, but does not append a rule until a property is
selected.

- [ ] **Step 5: Run the complete package verification**

```sh
pnpm --filter @notion-kit/table-view test
pnpm --filter @notion-kit/table-view typecheck
pnpm --filter @notion-kit/table-view lint
pnpm --filter @notion-kit/table-view build
```

Expected: all commands exit 0.

- [ ] **Step 6: Manually inspect the four layouts and three row-view modes**

Confirm toolbar/search alignment, conditional active-bar height, popover
anchoring from both triggers, nested editor overflow, and row-view coverage.

- [ ] **Step 7: Commit the completed UI**

```sh
git add packages/table-view/src/tools
git commit -m "feat(table-view): wire advanced filter controls"
```

## Plan self-review

- Every design requirement maps to Tasks 1–4.
- No task modifies `table-hook` or adds a dependency.
- Filter tree signatures are consistent across helper, editor, and trigger tasks.
- The implementation is limited to one shared control owner, one recursive
  editor file, and one pure helper file; no generalized form or overlay system
  is introduced.
