# Table View Dropdown Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the table-view toolbar and in-scope table-view menus with `DropdownMenu` primitives while preserving current menu navigation and fixing nested menu visibility/event issues.

**Architecture:** Convert the outer toolbar sort/settings floating roots from `Popover` to `DropdownMenu`, then migrate each in-scope menu page to dropdown-native items and inline non-item controls. Inputs, selects, switches, buttons, and drag handles inside dropdown content stop event propagation so the parent menu does not consume their interactions.

**Tech Stack:** React 19, TypeScript, Base UI `Menu` wrappers from `@notion-kit/ui/primitives`, Vitest, Testing Library, pnpm.

---

## File Structure

- Modify `packages/table-view/src/tools/toolbar.tsx`: replace popover roots with dropdown roots for Sort and Settings.
- Modify `packages/table-view/src/common/menu.tsx`: replace `PopoverClose` with a close `Button` that closes table menu state by default.
- Modify `packages/table-view/src/menus/table-view-menu.tsx`: render the main settings page using dropdown groups/items/separators.
- Modify `packages/table-view/src/menus/sort-menu.tsx`: render sort actions with dropdown primitives and replace the add-sort popover with an inline autocomplete panel.
- Modify `packages/table-view/src/menus/layout-menu.tsx`: render layout content inside dropdown content and replace the nested row-view dropdown with inline row-view choices.
- Modify `packages/table-view/src/menus/select-group-menu.tsx`: keep autocomplete inline and contain its keyboard events inside dropdown content.
- Modify `packages/table-view/src/menus/edit-group-menu.tsx`: render menu actions with dropdown primitives and contain switch/button/drag interactions.
- Modify `packages/table-view/src/tools/toolbar.test.tsx`: assert dropdown open/close and close-button behavior.
- Modify `packages/table-view/src/menus/table-view-menu.test.tsx`: assert settings page navigation still works with dropdown-native items.
- Modify `packages/table-view/src/menus/sort-menu.test.tsx`: assert inline add-sort search and sort-rule selects are usable.
- Modify `packages/table-view/src/menus/layout-menu.test.tsx`: assert row-view selection works without nested floating content.
- Modify `packages/table-view/src/menus/select-group-menu.test.tsx`: assert typed filtering is not intercepted by the parent dropdown.
- Modify `packages/table-view/src/menus/edit-group-menu.test.tsx`: assert switch/action buttons do not close the dropdown.
- Modify `issues.md`: record the root causes for issues 5.1 and 6.2 after the migration fix is verified.

## Commands

- Focused tests: `pnpm --filter @notion-kit/table-view test -- src/tools/toolbar.test.tsx src/menus/table-view-menu.test.tsx src/menus/sort-menu.test.tsx src/menus/layout-menu.test.tsx src/menus/select-group-menu.test.tsx src/menus/edit-group-menu.test.tsx`
- Full package tests: `pnpm --filter @notion-kit/table-view test`
- Typecheck: `pnpm --filter @notion-kit/table-view typecheck`

---

### Task 1: Add Failing Tests For Dropdown Shell Behavior

**Files:**
- Modify: `packages/table-view/src/tools/toolbar.test.tsx`
- Modify: `packages/table-view/src/menus/table-view-menu.test.tsx`

- [ ] **Step 1: Add a settings close-button regression test**

Add this test under `describe("Settings Button", ...)` in `packages/table-view/src/tools/toolbar.test.tsx`:

