# Menus and plugin UI audit

## Responsibility

Protect UI discovery and interaction around plugin-provided capabilities,
property configuration, selection options, calculations, sorting/grouping, and
row actions. Menus render choices from plugin descriptors; they do not encode
headless data semantics.

## Invariants

- Unsupported operations are absent, not fake disabled placeholders.
- Selecting a menu option emits the expected serializable view/resource action.
- Plugin renderers, config menus, grouping values, and editors preserve their
  user-visible behavior.
- Locked views block mutation while leaving permitted navigation available.
- Bulk editing is discovered through `renderCellEditor`, not built-in plugin
  IDs. A property is eligible only with that capability and without
  `disableBulkEdit`.
- A custom popover editor receives the correct detached-popover routing and
  config callbacks; its default-data functional update commits once across the
  selected rows.
- Inline checkbox editors are directly clickable and keyboard-operable. Bulk
  state is accessible as false, true, or mixed, and locked/disabled state
  prevents mutation.
- Advanced filter operands use fixed accessible names inside their owning rule.
  Single-choice operands support search and one selection; multi-choice
  triggers compact selected values and expose removable chips, search, and
  checked options only while their floating popup is open. Date operands use
  preset/custom-date and range-calendar interactions without leaking picker
  state into persisted filters until the value is complete.

## Source and tests

- Menu tests: [`src/menus/`](../../src/menus/)
- Advanced filter menu interactions: [`filter-menu.test.tsx`](../../src/menus/filter-menu/filter-menu.test.tsx)
- Plugin renderer tests: [`cell-renderers.test.tsx`](../../src/plugins/cell-renderers.test.tsx)
- Select interactions: [`src/plugins/select/`](../../src/plugins/select/)
- Number configuration: [`number-config-menu.test.tsx`](../../src/plugins/number/number-config-menu/number-config-menu.test.tsx)
- Date editing: [`date-cell.test.tsx`](../../src/plugins/date/date-cell/date-cell.test.tsx)
- Table-view plugin wrappers: [`src/plugins/plugins.test.tsx`](../../src/plugins/plugins.test.tsx)
- Bulk editor value resolution: [`bulk-editors.test.tsx`](../../src/plugins/bulk-editors.test.tsx)
- Bulk edit controls and destructive actions: [`src/common/bulk-edit/`](../../src/common/bulk-edit/)
- Cross-layout shared editor host probe: [`cell-renderers.test.tsx`](../../src/plugins/cell-renderers.test.tsx)

## Update this audit when

Add or update coverage when a menu option, persisted action, renderer/editor
interaction, capability-discovery path, or lock boundary changes.
