# Table View Search and Advanced Filter UI Design

## Goal

Add transient search and a nested advanced-filter editor to `table-view`, while
making the toolbar and active-state bar available to every current and future
layout except row view.

## Scope

This change is UI-only. It consumes the search and persisted filter-tree APIs
already implemented by `@notion-kit/table-hook` on this branch.

Included:

- Expand the existing toolbar Search icon into an inline search input.
- Open one shared filter editor from either the toolbar Filter icon or the
  active bar's blue filter pill.
- Support immediate editing of the complete nested filter tree through the
  existing three-group-level limit.
- Render the toolbar and active bar above table, list, board, timeline, and
  future layouts.
- Ensure center, side, and full row views stack above both control bars.

Excluded:

- Changes to filter evaluation, persistence, operator contracts, or nesting
  limits in `table-hook`.
- Server-side filtering, saved filter templates, duplication, drag-and-drop,
  and rule reordering.
- New dependencies or a generalized toolbar framework.

## Shared control layout

`TableView` owns a small `ViewControls` component above its layout switch:

```text
TableViewWrapper
├─ ViewControls
│  ├─ Toolbar
│  ├─ ActiveBar (only when a sort or filter is active)
│  └─ one detached Filter popover
├─ Content (table/list/board/timeline/future layout)
└─ RowView (center/side/full)
```

Moving `SortSelector` and the filter controls out of `TableViewContent` removes
the current table-only ownership. A future layout receives both bars by being
rendered through `Content`; it does not need layout-specific control markup.

The active bar is hidden when there is neither sorting nor a filter rule. When
visible, it renders the active selectors followed by the add-filter action:

```text
Sort only:   [Name ↑ ▼] [+ Filter]
Filter only: [4 rules ▼] [+ Filter]
Both:        [4 rules ▼] [Name ↑ ▼] [+ Filter]
```

An empty root group counts as no active filter. The filter pill label is
`1 rule` or `<n> rules`, counting rules recursively and not counting groups.

## Search behavior

The existing Search `ToolbarItem` is replaced in place with the behavior and
visual treatment used by `packages/settings-panel/src/presets/people/people.tsx`:

```text
Closed: [Search icon]
Open:   [Search icon][Search… ×]
```

The input remains mounted and animates width and opacity. Clicking the icon
toggles the input and focuses it. Typing calls `table.setGlobalFilter(value)`;
clear calls `table.resetGlobalFilter()`. Search stays transient in TanStack's
`globalFilter` atom and never changes the persisted view or calls
`onViewChange`.

The input uses an accessible `Search` label and the existing flat, clearable
`Input`. Re-closing the input does not clear an active query, matching the
source behavior in `people.tsx`.

## Detached filter popover

`ViewControls` creates one `Popover.createHandle()` and renders one
`<Popover handle={handle}>`. The following controls use detached
`PopoverTrigger`s with that handle:

- the toolbar Filter icon;
- the active filter pill; and
- the active bar's `+ Filter` action.

The first two triggers open the editor at its current root. `+ Filter` opens the
same editor and immediately opens the root property picker for an additional
rule. When no filter exists, the toolbar trigger opens the popover with the
first property picker already open. Opening and closing without selecting a
property leaves `view.filters` as `null` or `undefined`.

The popover is non-modal, positioned below and aligned to the clicked trigger,
with collision padding matching existing table-view menus. Switching triggers
reuses the same content, open state, and focus management instead of mounting a
second editor.

## Filter editor

The editor renders the persisted `FilterGroup` recursively. All edits are
immutable and call `table.setFilters(nextTree)` immediately.

Each group renders:

- `Where` for its first child and its `And`/`Or` logic for later children;
- rule rows containing property, operator, and optional operand controls;
- nested groups in the inset neutral panel shown by the reference image;
- `Add filter rule`, with a menu for adding a rule or nested group;
- a group action menu containing Delete for non-root groups; and
- `Delete filter` for the root group.

