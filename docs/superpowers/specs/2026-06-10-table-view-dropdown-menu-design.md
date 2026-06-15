# Table View Dropdown Menu Migration Design

## Goal

Migrate the table-view toolbar settings and sort menus from mixed `Popover` and legacy `Menu*` primitives to `DropdownMenu` primitives. The migration covers the settings root, direct sort toolbar menu, and the internal layout, sort, select-group, and edit-group menus.

`props-menu.tsx` and `edit-prop-menu.tsx` stay out of scope for this pass.

## Current Problems

The current toolbar uses Radix `Popover` roots around content that behaves like a menu. Some nested table-view menus also use Base UI dropdown/select primitives from inside those popover roots.

This mixed stack is the likely root cause for the tracked issues:

- `issues.md` 5.1: popover/dropdown/select portals use the same menu z-index without a consistent parent-child stacking relationship, so nested floating content can render under another menu layer.
- `issues.md` 6.2: `SortRule` renders Base UI `SelectContent` portals inside a Radix `Popover` and legacy `MenuItem` structure. Focus handling, keyboard handling, and equal z-index floating layers can make the select content invisible, displaced, or closed before it is usable.

## Scope

Update these files and their direct callers:

- `packages/table-view/src/tools/toolbar.tsx`
- `packages/table-view/src/menus/table-view-menu.tsx`
- `packages/table-view/src/menus/sort-menu.tsx`
- `packages/table-view/src/menus/edit-group-menu.tsx`
- `packages/table-view/src/menus/select-group-menu.tsx`
- `packages/table-view/src/menus/layout-menu.tsx`
- `packages/table-view/src/common/menu.tsx`, only as needed for header close behavior

Keep existing page-based navigation through `table.getTableMenuState()` and `table.setTableMenuState()`.

## Architecture

`Toolbar` will render dropdown roots instead of popover roots:

- The direct sort toolbar button opens a `DropdownMenu`.
- The settings button opens a controlled `DropdownMenu` using the existing table menu open state, either from `table.getState().menu.open` or `table.getTableMenuState().open`, matching the nearby code.
- Settings close and outside interactions update table menu state through `table.setTableMenuState({ open, page: null })`.

`TableViewMenu` remains the page router for view settings. The pages in scope render dropdown-native groups, items, separators, labels, checkbox items, and inline content. This keeps the migration local and avoids rewriting the table menu state machine.

## Components And Behavior

### Menu Header

`MenuHeader` will no longer depend on `PopoverClose`. It will render the close button shape from the dropdown prototype:

```tsx
<Button variant="close" size="circle" aria-label="Close">
  <Icon.Close className="h-full w-3.5 fill-secondary dark:fill-default/45" />
</Button>
```

For table-view menus, clicking close sets table menu state to `{ open: false, page: null }`. Back buttons keep the existing page navigation.

### Sort Menu

`SortMenu` becomes dropdown-native:

- `MenuGroup` and `MenuItem` become `DropdownMenuGroup` and `DropdownMenuItem` where the row is an actual menu action.
- The "Add sort" flow no longer opens a `Popover`. It toggles an inline autocomplete panel inside the dropdown content.
- The autocomplete input is non-menu content and stops keyboard propagation so typing and arrow navigation are handled by autocomplete instead of the parent dropdown.
- Sort-rule rows keep their two `Select` controls and remove button, with click and keyboard containment around interactive controls as needed.
- "Delete sort" keeps clearing all rules.

### Layout Menu

`LayoutMenu` becomes dropdown-native while preserving the current layout grid:

- Layout option buttons remain plain non-item controls inside the dropdown content.
- The grid container stops propagation for click and keyboard events that should not select or close the parent dropdown.
- The row-view selector will be migrated away from a nested floating dropdown for this pass. It will become an inline row-view choice section inside the layout menu, using dropdown checkbox items or equivalent menu rows.

### Select Group Menu

`SelectGroupMenu` keeps its inline autocomplete behavior but runs inside dropdown content:

- The header and autocomplete input are non-items.
- Input typing stops propagation to prevent the parent dropdown from consuming search text, arrow keys, or Escape at the wrong layer.
- Selecting a property still calls `table.setGroupingColumn(colId)` and navigates to `TableViewMenuPage.EditGroupBy`.
- The "None" option remains available outside board layout.

### Edit Group Menu

`EditGroupMenu` becomes dropdown-native:

- "Group by", "Remove grouping", and "Learn about grouping" are dropdown items.
- "Hide empty groups" will remain a switch row, but its click and keyboard events must not close the parent dropdown unexpectedly.
- "Groups" header action remains a button and stops propagation.
- Group visibility buttons and drag handles remain inline controls inside rows and stop propagation where needed.

## Event Handling

The migration must treat inputs, layout buttons, switches, visibility buttons, drag handles, and select triggers as non-item or nested interactive controls. These controls should stop propagation for events that the parent dropdown would otherwise interpret as menu navigation or item activation.

At minimum, containment should cover:

- `onKeyDown` for autocomplete inputs and other text inputs.
- `onClick` for inline buttons and icon buttons.
- Select triggers and remove buttons inside sort-rule rows.
- Switch clicks in edit-group rows.
- Drag-handle pointer interactions.

## Testing

Use test-driven development:

1. Update or add tests that describe the desired dropdown behavior before changing implementation.
2. Run the focused table-view menu tests and confirm the expected failures.
3. Migrate the code until those tests pass.
4. Run the broader table-view test suite.

Regression coverage should include:

- Toolbar sort and settings menus open, close on outside click, and toggle from the trigger.
- Settings navigation to layout, sort, select-group, and edit-group pages still works.
- The close button closes the settings dropdown.
- Layout choices still change selected layout.
- Row-view selection works without nested floating content.
- Add-sort inline search accepts typed text and selecting a property creates a sort rule.
- Sort-rule selects remain visible and usable inside the dropdown.
- Select-group search accepts typed text and filters options.
- Edit-group switch, group visibility button, and header action do not unintentionally close the dropdown.

## Out Of Scope

- Reworking `props-menu.tsx`.
- Reworking `edit-prop-menu.tsx`.
- A broad redesign of table menu state.
- Changing dropdown/select primitive APIs outside what is necessary for this migration.
