# Table View Search and Advanced Filter UI Checklist

Source documents:

- Design: `docs/superpowers/specs/2026-08-26-table-view-search-and-advanced-filter-design.md`
- Plan: `docs/superpowers/plans/2026-08-26-table-view-search-and-advanced-filter.md`

## Task 1: Filter-tree helpers

- [ ] Add recursive rule counting.
- [ ] Add immutable append, update, and remove helpers.
- [ ] Return `null` when the last root rule is removed.
- [ ] Cover three-level nested fixtures and reference preservation.
- [ ] Run focused helper tests.

## Task 2: Shared controls and search

- [ ] Replace the toolbar Search placeholder with the expanding `people.tsx` pattern.
- [ ] Wire search to transient `globalFilter` state.
- [ ] Add `ViewControls` above the layout switch.
- [ ] Move `SortSelector` out of table-only content.
- [ ] Hide ActiveBar when neither sorting nor filter rules are active.
- [ ] Render controls for table, list, board, and timeline.
- [ ] Put full row view explicitly above sticky controls.
- [ ] Run toolbar and layout tests.

## Task 3: Nested filter editor

- [ ] Render rules and groups recursively through three group levels.
- [ ] Add property/operator selectors from plugin filtering metadata.
- [ ] Add text, number, option, date, date-range, and relative-date operands.
- [ ] Apply edits immediately through `table.setFilters`.
- [ ] Add rule/group creation and AND/OR changes.
- [ ] Add delete-only row/group menus and root Delete filter.
- [ ] Preserve controlled-owner authority without mirrored filter state.
- [ ] Run editor tests.

## Task 4: Detached triggers and integration

- [ ] Create one Base UI popover handle and one popover content instance.
- [ ] Wire the toolbar Filter icon to the shared editor.
- [ ] Add the blue recursive rule-count pill to ActiveBar.
- [ ] Wire `+ Filter` to the root property picker.
- [ ] Auto-open the first property picker without persisting an empty tree.
- [ ] Verify anchoring, overflow, focus, and row-view stacking manually.
- [ ] Run test, typecheck, lint, and build for `@notion-kit/table-view`.

## Review boundaries

- [ ] No new dependency.
- [ ] No `table-hook` change.
- [ ] No server filtering, saved filters, duplication, wrapping, reordering, or drag-and-drop.
- [ ] No toolbar/filter framework beyond the components required by this UI.
