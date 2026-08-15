# Specification: Table View Bulk Edit

## Objective

Add bulk editing to `@notion-kit/table-view`. A user who selects one or more
rows can set one editable, visible column to one shared final value for every
selected row, duplicate the selected rows, or delete them after confirmation.

The floating bulk-edit bar is available in the table, list, and timeline
layouts. It is sticky at the top-left of the active layout, and is not shown
until at least one row is selected. Locked views require no special bulk-bar
guard: their existing selection behavior prevents a non-empty selection.

The visual reference is `packages/table-view/docs/bulk-edit.png`.

## Product Decisions

### Bulk-edit bar

- Show the selected-row count, then eligible column controls in a horizontal
  row, followed by the delete icon and a more-actions menu.
- Keep the row horizontal; it must scroll horizontally instead of wrapping
  when the available width is insufficient.
- Each column control uses the same icon and name presentation as its table
  header. Its popup contains the corresponding existing cell editor content,
  not a second, bulk-specific editor UI.
- Preserve selection after editing or duplicating. Delete removes the selected
  rows and the existing row-selection pruning clears their IDs.

### Eligible columns

`CellPlugin` gains only the optional `disableBulkEdit?: boolean` capability.
It is opt-out: a visible, non-deleted column is eligible unless its plugin
sets the flag.

- `title`, `created-time`, and `last-edited-time` set `disableBulkEdit: true`.
- Text, number, checkbox, select, multi-select, email, phone, URL, and date
  remain eligible in the default plugin set.
- A custom plugin whose cell UI cannot accept the bulk trigger/editor context
  must opt out with `disableBulkEdit: true`; there is no separate
  `renderBulkEditor` plugin API.

### Editor behavior

The cell UI is refactored so a header-style trigger can open the same editor
content used by a normal cell popover or menu. The bulk bar owns a draft value
and sends its resolved final value to the table-hook bulk API.

- Text, number, email, phone, and URL reuse the existing input content.
- Select and multi-select reuse `SelectMenu`. A multi-select operation
  overwrites every selected row with the same complete set of selected values;
  it never toggles each row against its prior value.
- Date reuses `DateTimePicker` and applies the resulting complete date data to
  every selected row.
- Checkbox opens a small menu with explicit `Checked` and `Unchecked` choices;
  it does not infer a toggle from each row's original value.
- When selected rows have different values, the draft starts as an unspecified
  editor value rather than choosing one row's value. Once changed, it becomes
  the value shared by all selected rows.

### Row actions

- The trash icon and the Delete item in the more-actions menu open the same
  alert dialog. The dialog identifies the selected-row count and requires
  confirmation before deletion.
- The more-actions menu follows the row-action-menu presentation and search
  interaction. Version one contains only `Duplicate` and `Delete`; row-specific
  actions such as Open, Copy link, and Edit icon are excluded.
- `duplicateRows` preserves the original selected rows and duplicates them in
  original data order, immediately after their corresponding source rows.

## Architecture

### `table-hook` bulk APIs

Extend `RowActionsTableApi` with atomic bulk operations:

```ts
table.updateCells(rowIds, columnId, value);
table.duplicateRows(rowIds);
```

`updateCells` accepts one already-resolved value and applies it to the existing
cell of every still-existing target row in one `setTableData` proposal. It
updates all affected rows' `lastEditedAt` values and schedules grouping-state
synchronization once. Its resource action remains `data.cell.update`, using
the existing `rowIds` payload form.

`duplicateRows` duplicates all still-existing target rows in one proposal and
emits a dedicated batch duplicate resource action containing each source/new
row relationship and its resulting position. `updateCell` and `duplicateRow`
remain public for compatibility and may delegate to these bulk APIs.

No UI code may loop over `updateCell` to implement a bulk edit; doing so would
produce multiple resource proposals, timestamps, and grouping synchronizations.

### `table-view` composition

`BulkEditBar` is a shared view component mounted inside table, list, and
timeline layout content so CSS `sticky` positioning is relative to that layout.
It subscribes to selection and derives eligible columns from the current
visible column order and `plugin.disableBulkEdit`.

The cell editor composition gains a bulk-trigger context rather than adding a
new renderer to `CellPlugin`. Normal cells retain their existing trigger; bulk
controls substitute the table-header-style trigger and provide a bulk draft
plus an `onChange` adapter that calls `table.updateCells` with the final value.

`BulkActionMenu` reuses the row-action-menu visual primitives but owns only
bulk-safe actions. Delete confirmation is shared by the icon and menu action.

## Project Structure

Expected responsibility boundaries:

