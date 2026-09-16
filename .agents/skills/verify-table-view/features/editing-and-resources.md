# Edit values and own resources

Users edit typed values on several surfaces and see the same row data when changing views. Library consumers independently own data, property definitions, and view settings or let the hook retain each resource in memory.

## Sub-features

- `edit-commit`: text/title/link popovers commit on Enter or blur; Escape discards the draft. Number editing normalizes numeric input and converts empty/NaN input to null; its editor check does not reject every nonfinite value. The hook treats nonfinite values as empty for numeric sorting/filtering. [Text input](../../../../packages/table-view/src/common/text-input-popover.tsx), [number editor](../../../../packages/table-view/src/plugins/number/number-cell.tsx), [numeric semantics](plugin-behaviors.md).
- `edit-options`: select one option or accumulate multiple tags, search choices, remove selections, and create options. Option metadata and rename/delete propagation belong to [properties](properties.md). [Select menu](../../../../packages/table-view/src/plugins/select/select-menu/select-menu.tsx), [selection logic](../../../../packages/table-view/src/plugins/select/select-menu/use-select-menu.ts).
- `edit-date`: choose a date or range, toggle End date and Include time, type range/time values, and Clear. Date/time format and timezone change property configuration; date values and time inclusion change row data. [Date picker](../../../../packages/table-view/src/plugins/date/date-cell/date-time-picker.tsx).
- `edit-checkbox`: toggle the cell trigger directly. The inner checkbox is display-only. [Checkbox adapter](../../../../packages/table-view/src/plugins/checkbox/plugin.tsx).
- `edit-surfaces`: Table cells, List/Board compact cells, separate compact-title Edit controls, and visible non-title properties in row details have distinct entry paths. Empty compact properties can be omitted; detail shows their empty editor. [Renderers](../../../../packages/table-view/src/plugins/renderers.tsx), [title slots](../../../../packages/table-view/src/plugins/title/title-cell.tsx), [row properties](../../../../packages/table-view/src/row-view/view-props.tsx).
- `edit-effects`: an ordinary cell change updates its value and last-edited timestamp, keeps created time, and can affect grouping/sorting/filtering/calculation. Created/last-edited cells are read-only. [Row updates](../../../../packages/table-hook/src/features/row-actions.ts), [generated date adapters](../../../../packages/table-view/src/plugins/date/plugin.tsx).
- `edit-copy-links`: supported value renderers expose Copy to Clipboard; contact links use mailto/tel/URL semantics. A javascript URL is suppressed. [Copy button](../../../../packages/table-view/src/common/copy-button.tsx), [link cell](../../../../packages/table-view/src/plugins/link/link-cell.tsx).
- `resource-ownership`: data, properties, and view independently accept a controlled prop or an initial default. Callbacks propose `{ next, action }`; supplied owner props remain authoritative, including rejection/replacement. Switching ownership during one mount is unsupported. [Public props](../../../../packages/table-hook/src/table-contexts/types.ts), [resource lifecycle](../../../../packages/table-hook/src/table-contexts/use-table-view.tsx), [action payloads](../../../../packages/table-hook/src/table-contexts/actions.ts).
- `plugin-consumer`: table-hook data plugins define defaults, conversion, text matching, sorting/grouping/filtering/calculation methods; table-view pairs each data plugin ID with exactly one UI adapter. Duplicate IDs, missing adapters, and orphan adapters are rejected. [Data plugin contract](../../../../packages/table-hook/src/plugins/types.ts), [UI registry](../../../../packages/table-view/src/plugins/registry.ts). Type/configuration menus derive their available capabilities from registered plugins. See the [12-plugin matrix](plugin-behaviors.md) for behavior beyond editing.

## How to get to it (user POV)

- In Table, click a cell or focus it and press Enter/Space. Click a checkbox cell to toggle it.
- In List, click a nonempty value, or hover the row and use **Edit** to rename its title. Clicking the row opens detail.
- In Board, click a property value or use the card's **Edit** title control. Clicking the card opens detail.
- Open a row in Side/Center/Full display and edit a visible property's value. Its property label opens configuration, a different action.
- Hover supported values for **Copy to Clipboard**; use the rendered contact link for navigation.
- A consuming app supplies resource props/defaults and plugin pairs. Those integration inputs are not end-user toolbar controls.

## Driving it with Playwright

Preconditions: healthy built fixture, fresh controlled page. Alpha has Notes `first note`. Reuse `TableViewObject` only as a UI adapter.

1. `table.cellEditor("Alpha", "first note").open()`; fill its textbox with a draft and press Escape. Require the original Notes value and no data mutation.
2. After the editor unmounts, `table.cellEditor("Alpha", /first note$/).fill("source-derived note")`. Require the visible value, matching rendered resource, and `data.cell.update` for the same row/property. When timestamp behavior is affected, also compare created and last-edited metadata before/after.
3. `table.openPrimaryRow("table", { id: "row-alpha", name: "Alpha" })`; find the Notes row in the Alpha dialog and require the committed value. Close that detail.
4. `table.setLayout("list")`; hover `table.rowBlock("row-alpha")`, click its **Edit** button, and rename the title. Return to Table and require both the renamed title and committed Notes. This exercises the separate compact-title entry.
5. Capture action trace, final screenshot, and parent/rendered resource snapshots. For uncontrolled changes, repeat relevant interactions on the uncontrolled route and prove layout changes retain values; a reload starts a new default state.

For dates/options/copy behavior, use the actual corresponding cell controls above and check both the rendered value and appropriate data/property/clipboard effect. Add these paths when they are relevant to the change; the representative recipe does not imply they all ran.

## Gotchas

- Row-detail and Timeline titles are display-only. Rename through a Table cell or List/Board Edit control.
- Hidden properties are not available in row detail. Show the property first if it is part of the journey.
- Fixture reload resets memory. The packages do not provide database persistence.
- The fixture parent accepts proposals. It cannot prove owner rejection, mixed ownership, or custom plugin behavior without a consumer configured for those cases.
- A callback alone does not prove that a controlled owner accepted an edit. Compare the rendered resource and reopen its UI value.
- A hovered text cell's accessible name can include **Copy to Clipboard**. Scope by row/property and allow that prefix instead of matching only the value exactly.
