# Implementation Plan: Table UI Plugin Registry

## Overview

Separate pure table-hook data plugins from table-view UI plugins. Replace the
current renderer callbacks, `CellPresentation`, and `CellEditorResult` with a
table-view registry whose `renderCell` and `renderBulkEditor` callbacks return
complete React nodes.

## Architecture Decisions

- Keep `CellPlugin` pure and move all React-valued contracts and display
  metadata to `TableUiPlugin` in table-view.
- Expose one `plugins: { data, ui }` pair at the table-view boundary; resolve
  its registries by shared ID only inside table-view.
- Make UI renderer callbacks direct React-node producers. Reuse table-view
  components for popovers, triggers, and editors instead of a renderer-result
  protocol.
- Make `renderBulkEditor` optional; absence replaces the core
  `disableBulkEdit` flag.
- Require every UI plugin to provide `renderGroupingValue`; adapters that need
  the common output invoke `DefaultGroupingValue` themselves, so grouping hosts
  have no fallback branch.
- Move grouping React rendering from table-hook's grouping feature to
  table-view layouts.
- Preserve every existing visual result. Moving class ownership is allowed;
  changing the resolved styling or interaction is not.

## Dependency Graph

```text
pure CellPlugin types and built-in factories
  -> TableUiPlugin types, paired registries, and resolver
    -> table-view provider and menu/grouping resolution
      -> shared direct cell/bulk UI components
        -> built-in UI plugin migration
          -> integration tests and manual surface verification
```

## Task List

### Phase 1: Establish the split

- [ ] Task 1: Make table-hook plugin contracts data-only.
- [ ] Task 2: Add table-view UI plugin contracts and paired registry resolver.
- [ ] Task 3: Move table-view provider and property/type menu metadata to the resolver.

### Checkpoint: Registry foundation

- [ ] Data plugins compile without React renderer configuration.
- [ ] Built-in data/UI registries have one-to-one IDs.
- [ ] Missing or duplicate UI adapters fail during registry setup.
- [ ] The table-view public API accepts only the new paired registry; no legacy
      array/combined-plugin input remains.

### Phase 2: Move rendering ownership

- [ ] Task 4: Replace common cell-host presentation/result interpretation with direct UI rendering helpers.
- [ ] Task 5: Migrate text-like, number, and date UI plugins.
- [ ] Task 6: Migrate select, checkbox, and title UI plugins.
- [ ] Task 7: Move bulk editing to table-view adapters.
- [ ] Task 8: Move grouping UI rendering to table-view adapters.

### Checkpoint: Built-in behavior

- [ ] No cell or bulk host behavior branches on a built-in plugin ID.
- [ ] `CellPresentation`, `CellEditorResult`, and renderer-result interpretation are gone.
- [ ] Table/list/board/row-view/timeline preserve current behavior.
- [ ] Visual differences are treated as regressions, not refactor cleanup.

### Phase 3: Validate the public seam

- [ ] Task 9: Migrate tests, fixtures, docs, and custom-plugin examples.
- [ ] Task 10: Run focused verification and complete manual multi-surface review.

### Checkpoint: Complete

- [ ] Both packages pass tests, typecheck, lint, and format checks.
- [ ] Custom data/UI plugin pair renders, edits, groups, and configures through the new registry.
- [ ] The migration contains no compatibility adapter for the previous contract.
- [ ] The public plugin API has one obvious paired-registration path and no
      additional renderer/presentation abstraction.

## Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| UI metadata is still read through `CellPlugin` in menus or bulk edit | High | Audit every `plugin.meta`, `plugin.default.icon`, renderer, and `disableBulkEdit` reference before deleting core fields. |
| Grouping still returns React from table-hook | High | Replace the grouping row rendering hook with raw value/column data before migrating table-view grouping components. |
| Default-property creation loses names, icons, or widths | High | Route all property defaults through the resolved UI plugin and retain persisted column-icon precedence. |
| Popover lifecycle changes during direct rendering | Medium | Give shared `CellPopover` the current close, cancellation, geometry, and disabled behavior; exercise text, date, and title flows first. |
| Custom plugin migration is type-unsafe | Medium | Use `TableUiPluginFor<CorePlugin>` and registry construction tests to couple IDs, data, and config at compile and runtime. |

## Open Questions

- None. The approved design makes title a UI-plugin implementation rather than
  a cell-host exception.
