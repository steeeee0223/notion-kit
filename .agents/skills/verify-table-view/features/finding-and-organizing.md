# Find and organize rows

Users narrow data with search and typed filter trees, prioritize rows with sorting, partition them using plugin grouping methods, and summarize the currently matching data.

The [plugin matrix](plugin-behaviors.md) defines which methods each of the 12 built-ins supplies, including first-option multi-select semantics, empty ordering, date boundaries, and calculation differences. This file owns the shared interaction paths.

## Sub-features

- `search`: case-insensitive substring matching over plugin text values; collapse/reopen retains the query and Clear restores matching rows. It combines with structured filters. [Search control](../../../../packages/table-view/src/tools/toolbar.tsx), [matching pipeline](../../../../packages/table-hook/src/features/filtering.ts).
- `filter-tree`: nested And/Or groups up to three group levels; add/remove rules or groups; property/operator changes clear the previous operand. Unknown operators display as unavailable. [Recursive editor](../../../../packages/table-view/src/menus/filter-menu/filter-group-editor.tsx), [tree validation](../../../../packages/table-hook/src/features/filtering.ts).
- `filter-values`: plugin-defined text, number, checkbox, option/multi-option, date, date-range, and relative-date operands. Multi-select Contains requires all chosen options. Relative-date filters refresh with time. [Operand controls](../../../../packages/table-view/src/menus/filter-menu/operand-control.tsx), [select semantics](../../../../packages/table-hook/src/plugins/select/plugin.ts), [relative refresh](../../../../packages/table-hook/src/table-contexts/use-table-view.tsx).
- `sort-rules`: multiple prioritized properties, direction choice, property replacement, removal, and drag priority. Add sort omits already selected properties; replacement uses a separate property picker. There is no separate sorting-method picker: adding/replacing a property chooses its default method. A header sort replaces the whole rule list; plugin-empty values sort last in either direction. [Sort editor](../../../../packages/table-view/src/menus/sort-menu.tsx), [header sorting](../../../../packages/table-view/src/menus/prop-menu.tsx), [sorting resolution](../../../../packages/table-hook/src/methods.ts).
- `group-methods`: choose a grouping property and, where offered, Group using. Built-ins include text Exact/Alphabetical, number Every 1/10/100/1000, and dates Relative/Day/Week/Month/Year. [Group editor](../../../../packages/table-view/src/menus/edit-group-menu.tsx), [text methods](../../../../packages/table-hook/src/plugins/utils.ts), [number methods](../../../../packages/table-hook/src/plugins/number/plugin.ts), [date methods](../../../../packages/table-hook/src/plugins/date/plugin.ts).
- `group-presentation`: expand/collapse, hide/show individual/all/empty groups, manual drag ordering, automatic Sort groups, and remove grouping outside Board. Group actions can show/hide aggregation. [Group state](../../../../packages/table-hook/src/features/grouping.ts), [group actions](../../../../packages/table-view/src/common/group-actions.tsx).
- `calculate`: None, cap large counts at 99+, and plugin-defined count/percentage methods; Number adds Sum/Average/Median/Minimum/Maximum/Range; Date adds Earliest/Latest/Date range. Calculations use filtered pre-grouped rows, so filters and edits change totals. [Calculation menu](../../../../packages/table-view/src/menus/calc-menu.tsx), [calculation inputs](../../../../packages/table-hook/src/lib/utils.ts), [numeric methods](../../../../packages/table-hook/src/plugins/number/plugin.ts), [date methods](../../../../packages/table-hook/src/plugins/date/plugin.ts).

## How to get to it (user POV)

- Search from the toolbar's **Search** button and **Search table** textbox.
- Open filters from toolbar **Filter**, **Settings → Filter**, a property header's **Filter**, or the active **N rules** badge. Header entry adds a rule for that property.
- Open sorting from toolbar **Sort**, **Settings → Sort**, a header's **Sort**, or the active property/**N sorts** badge.
- Group through **Settings → Group**, header **Group/Ungroup**, or ungrouped Board's **Select a grouping property**. In the group editor use **Group using**, **Sort groups**, visibility controls, and move handles.
- Expand/collapse the group heading. Its **Group options** controls aggregation visibility; row mutations are covered in [row actions](selection-and-row-actions.md).
- Calculate through header **Calculate** or footer **<property> calculation**. Both use the same plugin method menu. [Toolbar and active entries](../../../../packages/table-view/src/tools/view-controls.tsx), [settings entries](../../../../packages/table-view/src/menus/table-view-menu.tsx).

## Driving it with Playwright

Preconditions: healthy controlled fixture. Scores are 10, empty, and 90. Scope nested controls to their owning Filter group/Filter rule.

1. Open **Settings → Filter**, then **Add filter rule → Add filter group**. In that group add Score Greater than 50 and Score Less than 20. Commit number operands by leaving their input.
2. The default And matches no row. Choose **Or** in the group's **Filter logic select**. Require Alpha and Omega, excluding Empty; require a nested `view.filters` group with numeric operands and `logic: "or"`.
3. Close and reopen through **2 rules**. Require Or and both rules to remain. Switch back to And and require no matching rows. Use **Delete filter** to restore all rows and a null filter tree.
4. Retain actions, intermediate matching states, final screenshot, and filter callback/resource evidence. This is a real nested-filter editor journey, not a direct tree setter.

When grouping changes, choose Score then **Group using → Every 100** and verify Alpha/Omega beneath the `score:0` boundary while Empty stays separate. When calculations change, select a numeric/date method through the actual header or footer and verify its exact value before and after filtering; a visible menu item alone is insufficient.

## Gotchas

- Search, basic grouping, row-sort direction/priority, and counting use internal table state. Structured filters write `view.filters`; sorting-method, grouping-method, and group-sort selections emit view resource events. Adding a sort can therefore change the view resource even though its rule list is internal.
- Group using appears only for plugins with multiple grouping methods. Automatic group sorting and manual drag order are different contracts; checkbox offers only Manual. Option-menu order does not determine row or group order.
- Board requires grouping and omits Remove grouping from its settings. An unchecked checkbox group is represented by `complete:null` in the fixture.
- Changing property/operator clears an old filter value. Enter a valid new operand before judging the resulting matches.
- Header sorting replaces rules; toolbar/settings sorting can append and reprioritize them. Test the affected entry explicitly.
