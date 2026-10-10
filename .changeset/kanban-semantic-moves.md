---
"@notion-kit/ui": major
"@notion-kit/table-hook": major
"@notion-kit/table-view": major
"@notion-kit/registry": major
---

Replace Kanban hover mutations with a temporary ID projection and one semantic move on drop. Cards and columns use a native inert overlay with React-owned ordering, including empty-column transfers and cancellation.

Breaking changes: Kanban.Root now requires `value`, a projected-value render function, `onMove`, and `renderOverlay`. Use `applyKanbanMove` for standalone boards. Remove `getKanbanItemsAfterDrag` and raw Kanban drag callbacks. Table instances replace `handleRowDragEnd`, `handleKanbanRowDragOver`, and `handleGroupedRowDragEnd` with `moveRow` and `moveGroup`. Cross-group movement requires the selected grouping method's explicit `getDropValue` capability. A completed row move reports any grouping delta in its single `data.row.move` action.