```text
packages/table-hook/src/
  features/row-actions.ts             bulk cell and row mutation APIs
  table-contexts/actions.ts           batch duplicate action contract
  __tests__/row-actions.test.tsx      atomic API and resource-action tests

packages/table-view/src/
  common/bulk-edit/                   bar, column controls, bulk action menu
  common/text-input-popover.tsx       reusable input editor composition
  plugins/*/                          cell editor trigger/content composition
  table-contexts/table-view-content.tsx
  list-view/list-view-content.tsx
  timeline-view/timeline-view-content.tsx
  table-body/table-row-selection.test.tsx
                                     layout and interaction coverage
```

Exact filenames may vary, but `BulkEditBar` must not be duplicated per layout,
and mutation behavior must stay in `table-hook` rather than the view package.

## Tech Stack

- React 19 and TypeScript 6.0.3.
- TanStack Table 9 for row selection and table APIs.
- Base UI popovers, dropdown menus, and dialogs through `@notion-kit/ui`.
- Vitest 4.1.8 and Testing Library for package tests.
- No new dependency is required. Base UI detached popover triggers may connect
  the bar control to a centralized popover root when that produces the cleanest
  composition.

## Commands

Run commands from the repository root using Node 24.11.1:

```bash
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
source "$NVM_DIR/nvm.sh"
nvm use 24.11.1 --silent
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-hook test
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-view test
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-hook typecheck
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-view typecheck
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-hook lint
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-view lint
```

## Code Style

Follow the existing strict TypeScript and small, explicit component boundaries.
Keep an atomic update in the hook and pass a resolved final value from the UI;
do not hide a row loop in a component callback.

```ts
const applyValue = (value: string[]) => {
  table.updateCells(selectedRowIds, column.id, value);
};
```

Use named functions and domain-specific names (`selectedRowIds`, `columnId`,
`finalValue`). Preserve existing alias imports, Prettier formatting, and
Testing Library's accessible role/name assertions.

## Testing Strategy

### `@notion-kit/table-hook`

- `updateCells` changes exactly the selected existing rows, records one
  `data.cell.update` action with `rowIds`, and updates timestamps.
- Stale IDs are ignored without failing valid targets.
- A grouped column bulk update resynchronizes group state once and produces the
  expected groups.
- `duplicateRows` preserves source order, creates fresh row/cell IDs, and
  reports one batch action with the correct source/new rows and positions.
- Existing single-row APIs retain their established behavior.

### `@notion-kit/table-view`

- Bar visibility tracks row selection in table, list, and timeline; board is
  intentionally excluded.
- The bar is sticky at the active layout's top-left and lists only visible,
  bulk-enabled columns using header-style controls.
- Each supported editor applies one shared final value to all selected rows;
  cover text, select, multi-select overwrite, date, and checkbox choices.
- Title and derived-time plugins do not appear in the bar.
- Duplicate works from the more-actions menu. Both deletion entry points share
  confirmation, delete the exact rows only after confirmation, and leave no
  stale selection.
- Locked views cannot produce a visible bulk bar because selection is empty.

### Browser E2E

- In the built-package fixture, select rows through the rendered selection
  controls and verify a multi-select bulk edit overwrites rather than merges
  every target value, while emitting one `data.cell.update` resource action.
- Verify the bar remains visible after switching to timeline with selection
  preserved, and that title and derived-time columns remain absent.
- Verify duplicate emits one batch action and both delete entry points require
  confirmation before removing only the selected rows.

Do not duplicate these browser journeys with unit tests that only call a
thin editor wrapper's direct callback. Keep unit tests for value-resolution and
resource contracts; use E2E for the integrated user path.

Run the focused commands above before committing implementation. Include a
manual browser pass for sticky placement and horizontal overflow in all three
supported layouts.

## Boundaries

- **Always:** preserve row-selection semantics; perform bulk mutations in
  `table-hook`; reuse existing editor content; run focused tests, typechecks,
  and lint before implementation commits.
- **Ask first:** add a dependency; change persistence/resource action contracts
  beyond the described batch APIs; add bulk editing to board or new layouts;
  change keyboard shortcuts or the shared row-action-menu behavior.
- **Never:** bulk-edit Title, Created time, or Last edited time; mutate rows
  one at a time from the view; bypass delete confirmation; commit the user's
  unrelated `bulk-edit.png` file as part of this specification commit.

## Success Criteria

- Selecting one or more rows shows the specified sticky bar in table, list, and
  timeline layouts and nowhere else.
- Every displayed column control opens its normal cell editor content and
  applies one final value to every selected row.
- Unsupported plugins never appear as bulk-edit columns.
- Duplicate and confirmed delete operate over the exact selected set with
  deterministic ordering and coherent resource actions.
- The focused hook and view test, typecheck, and lint commands pass.

## Open Questions

None. Changes outside the boundaries require a spec update and review first.
