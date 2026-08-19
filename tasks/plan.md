# Implementation Plan: Cell Plugin Editor Composition

## Overview

Replace the monolithic `CellPlugin.renderCell` contract with value and editor
capabilities, then use those capabilities in both normal cells and bulk edit.
The plan preserves current visual/layout behavior, removes the bulk type switch,
and makes checkbox a mixed-aware inline editor.

## Architecture Decisions

- `renderCellValue` is required and `renderCellEditor` is optional; no legacy
  compatibility is retained.
- Editors return an `inline` or `popover` presentation result. Generic hosts
  own composition, never built-in plugin IDs.
- Bulk uses `plugin.default.data` as draft data plus selected values as scope
  context, and resolves exactly one final value before `updateCells`.
- The bulk bar uses one detached Popover handle; normal cells retain their
  local popovers and exact styling/placement behavior.

## Dependency Graph

```text
Plugin contract/types
        ↓
Built-in value/editor registrations
        ↓
Shared single-cell host and layout migration
        ↓
Bulk detached-popover host and checkbox toggle
        ↓
Regression, package, and browser verification
```

## Task List

### Phase 1: Contract and reusable primitives

- [ ] Task 1: Replace the headless cell-renderer contract.
- [ ] Task 2: Split text, link, number, and checkbox into value/editor pieces.

### Checkpoint: Contract

- [ ] All plugin factories and test fixtures typecheck without `renderCell`.
- [ ] No production `CellPlugin` renderer uses a legacy fallback.

### Phase 2: Structured editors and cell hosts

- [ ] Task 3: Migrate select and date renderer registrations to shared editor results.
- [ ] Task 4: Introduce shared single-cell composition and migrate supported layouts.

### Checkpoint: Single cells

- [ ] Existing table, list, board-property, timeline, and row-view flows retain their visible behavior.
- [ ] Board title remains covered by its dedicated view-level interaction.

### Phase 3: Bulk composition and verification

- [ ] Task 5: Replace bulk type switching with registry-driven editors and detached popover composition.
- [ ] Task 6: Complete focused regression, documentation, and browser verification.

### Checkpoint: Complete

- [ ] The bulk bar contains no plugin-type switch or plugin-specific editor import.
- [ ] All focused tests, typechecks, and lints pass.
- [ ] Visual regression check confirms no deliberate styling changes.

## Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Generic host changes alter per-layout popover geometry | High | Keep existing popover options in editor results; test every layout and manually inspect placement. |
| Bulk functional updater resolves from a selected row | High | Standardize on `plugin.default.data` draft and test mixed selections. |
| Checkbox loses mixed state | Medium | Give bulk scope all selected values and test all-true, all-false, and mixed. |
| Breaking public types leaves examples/fixtures stale | Medium | Typecheck the entire workspace and search for `renderCell` before completion. |

## Approval Gate

Do not start implementation until the user approves this plan and
[`tasks/todo.md`](./todo.md).