```tsx
it("should close the settings dropdown when clicking the close button", async () => {
  const user = userEvent.setup();
  renderToolbar();

  const settingsButton = screen.getByRole("button", { name: "Settings" });
  await user.click(settingsButton);

  expect(
    screen.getByRole("heading", { name: "View Settings" }),
  ).toBeInTheDocument();

  const closeButton = screen.getByRole("button", { name: "Close" });
  await user.click(closeButton);

  expect(
    screen.queryByRole("heading", { name: "View Settings" }),
  ).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Add a menu-stays-open regression test for settings actions**

Add this test under `describe("Navigation", ...)` in `packages/table-view/src/menus/table-view-menu.test.tsx`:

```tsx
it("should keep the settings dropdown open when navigating between menu pages", async () => {
  const user = userEvent.setup();
  const menu = await openSettingsMenu(user);

  await user.click(within(menu).getByRole("menuitem", { name: "Layout" }));

  expect(screen.getByRole("heading", { name: "Layout" })).toBeInTheDocument();
  expect(screen.getByRole("menu")).toBeInTheDocument();
});
```

- [ ] **Step 3: Run focused tests and verify the new close test fails**

Run:

```bash
pnpm --filter @notion-kit/table-view test -- src/tools/toolbar.test.tsx src/menus/table-view-menu.test.tsx
```

Expected: at least the close-button test fails because `MenuHeader` still uses `PopoverClose` and the settings root is not a dropdown-controlled close flow.

- [ ] **Step 4: Commit the failing tests**

Run:

```bash
git add packages/table-view/src/tools/toolbar.test.tsx packages/table-view/src/menus/table-view-menu.test.tsx
git commit -m "test: cover table view dropdown shell behavior"
```

---

### Task 2: Convert Toolbar, Menu Header, And Main Settings Page

**Files:**
- Modify: `packages/table-view/src/tools/toolbar.tsx`
- Modify: `packages/table-view/src/common/menu.tsx`
- Modify: `packages/table-view/src/menus/table-view-menu.tsx`
- Test: `packages/table-view/src/tools/toolbar.test.tsx`
- Test: `packages/table-view/src/menus/table-view-menu.test.tsx`

- [ ] **Step 1: Replace toolbar popover imports with dropdown imports**

In `packages/table-view/src/tools/toolbar.tsx`, replace the primitive import block with:

```tsx
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  TooltipPreset,
} from "@notion-kit/ui/primitives";
```

- [ ] **Step 2: Convert the Sort toolbar floating root**

Replace the Sort `Popover` block in `Toolbar` with:

```tsx
<DropdownMenu>
  <TooltipPreset description="Sort" side="top">
    <DropdownMenuTrigger
      render={
        <Button
          variant="nav-icon"
          aria-label="Sort"
          className="[&_svg]:fill-current"
        >
          <Icon.ArrowUpDownSmall />
        </Button>
      }
    />
  </TooltipPreset>
  <DropdownMenuContent aria-label="Sort" collisionPadding={12}>
    <SortMenu />
  </DropdownMenuContent>
</DropdownMenu>
```

- [ ] **Step 3: Convert the Settings toolbar floating root**

Replace the Settings `Popover` block in `Toolbar` with:

```tsx
<DropdownMenu
  open={menu.open}
  onOpenChange={(open) => table.setTableMenuState({ open, page: null })}
>
  <TooltipPreset description="Settings" side="top">
    <DropdownMenuTrigger
      render={
        <Button
          variant="nav-icon"
          aria-label="Settings"
          className="[&_svg]:fill-current"
        >
          <Icon.SlidersSmall />
        </Button>
      }
    />
  </TooltipPreset>
  <DropdownMenuContent
    collisionPadding={12}
    aria-labelledby="view-settings"
  >
    <TableViewMenu />
  </DropdownMenuContent>
</DropdownMenu>
```

- [ ] **Step 4: Replace `MenuHeader` close behavior**

In `packages/table-view/src/common/menu.tsx`, replace the imports with:

```tsx
import { Icon } from "@notion-kit/icons";
import { Button } from "@notion-kit/ui/primitives";

import { useTableViewCtx } from "../table-contexts";
```

Replace `MenuHeaderProps` and `MenuHeader` with:

```tsx
interface MenuHeaderProps {
  id?: string;
  title: string;
  onBack?: () => void;
  onClose?: () => void;
}

