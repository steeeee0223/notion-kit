# Resources and feature-state audit

## Responsibility

Protect table-hook's stateful table APIs and resource boundaries: controlled and
uncontrolled updates, row/column actions, selection, freezing, counting, and
group visibility/order state.

## Invariants

- Resource callbacks receive the exact next resource and action payload.
- Controlled owners remain authoritative; rejected proposals do not become
  hidden local state.
- Row and column mutations preserve positions, IDs, timestamps, and cloning
  rules.
- Feature state updates remain serializable and compose with table resources.

## Source and tests

- Resource ownership and controlled settlement: [`resource-api.test.tsx`](../../src/__tests__/resource-api.test.tsx)
- Column operations: [`columns-info.test.tsx`](../../src/__tests__/columns-info.test.tsx)
- Row operations: [`row-actions.test.tsx`](../../src/__tests__/row-actions.test.tsx)
- Row selection: [`row-selection.test.tsx`](../../src/__tests__/row-selection.test.tsx)
- Group state and visibility: [`grouping.test.tsx`](../../src/__tests__/grouping.test.tsx)
- Counting state: [`counting.test.tsx`](../../src/__tests__/counting.test.tsx)
- Column freezing: [`freezing.test.tsx`](../../src/__tests__/freezing.test.tsx)

## Update this audit when

Add or update coverage when a resource action, controlled/uncontrolled boundary,
feature state shape, mutation API, or serialization rule changes.
