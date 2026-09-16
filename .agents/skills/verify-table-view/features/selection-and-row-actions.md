# Select and act on rows

Users select cell ranges for navigation or select row identities for bulk mutations. Row and group controls act on the intended records while preserving unrelated data.

## Sub-features

- `cell-range`: pointer rectangles, Control/Meta add/subtract, Shift extension, arrow navigation, Shift+arrows, select all, Escape, and Enter/Space editor entry. Editors own their keys until closed. The selection domain contains visible non-group data cells in Table only and prunes invalid ranges after view changes. [Cell gestures](../../../../packages/table-view/src/table-contexts/cell-selection-provider.tsx), [hook domain](../../../../packages/table-hook/src/features/cell-selection.ts).
- `row-selection`: individual row, header Select all rows, and group-descendant selection with checked/indeterminate feedback. Deletion prunes selected IDs; locking clears selection and prevents new row selection. [Row selection](../../../../packages/table-hook/src/features/row-selection.ts), [group selection](../../../../packages/table-hook/src/features/grouping.ts), [header checkbox](../../../../packages/table-view/src/table-header/table-header-row.tsx).
- `bulk-values`: selected rows expose editors for visible properties with a bulk adapter. Text/number/date/select/checkbox/contact values overwrite selected rows; multi-select does not union old tags. Checkbox checks all unless all were already checked. Title and generated times have no bulk editor. [Bulk bar](../../../../packages/table-view/src/common/bulk-edit/bulk-edit-bar.tsx), [bulk adapters](../../../../packages/table-view/src/plugins/renderers.tsx), [batch updates](../../../../packages/table-hook/src/features/row-actions.ts).
- `row-lifecycle`: add below or Alt-add above, append New page, duplicate with new row/cell IDs, and delete. Batch duplicates follow their sources. Single-row deletion is immediate; bulk/group deletion requires confirmation. [Row controls](../../../../packages/table-view/src/common/row-action-group.tsx), [row actions](../../../../packages/table-hook/src/features/row-actions.ts), [bulk actions](../../../../packages/table-view/src/common/bulk-edit/bulk-action-menu.tsx).
- `row-menu`: search actions; edit/remove/upload an icon; configured open, full-page/new-tab open, Copy link, Duplicate, Delete. Menu-scoped shortcuts are Meta+Shift+Enter, Meta+D, and Backspace. [Row menu](../../../../packages/table-view/src/menus/row-action-menu.tsx).
- `row-move`: drag ordering and cross-group moves update row position and grouping value. Table/List/Timeline sorted drag asks whether to remove sorting; cancellation retains the previous state. Board drag-over can make provisional moves and roll back a canceled drag. [Table drag](../../../../packages/table-view/src/table-body/table-body.tsx), [Board drag](../../../../packages/table-view/src/board-view/use-board-dnd.ts), [move semantics](../../../../packages/table-hook/src/features/row-actions.ts).
- `group-actions`: add a row using the first encountered member's raw grouping-property value, hide/show aggregation, hide group, and confirm/cancel deleting only its rows. Bucket labels do not become cell data: interval groups copy a numeric value, date groups copy a date object, and multi-select groups can copy trailing tags. Generated timestamps remain derived from row metadata. [Group controls](../../../../packages/table-view/src/common/group-actions.tsx), [group representatives](../../../../packages/table-hook/src/features/grouping.ts), [row creation/movement](../../../../packages/table-hook/src/features/row-actions.ts).

## How to get to it (user POV)

- In Table, close an editor to return focus to its cell, then use arrows/Shift/select-all/Escape; drag cell ranges and adjust with Control/Meta.
- Use **Select row <id>**, header **Select all rows**, or group **Select group <id>**. Selected rows reveal property controls, **More bulk actions**, and **Delete N rows**.
- Hover Table/List rows or Timeline sidebar rows for **Add row** and **Row actions**. **New page** appends; Alt-click Add row inserts above.
- Open a Board card's **Actions**, or right-click a Timeline bar, for alternate row-menu entries.
- Drag a row's handle, a Board card, or a Timeline sidebar row to move it. With sorting active, choose **Remove** or **Don't remove** in **Would you like to remove sorting?**.
- Use a group's **Add row** and **Group options** for group-scoped actions.

## Driving it with Playwright

Preconditions: healthy controlled fixture, unlocked Table; Alpha has Frontend, Empty has no tags, Omega has Frontend and Backend.

1. Click **Select row row-alpha** and **Select row row-empty**. Require **2 rows selected**, an indeterminate **Select all rows**, and unchanged data before the bulk action.
2. In the bulk bar choose **Tags → Backend**. Require exactly Backend for Alpha and Empty, unchanged Frontend/Backend for Omega, and a data action targeting only the selected IDs. Capture the selected state and resulting resources.
3. Toggle **Settings → Lock database**. Require the bulk bar and row-selection controls to disappear and `view.locked` to become true. Lock/unlock is a view operation, not a data edit.
4. For movement changes, add a sort, drag through the actual row handle, cancel removal of sorting, then repeat and accept. Compare sorting and row order after both decisions. For group selection, make a multi-row group and verify its indeterminate state after deselecting one child.

Capture user actions and visible state alongside the targeted row IDs and untouched values. Cell-selection changes require focus/range evidence and no data mutation; bulk changes require resource evidence.

## Gotchas

- Cell ranges and selected rows are separate systems. A cell rectangle does not select bulk-edit rows.
- The bulk bar is suppressed in Board even when selected IDs exist. Table/List/Timeline expose it; do not promise visibility in every layout.
- Bulk drafts start at plugin defaults, not a common selected value; checkbox considers the selected set. Select/date bulk controls can also change property configuration, so distinguish those effects from row-value updates. [Plugin matrix](plugin-behaviors.md).
- Verify edited rows' last-edited time and resulting sort/filter/group/calculation changes. New/duplicated rows receive fresh created and last-edited timestamps; generated-time group membership cannot be assigned by copying a null cell.
- Status-group movement does not prove interval/date/alphabetical-group movement. Verify the selected grouping method, copied raw value, and final boundary together when those methods are affected.
- Cell selection remains available while locked. Row selection is cleared/blocked; editing and action restrictions must be checked per surface, including Board.
- Board drag-over can emit provisional updates. Exactly one callback is not a cross-layout drag guarantee.
- Row-menu Move to, Edit property, and Comment are unimplemented menu capabilities; pointer movement exists.
- Icon file upload stores a local blob URL. Link actions require consumer-provided row URLs and can open tabs or write the clipboard.