export function MenuHeader({ id, title, onBack, onClose }: MenuHeaderProps) {
  const { table } = useTableViewCtx();
  const closeMenu =
    onClose ?? (() => table.setTableMenuState({ open: false, page: null }));

  return (
    <div className="flex h-[42px] shrink-0 items-center px-4 pt-3.5 pb-1.5">
      {onBack !== undefined && (
        <Button
          variant="hint"
          className="mr-2 -ml-0.5 h-[22px] w-6 shrink-0 rounded-md p-0"
          onClick={onBack}
          aria-label="Back"
        >
          <Icon.ArrowLeftThick className="fill-default/45" />
        </Button>
      )}
      <h1 id={id} className="grow truncate text-sm font-semibold">
        {title}
      </h1>
      <Button
        variant="close"
        size="circle"
        aria-label="Close"
        onClick={closeMenu}
      >
        <Icon.Close className="h-full w-3.5 fill-secondary dark:fill-default/45" />
      </Button>
    </div>
  );
}
```

- [ ] **Step 5: Convert `TableMenu` imports**

In `packages/table-view/src/menus/table-view-menu.tsx`, replace the primitive import block with:

```tsx
import { Icon } from "@notion-kit/icons";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  MenuItemSelect,
} from "@notion-kit/ui/primitives";
```

- [ ] **Step 6: Convert `TableMenu` groups and items**

In `TableMenu`, replace `MenuGroup` with `DropdownMenuGroup`, `MenuItem` with `DropdownMenuItem`, `Separator` with `DropdownMenuSeparator`, and `MenuGroupHeader` with `DropdownMenuLabel title="Data source settings"`.

Set `closeOnClick={false}` on every `DropdownMenuItem` that mutates table menu state or toggles locked state:

```tsx
<DropdownMenuItem
  closeOnClick={false}
  icon={<LayoutIcon layout={layout} />}
  label="Layout"
  onClick={() => openMenu(TableViewMenuPage.Layout)}
>
  <MenuItemSelect>
    {LAYOUT_OPTIONS.find((l) => l.value === layout)?.label}
  </MenuItemSelect>
</DropdownMenuItem>
```

Use `disabled={locked}` for "Edit properties":

```tsx
<DropdownMenuItem
  closeOnClick={false}
  icon={<Icon.Sliders />}
  label="Edit properties"
  disabled={locked}
  onClick={() => openMenu(TableViewMenuPage.Props)}
>
  <MenuItemSelect />
</DropdownMenuItem>
```

- [ ] **Step 7: Run focused tests and verify they pass**

Run:

```bash
pnpm --filter @notion-kit/table-view test -- src/tools/toolbar.test.tsx src/menus/table-view-menu.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit toolbar and main settings migration**

Run:

```bash
git add packages/table-view/src/tools/toolbar.tsx packages/table-view/src/common/menu.tsx packages/table-view/src/menus/table-view-menu.tsx
git commit -m "feat: migrate table view toolbar menus to dropdown"
```

---

### Task 3: Convert Sort Menu And Inline Add-Sort Flow

**Files:**
- Modify: `packages/table-view/src/menus/sort-menu.test.tsx`
- Modify: `packages/table-view/src/menus/sort-menu.tsx`

- [ ] **Step 1: Replace sort menu tests with inline dropdown expectations**

In `packages/table-view/src/menus/sort-menu.test.tsx`, update `addSortRule` so it no longer presses Escape after choosing a property:

```tsx
async function addSortRule(user: UserEvent, propertyName: string) {
  renderTableView();

  const sortButton = screen.getByRole("button", { name: "Sort" });
  await user.click(sortButton);

  const addSortButton = screen.getByRole("menuitem", { name: "Add sort" });
  await user.click(addSortButton);

  const commandList = screen.getByRole("listbox");
  const propertyOption = within(commandList).getByText(propertyName);
  await user.click(propertyOption);
}
```

Add this test under `describe("SortMenu", ...)`:

```tsx
it("should keep typed search inside the inline add-sort panel", async () => {
  const user = userEvent.setup();
  renderTableView();

  await user.click(screen.getByRole("button", { name: "Sort" }));
  await user.click(screen.getByRole("menuitem", { name: "Add sort" }));

  const searchInput = screen.getByPlaceholderText("Search for a property...");
  await user.type(searchInput, "Done");

  expect(searchInput).toHaveValue("Done");
  expect(screen.getByRole("listbox")).toBeInTheDocument();
  expect(screen.getByText("Done")).toBeInTheDocument();
});
```

Add this test:

