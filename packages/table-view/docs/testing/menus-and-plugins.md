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

## Source and tests

- Menu tests: [`src/menus/`](../../src/menus/)
- Plugin renderer tests: [`cell-renderers.test.tsx`](../../src/plugins/cell-renderers.test.tsx)
- Select interactions: [`src/plugins/select/`](../../src/plugins/select/)
- Number configuration: [`number-config-menu.test.tsx`](../../src/plugins/number/number-config-menu/number-config-menu.test.tsx)
- Date editing: [`date-cell.test.tsx`](../../src/plugins/date/date-cell/date-cell.test.tsx)
- Table-view plugin wrappers: [`src/plugins/plugins.test.tsx`](../../src/plugins/plugins.test.tsx)
- Bulk editor value resolution: [`bulk-editors.test.tsx`](../../src/plugins/bulk-editors.test.tsx)
- Bulk edit controls and destructive actions: [`src/common/bulk-edit/`](../../src/common/bulk-edit/)

## Update this audit when

Add or update coverage when a menu option, persisted action, renderer/editor
interaction, capability-discovery path, or lock boundary changes.