Changing a group's logic updates that group's single `logic` field. A fourth
group level cannot be created because `table-hook` validates at most three
group levels. The add-group action is hidden or disabled at level three.

Only non-deleted properties whose plugin exposes `filtering.operators` appear
in the property picker. Choosing or replacing a property selects that plugin's
first operator and removes any old operand. Changing an operator also removes
the old operand so an operand from one kind cannot leak into another.

Operand controls map directly to `FilterOperandMetadata`:

| Kind            | Control                            | Persisted value    |
| --------------- | ---------------------------------- | ------------------ |
| `none`          | no control                         | property omitted   |
| `text`          | text input                         | string             |
| `number`        | numeric input                      | finite number      |
| `option`        | option select from property config | option name string |
| `date`          | date picker                        | `{ timestamp }`    |
| `date-range`    | start/end date pickers             | `{ start, end }`   |
| `relative-date` | integer day offset control         | `{ offsetDays }`   |

Incomplete operands remain `undefined` and simply match no rows according to
the existing evaluator. Invalid numeric or date input is not persisted. The UI
does not add a second validation model beyond these type boundaries and
`table.validateFilters`.

The `…` action menus only delete rules or non-root groups. Duplication,
wrapping, and reordering are intentionally excluded.

## Minimal file structure

```text
packages/table-view/src/tools/
├─ toolbar.tsx                 existing toolbar plus inline search/filter trigger
├─ view-controls.tsx           shared handle, toolbar, active bar, one popover
├─ active-bar.tsx              conditional filter/sort selectors and + Filter
├─ filter-selector.tsx         blue rule-count trigger
├─ filter-menu.tsx             recursive groups, rules, and operand controls
├─ filter-tree.ts              small pure immutable tree mutations/counting
└─ *.test.tsx / *.test.ts      focused behavior and helper coverage
```

`TableViewContent` loses its table-only selector bar. No new provider or
context is introduced: the detached popover handle is passed through the
three control components that use it.

## Stacking

Toolbar and active bar use the same sticky control layer above layout content.
Popover and menu portals retain `--z-menu`. Center dialog and side sheet
already portal their backdrop and popup at the menu layer. The non-portal full
row view receives an explicit fixed overlay z-index so it covers sticky table
controls as well.

The change should not raise the toolbar above modal surfaces. Row view remains
the dominant surface in all three modes.

## Error and controlled-state behavior

- If a controlled owner rejects `setFilters`, the editor rerenders the owner's
  authoritative tree; it does not retain a mirrored local filter tree.
- Deleted properties and unsupported plugins are excluded from new rules.
  Existing invalid rules remain representable and can be deleted; the editor
  displays their stored IDs as unavailable instead of throwing.
- Clearing the final root rule calls `table.clearFilters()` so the active bar
  can disappear when no sorting remains.
- Search and filter controls remain usable when there are zero matching rows.

## Testing

Focused table-view tests cover:

- search expansion, focus, typing, clearing, and transient ownership;
- conditional active-bar visibility and recursive rule counts;
- both detached triggers opening the same editor;
- first-property auto-open without persisting an empty filter;
- immediate add, edit, delete, AND/OR, and three-level nesting behavior;
- each operand metadata kind with representative persisted values;
- controls rendering for table, list, board, and timeline layouts;
- full row view receiving the overlay stacking class; and
- existing toolbar sort/settings behavior remaining green.

Verification commands:

```sh
pnpm --filter @notion-kit/table-view test
pnpm --filter @notion-kit/table-view typecheck
pnpm --filter @notion-kit/table-view lint
pnpm --filter @notion-kit/table-view build
```

## Success criteria

- Search filters visible rows without persisting view state.
- Toolbar Filter and the active filter pill open one shared editor.
- The full screenshot-shaped nested filter structure can be created and edited
  through three group levels with immediate persistence.
- Toolbar and active bar behavior is identical across current layouts and is
  inherited by future layouts.
- Every row-view mode visually covers the controls.
- No dependency, `table-hook`, or unrelated layout refactor is included.