```tsx
it("should show sort-rule select options inside the dropdown", async () => {
  const user = userEvent.setup();
  await addSortRule(user, "Name");

  await user.click(screen.getByText("Ascending"));

  expect(screen.getByRole("option", { name: "Descending" })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run sort tests and verify failures**

Run:

```bash
pnpm --filter @notion-kit/table-view test -- src/menus/sort-menu.test.tsx
```

Expected: FAIL because the current "Add sort" flow opens a popover and sort rule select content remains affected by the old mixed floating stack.

- [ ] **Step 3: Update sort menu imports**

In `packages/table-view/src/menus/sort-menu.tsx`, remove `Popover`, `PopoverContent`, and `PopoverTrigger` from the primitive import. Add dropdown imports:

```tsx
import {
  Autocomplete,
  AutocompleteCollection,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  Button,
  DropdownMenuGroup,
  DropdownMenuItem,
  MenuItem,
  MenuItemAction,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@notion-kit/ui/primitives";
```

- [ ] **Step 4: Add local inline-panel state to `SortMenu`**

Replace the `SortMenu` body with:

```tsx
export function SortMenu() {
  const { table } = useTableViewCtx();
  const sorting = table.getState().sorting;
  const [addingSort, setAddingSort] = React.useState(false);

  const reorderRules = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    table.setSorting((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id);
      const newIndex = prev.findIndex((s) => s.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  return (
    <>
      <DropdownMenuGroup>
        <SortableDnd items={sorting.map((s) => s.id)} onDragEnd={reorderRules}>
          {sorting.map((prop) => (
            <SortRule key={prop.id} {...prop} />
          ))}
        </SortableDnd>
      </DropdownMenuGroup>
      <DropdownMenuGroup>
        <DropdownMenuItem
          closeOnClick={false}
          variant="secondary"
          icon={<Icon.Plus className="size-4" />}
          label="Add sort"
          onClick={() => setAddingSort((value) => !value)}
        />
        {addingSort && (
          <div
            className="px-2 pb-2"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <PropSelectMenu onSelect={() => setAddingSort(false)} />
          </div>
        )}
        <DropdownMenuItem
          closeOnClick={false}
          variant="warning"
          className="text-secondary"
          icon={<Icon.Trash />}
          label="Delete sort"
          onClick={() => table.resetSorting()}
        />
      </DropdownMenuGroup>
    </>
  );
}
```

- [ ] **Step 5: Contain interactions inside `SortRule`**

Keep `SortRule` as a visual complex row. Add containment to select wrappers and remove button:

```tsx
<div
  className="ml-1 flex h-8 items-center gap-2"
  onClick={(event) => event.stopPropagation()}
  onKeyDown={(event) => event.stopPropagation()}
>
```

Update the remove button:

```tsx
<Button
  variant="hint"
  className="size-5"
  onClick={(event) => {
    event.stopPropagation();
    removeRule();
  }}
>
  <Icon.Close className="fill-current" />
</Button>
```

- [ ] **Step 6: Update `PropSelectMenu` to notify selection and contain input keys**

Change the signature:

```tsx
function PropSelectMenu({ onSelect }: { onSelect: () => void }) {
```

Change `selectProp`:

```tsx
const selectProp = (id: string) => {
  table.setSorting((prev) => [...prev, { id, desc: false }]);
  onSelect();
};
```

Update the input:

```tsx
<AutocompleteInput
  clear
  placeholder="Search for a property..."
  onKeyDown={(event) => event.stopPropagation()}
/>
```

- [ ] **Step 7: Run sort tests and verify they pass**

Run:

```bash
pnpm --filter @notion-kit/table-view test -- src/menus/sort-menu.test.tsx src/tools/toolbar.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit sort migration**

Run:

```bash
git add packages/table-view/src/menus/sort-menu.tsx packages/table-view/src/menus/sort-menu.test.tsx
git commit -m "feat: migrate table view sort menu to dropdown"
```

---

### Task 4: Convert Layout Menu And Inline Row-View Choices

**Files:**
- Modify: `packages/table-view/src/menus/layout-menu.test.tsx`
- Modify: `packages/table-view/src/menus/layout-menu.tsx`

- [ ] **Step 1: Add row-view selection test**

Add this test to `packages/table-view/src/menus/layout-menu.test.tsx`:

```tsx
it("should change row view from inline row-view choices", async () => {
  const user = userEvent.setup();
  renderTableView();

  await openLayoutMenu(user);

  await user.click(screen.getByRole("menuitemcheckbox", { name: "Center peek" }));

  expect(screen.getByText("Center peek")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run layout tests and verify row-view test fails**

Run:

```bash
pnpm --filter @notion-kit/table-view test -- src/menus/layout-menu.test.tsx
```

Expected: FAIL because row view is currently hidden in a nested dropdown until its trigger is opened.

- [ ] **Step 3: Update layout menu imports**

In `packages/table-view/src/menus/layout-menu.tsx`, replace the primitive import block with:

```tsx
import {
  Button,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@notion-kit/ui/primitives";
```

- [ ] **Step 4: Convert layout groups and contain layout-grid interactions**

Replace the outer `MenuGroup` wrappers with `DropdownMenuGroup`. Wrap the layout grid with propagation containment:

```tsx
<DropdownMenuGroup>
  <div
    className="grid grid-cols-3 gap-2 p-2 pb-0"
    onClick={(event) => event.stopPropagation()}
    onKeyDown={(event) => event.stopPropagation()}
  >
    {LAYOUT_OPTIONS.map((layout) => (
      <Button
        key={layout.value}
        aria-selected={currentLayout === layout.value}
        onClick={() => table.setTableLayout(layout.value)}
        className={cn(
          "flex flex-col gap-0 p-1.5 text-xs text-secondary [&_svg]:my-1 [&_svg]:fill-current",
          "aria-selected:text-blue aria-selected:shadow-notion",
        )}
        disabled={
          layout.value !== "table" &&
          layout.value !== "list" &&
          layout.value !== "board"
        }
      >
        <LayoutIcon layout={layout.value} />
        <div className="text-center">{layout.label}</div>
      </Button>
    ))}
  </div>
</DropdownMenuGroup>
```

- [ ] **Step 5: Replace `RowViewMenu` with inline row-view choices**

Replace `RowViewMenu` with:

```tsx
function RowViewMenu() {
  const { table } = useTableViewCtx();
  const { rowView: current } = table.getTableGlobalState();

  return (
    <>
      <DropdownMenuLabel title="Open pages in" />
      {Object.entries(ROW_VIEW_OPTIONS).map(([value, option]) => {
        const rowView = value as RowViewType;
        return (
          <DropdownMenuCheckboxItem
            key={rowView}
            closeOnClick={false}
            icon={<RowViewIcon rowView={rowView} />}
            label={option.label}
            desc={option.desc}
            checked={rowView === current}
            onCheckedChange={() =>
              table.setTableGlobalState((v) => ({ ...v, rowView }))
            }
          />
        );
      })}
    </>
  );
}
```

- [ ] **Step 6: Run layout tests and verify they pass**

Run:

```bash
pnpm --filter @notion-kit/table-view test -- src/menus/layout-menu.test.tsx src/menus/table-view-menu.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit layout migration**

Run:

```bash
git add packages/table-view/src/menus/layout-menu.tsx packages/table-view/src/menus/layout-menu.test.tsx
git commit -m "feat: migrate table view layout menu to dropdown"
```

---

### Task 5: Convert Select Group And Edit Group Menus

**Files:**
- Modify: `packages/table-view/src/menus/select-group-menu.test.tsx`
- Modify: `packages/table-view/src/menus/edit-group-menu.test.tsx`
- Modify: `packages/table-view/src/menus/select-group-menu.tsx`
- Modify: `packages/table-view/src/menus/edit-group-menu.tsx`

- [ ] **Step 1: Add select-group keyboard containment test**

Add this test to `packages/table-view/src/menus/select-group-menu.test.tsx`:

```tsx
it("should keep typed search inside the group autocomplete", async () => {
  const user = userEvent.setup();
  await openSelectGroupMenu(user);

  const searchInput = screen.getByPlaceholderText("Search for a property");
  await user.type(searchInput, "Done");

  expect(searchInput).toHaveValue("Done");
  expect(screen.getByRole("option", { name: "Done" })).toBeInTheDocument();
});
```

- [ ] **Step 2: Add edit-group non-item persistence tests**

Add these tests to `packages/table-view/src/menus/edit-group-menu.test.tsx`:

```tsx
it("should keep the menu open when toggling the groups header action", async () => {
  const user = userEvent.setup();
  await openEditGroupMenu(user);

  const actionButton =
    screen.queryByRole("button", { name: "Hide all" }) ??
    screen.getByRole("button", { name: "Show all" });

  await user.click(actionButton);

  expect(screen.getByRole("heading", { name: "Group" })).toBeInTheDocument();
});
```

```tsx
it("should keep the menu open when toggling a group visibility button", async () => {
  const user = userEvent.setup();
  await openEditGroupMenu(user);

  const visibilityButton = screen.getAllByRole("button", {
    name: "Toggle property visibility",
  })[0]!;

  await user.click(visibilityButton);

  expect(screen.getByRole("heading", { name: "Group" })).toBeInTheDocument();
});
```

- [ ] **Step 3: Run group tests and verify failures**

Run:

```bash
pnpm --filter @notion-kit/table-view test -- src/menus/select-group-menu.test.tsx src/menus/edit-group-menu.test.tsx
```

Expected: FAIL where parent menu behavior consumes non-item interactions or where legacy items have not been migrated.

- [ ] **Step 4: Update select-group input containment**

In `packages/table-view/src/menus/select-group-menu.tsx`, update the autocomplete input:

```tsx
<AutocompleteInput
  placeholder="Search for a property"
  onKeyDown={(event) => event.stopPropagation()}
/>
```

Wrap the autocomplete block in a container:

```tsx
<div
  onClick={(event) => event.stopPropagation()}
  onKeyDown={(event) => event.stopPropagation()}
>
  <Autocomplete
    items={groupOptions}
    itemToStringValue={(option) => option.name}
    open
    autoHighlight="always"
    openOnInputClick
  >
    <AutocompleteInput
      placeholder="Search for a property"
      onKeyDown={(event) => event.stopPropagation()}
    />
    <AutocompleteContent role="presentation" variant="inline">
      <AutocompleteList>
        <AutocompleteGroup className="h-40">
          <AutocompleteCollection>
            {(option: (typeof groupOptions)[number]) => (
              <AutocompleteItem
                key={option.id ?? "none"}
                value={option}
                label={option.name}
                icon={
                  option.kind === "column" ? (
                    option.icon ? (
                      <IconBlock icon={option.icon} />
                    ) : (
                      <DefaultIcon type={option.type} />
                    )
                  ) : null
                }
                onClick={() => selectGroup(option.id)}
              >
                {groupingColId === (option.id ?? undefined) && (
                  <MenuItemCheck />
                )}
              </AutocompleteItem>
            )}
          </AutocompleteCollection>
        </AutocompleteGroup>
      </AutocompleteList>
      <AutocompleteEmpty className="px-3 text-start text-muted">
        No results
      </AutocompleteEmpty>
    </AutocompleteContent>
  </Autocomplete>
</div>
```

- [ ] **Step 5: Update edit-group imports**

In `packages/table-view/src/menus/edit-group-menu.tsx`, add dropdown imports and keep visual `MenuItem` for complex draggable rows:

```tsx
import {
  Button,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  MenuItem,
  MenuItemAction,
  MenuItemSelect,
  MenuItemSwitch,
} from "@notion-kit/ui/primitives";
```

- [ ] **Step 6: Convert edit-group action rows**

Replace simple `MenuGroup` wrappers with `DropdownMenuGroup`, `Separator` with `DropdownMenuSeparator`, and simple action rows with dropdown items:

```tsx
<DropdownMenuItem
  closeOnClick={false}
  label="Group by"
  onClick={() =>
    table.setTableMenuState({
      open: true,
      page: TableViewMenuPage.SelectGroupBy,
    })
  }
>
  <MenuItemSelect>{col?.name ?? ""}</MenuItemSelect>
</DropdownMenuItem>
```

Use `DropdownMenuLabel` for the groups header and render the action button as children:

```tsx
<DropdownMenuLabel title="Groups">
  <div className="ml-auto">
    <Button
      tabIndex={0}
      variant="soft-blue"
      className="h-[initial] min-w-0 shrink bg-transparent px-1.5 py-0.5 text-xs/tight shadow-none"
      onClick={(event) => {
        event.stopPropagation();
        table.toggleAllGroupsVisible();
      }}
    >
      {table.getIsSomeGroupVisible() ? "Hide all" : "Show all"}
    </Button>
  </div>
</DropdownMenuLabel>
```

Use `closeOnClick={false}` on "Remove grouping":

```tsx
<DropdownMenuItem
  closeOnClick={false}
  icon={<Icon.Trash />}
  label="Remove grouping"
  onClick={() => table.setGroupingColumn(null)}
/>
```

- [ ] **Step 7: Contain edit-group switch and drag/visibility interactions**

Wrap the switch row:

```tsx
<div
  onClick={(event) => event.stopPropagation()}
  onKeyDown={(event) => event.stopPropagation()}
>
  <MenuItemSwitch
    label="Hide empty groups"
    checked={hideEmptyGroups}
    onCheckedChange={table.toggleHideEmptyGroups}
  />
</div>
```

Update the group drag handle:

```tsx
<div
  key="drag-handle"
  className="mr-2 flex h-6 w-4.5 shrink-0 cursor-grab items-center justify-center fill-icon!"
  onPointerDown={(event) => event.stopPropagation()}
  onClick={(event) => event.stopPropagation()}
  {...attributes}
  {...listeners}
>
  <Icon.DragHandle className="size-3" />
</div>
```

The visibility button already stops click propagation. Keep that behavior.

- [ ] **Step 8: Run group tests and verify they pass**

Run:

```bash
pnpm --filter @notion-kit/table-view test -- src/menus/select-group-menu.test.tsx src/menus/edit-group-menu.test.tsx
```

Expected: PASS.

- [ ] **Step 9: Commit group menu migration**

Run:

```bash
git add packages/table-view/src/menus/select-group-menu.tsx packages/table-view/src/menus/edit-group-menu.tsx packages/table-view/src/menus/select-group-menu.test.tsx packages/table-view/src/menus/edit-group-menu.test.tsx
git commit -m "feat: migrate table view group menus to dropdown"
```

---

### Task 6: Document Root Cause And Run Full Verification

**Files:**
- Modify: `issues.md`
- Verify: all files touched in Tasks 1-5

- [ ] **Step 1: Update `issues.md` root cause notes**

Replace items 5.1 and 6.2 in `issues.md` with:

```md
5.  menu issues!
    1. root cause: mixed Radix Popover and Base UI Menu/Select portals used the same menu z-index without a reliable parent-child stacking order. Table-view menus now use DropdownMenu roots so nested floating layers share one menu model.
6.  in table-view
    1. many menus are still not working as expected (e.g. popover + menu primitives). they can probably changed into dropdown-menu
    2. root cause: sort-menu.tsx rendered Base UI SelectContent portals from inside a Radix Popover and legacy menu-shaped rows. Parent focus/keyboard handling and same-z-index portals could hide, displace, or close SelectContent before it was usable.
```

- [ ] **Step 2: Run all focused table-view menu tests**

Run:

```bash
pnpm --filter @notion-kit/table-view test -- src/tools/toolbar.test.tsx src/menus/table-view-menu.test.tsx src/menus/sort-menu.test.tsx src/menus/layout-menu.test.tsx src/menus/select-group-menu.test.tsx src/menus/edit-group-menu.test.tsx
```

Expected: PASS.

- [ ] **Step 3: Run full table-view tests**

Run:

```bash
pnpm --filter @notion-kit/table-view test
```

Expected: PASS.

- [ ] **Step 4: Run table-view typecheck**

Run:

```bash
pnpm --filter @notion-kit/table-view typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit root-cause notes and verification fixes**

Run:

```bash
git add issues.md
git commit -m "docs: record table view menu root causes"
```

If verification required code or test fixes, include those exact changed files in the same commit:

```bash
git add issues.md packages/table-view/src/tools/toolbar.tsx packages/table-view/src/common/menu.tsx packages/table-view/src/menus/table-view-menu.tsx packages/table-view/src/menus/sort-menu.tsx packages/table-view/src/menus/layout-menu.tsx packages/table-view/src/menus/select-group-menu.tsx packages/table-view/src/menus/edit-group-menu.tsx packages/table-view/src/tools/toolbar.test.tsx packages/table-view/src/menus/table-view-menu.test.tsx packages/table-view/src/menus/sort-menu.test.tsx packages/table-view/src/menus/layout-menu.test.tsx packages/table-view/src/menus/select-group-menu.test.tsx packages/table-view/src/menus/edit-group-menu.test.tsx
git commit -m "fix: stabilize table view dropdown menu migration"
```

---

## Self-Review

- Spec coverage: toolbar dropdown roots are covered by Task 2; header close replacement is covered by Task 2; sort menu and add-sort inline flow are covered by Task 3; layout and row-view migration are covered by Task 4; select-group and edit-group menus are covered by Task 5; root-cause notes for `issues.md` are covered by Task 6; props/edit-prop remain out of scope.
- Placeholder scan: no open placeholders remain in this plan.
- Type consistency: all named primitives are exported by `@notion-kit/ui/primitives`; table menu state calls use the existing `table.setTableMenuState({ open, page })` shape; tests use the existing `renderToolbar`, `openSettingsMenu`, and `renderTableView` helpers.
