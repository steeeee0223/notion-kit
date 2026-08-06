# Table Row Selection Ownership

## Goal

Keep the existing row-selection behavior while removing React-owned selection state and synchronization logic from `useTableView`.

## State ownership

TanStack Table's internal `baseAtoms.rowSelection` is the sole owner of row selection. `useTableView` does not mirror this slice in `useState`, derive an effective selection, or synchronize it with effects.

All selection writes continue through table feature APIs. The row-selection feature resolves updater functions against `baseAtoms.rowSelection`, rejects writes while the table is locked, and removes IDs that are not present in the current data. This includes synthetic grouped-row IDs while preserving selectable leaf IDs.

## Behavior boundaries

- Locking a table clears `baseAtoms.rowSelection` synchronously in the table-menu feature.
- Selection APIs are no-ops while locked, so unlocking cannot restore a selection attempted during the locked period.
- Table data mutations prune removed row IDs synchronously in the row-actions feature. Reusing a deleted row ID does not restore its old selection.
- Controlled `view` and `data` prop changes are reconciled in the feature layer before consumers can observe a committed stale selection.
- Unrelated view changes, including layout changes, preserve the existing row-selection object when its contents are unchanged.

## Code organization

Selection-specific helpers and lifecycle logic live in a dedicated table feature rather than `use-table-view.tsx`. The hook only supplies data, columns, resource state, and table options. Menu and row-action features perform the mutations they own.

No public row-selection props or new public APIs are introduced.

## Verification

The existing row-selection tests remain the behavioral contract. Implementation proceeds test-first by adding focused assertions for direct atom ownership and synchronous controlled-state reconciliation before removing the React-owned state. The package test suite, typecheck, and lint checks must pass after the refactor.
