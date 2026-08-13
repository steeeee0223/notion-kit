# Component-object and harness audit

## Responsibility

Protect the semantic test surface used by table-view interaction tests. Helpers
should query user-visible roles, labels, names, values, and group membership;
they should not expose DOM-index or implementation-only selectors as the public
test contract.

## Invariants

- The render harness can mount a full-plugin table with controlled probes.
- Component objects expose stable actions and observable results for menus,
  rows, groups, layouts, and view settings.
- Harness contracts remain typed and deterministic when resources are updated.

## Source and tests

- Harness contract: [`harness-contract.test.tsx`](../../src/__tests__/component-objects/harness-contract.test.tsx)
- Harness renderer: [`render-table-view.tsx`](../../src/__tests__/component-objects/render-table-view.tsx)
- Component-object directory: [`src/__tests__/component-objects/`](../../src/__tests__/component-objects/)

## Update this audit when

Add or update coverage when a helper adds a new public query/action, changes the
fixture contract, or exposes a previously hidden implementation detail.
