# Table-view plugin responsibilities

The canonical plugin contract and built-in data semantics live in
[`@notion-kit/table-hook/plugins`](../../table-hook/docs/plugins.md). This page
documents only the UI boundary.

## What a table-view plugin provides

Each exported factory is a no-argument configured wrapper around the matching
headless factory. The wrapper supplies the current icon and React callbacks:

- `renderCellValue` for the visible cell;
- `renderCellEditor` for an optional inline or popover editor;
- `renderConfigMenu` for property configuration, when supported;
- `renderGroupingValue` for grouped labels, when supported;
- the default and property icons used by the existing property UI.

`renderCellValue` is required. `renderCellEditor` is deliberately optional;
there is no legacy `renderCell` fallback. `defaultColumn.cell` and direct
row-view and timeline consumers compose `Cell.Root` with a surface frame.
`Cell.Content` resolves data, configuration, lock state, and mutations.
It delegates empty-state decisions to `plugin.isEmpty` and copy text directly
to `plugin.toTextValue`; table-view does not infer either semantic from a
built-in plugin ID.
Ordinary registered value callbacks return semantic content; ordinary popover
editor composition places that content inside the layout-owned trigger, while
inline editor results use the inline presentation path. `Cell.Tooltip` mounts
only around list and board compact frames. Registered plugin renderer callbacks
never render `Cell.Trigger` or choose presentation classes or compact widths. A
value-only plugin therefore stays readable without accidentally becoming editable.

The wrapper must not reimplement conversion, sorting, grouping, counting,
method IDs, or compatibility fallbacks. It may adapt component props and wire
UI-only callbacks before invoking the headless descriptor.

Every valid select or multi-select option renders its own `TooltipPreset` on
every cell surface. List and board cells retain the outer property tooltip, so
an option tooltip may be nested inside that property tooltip.

Bulk edit discovers the same optional `renderCellEditor`; a plugin is eligible
only when it supplies that capability and does not set `disableBulkEdit`.
Popover editors use the bulk bar's shared detached popover, while inline
editors render directly in the bar. Checkbox therefore uses the same direct
toggle in a cell and in bulk. It is a real checkbox control: mouse click and
keyboard activation both commit `!allSelected`, and
the bulk control reports false, true, or mixed selected-value state. The host
forwards locked/disabled state to either presentation so a disabled editor
cannot mutate rows.

Bulk commits begin with `plugin.default.data`. A functional `onChange` updater
is resolved once and persisted with one atomic update across the selected rows;
the editor does not receive an arbitrary selected row as its starting value.

## UI ownership by source area

| Area                                                                       | Responsibility                                                                                                                              |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/common/cell.tsx`                                                      | Owns compound cell composition.                                                                                                             |
| `src/plugins/<type>/`                                                      | Ordinary registered renderer callbacks own semantic value/editor content plus configuration menus and grouping labels.                      |
| `src/menus/`                                                               | Render plugin-provided method and grouping options; persist the selected view action. Generic menus must not branch on built-in plugin IDs. |
| `src/table-footer/`                                                        | Render the resolved calculation result supplied by table-hook.                                                                              |
| `src/table-body/`, `src/table-header/`                                     | Render rows, groups, headers, resize, and drag interaction surfaces.                                                                        |
| `src/list-view/`, `src/board-view/`, `src/timeline-view/`, `src/row-view/` | Layout-specific rendering and interaction behavior.                                                                                         |

`TitleTableSlot` and `TitleCompactSlot` are composition support colocated with
the title implementation. `Cell.Content` invokes them to preserve title quick
actions and triggers; they are not the registered plugin value/editor callback
contract.

The title plugin-ID checks in cell composition remain an accepted special case.
The remaining checkbox direct-toggle, copy-visibility, and presentation
plugin-ID checks are deferred design debt: a separate design should move those
UI decisions into cell value rendering. This change does not add renderer props
or presentation metadata to bridge them.

## Extension rule

A custom plugin can be placed in the same `plugins` array as built-in wrappers.
If it registers a capability in `table-hook`, the generic menus should discover
it without a new table-view type switch. New UI is needed only when the custom
plugin requires a renderer or configuration surface.

For an editor-capable custom plugin, the bulk bar discovers
`plugin.renderCellEditor` directly. The plugin selects inline or popover
presentation; it does not require a `plugin.type === "…"` branch in
`BulkEditColumn`.

## Related audits

See the [table-view testing audit](./testing/README.md) for the component and
interaction contracts that protect this boundary.
