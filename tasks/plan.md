# Implementation Plan: table-hook searching and nested filtering

## Overview

Implement a headless, client-side search and nested-filtering pipeline for
`@notion-kit/table-hook`. TanStack Table owns transient global-search state;
the existing table view resource owns the serializable advanced-filter tree.
No search or advanced-filter UI is included.

The detailed feature contract is in
[`2026-08-25-table-hook-search-and-filtering-design.md`](../docs/superpowers/specs/2026-08-25-table-hook-search-and-filtering-design.md).

## Dependency graph

```text
filter types + validator + pure evaluator
  ├── CellPlugin filtering capability
  │     ├── text-like and select/checkbox/number operators
  │     └── date operators
  ├── TableViewState + view action + controlled resource coverage
  └── AdvancedFilteringFeature + TanStack global-filter pipeline
          └── public exports, audits, focused integration coverage
```

Tasks 1–4 establish independently testable domain and state foundations.
Task 5 then connects the pipeline after its inputs and contracts are stable.
Task 6 is the documentation/export completion slice.

## Architecture decisions

- Register TanStack's `columnFilteringFeature` and `globalFilteringFeature`.
  Search remains in the unowned `globalFilter` atom and uses the native
  `setGlobalFilter` API.
- Keep `view.filters` as the sole advanced-filter state. Do not serialise it
  into TanStack `columnFilters`, because that flat AND-only representation
  cannot faithfully model nested AND/OR groups.
- Implement only the irreducible extension—a small
  `AdvancedFilteringFeature` and a composed filtered row model—using existing
  TanStack table feature, atom, memo, and row-model conventions.
- Keep tree matching and operator matching pure. A group may nest to three
  group levels; `null` and empty groups pass all rows.
- Expose plugin-defined operator capabilities; defer every visual concern to a
  later table-view change.

## Phases and task order

### Phase 1: Domain model and built-in operators

- [ ] Task 1: Add filter-tree contracts, validation, and pure evaluation.
- [ ] Task 2: Add the generic `CellPlugin` filtering capability and text-like
      built-in operators.
- [ ] Task 3: Add choice, checkbox, and numeric built-in operators.
- [ ] Task 4: Add date and derived-date built-in operators.

### Checkpoint: domain model

- [ ] Recursive AND/OR semantics, invalid-rule semantics, and the three-level
      boundary are covered without rendering React.
- [ ] Every existing built-in plugin has the intended capability or an explicit
      documented omission.
- [ ] Focused package tests pass.

### Phase 2: Resource and TanStack pipeline

- [ ] Task 5: Add `view.filters`, resource actions, `AdvancedFilteringFeature`,
      and the composed TanStack global-search/filter row model.

### Checkpoint: state and pipeline

- [ ] Controlled owners remain authoritative and rejected filter proposals do
      not become hidden local state.
- [ ] `table.setGlobalFilter` changes rows without updating `view` or invoking
      `onViewChange`.
- [ ] Search and advanced filters compose before grouping and sorting.

### Phase 3: Public contract and handoff

- [ ] Task 6: Export the public contracts and update table-hook responsibility
      and testing-audit documentation.

### Checkpoint: complete

- [ ] Focused tests, typecheck, and lint pass.
- [ ] All specification success criteria are met.
- [ ] No table-view UI, new dependency, or user-owned image change is included.

## Risks and mitigations

| Risk                                                               | Impact | Mitigation                                                                                              |
| ------------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------- |
| A nested tree is forced into TanStack `columnFilters`              | High   | Keep the tree only in `view.filters`; compose a thin predicate stage after TanStack global filtering.   |
| Search uses sorting accessor values or renderer output             | High   | Register one plugin-aware global filter function that calls `toTextValue`.                              |
| Controlled view updates leave a stale local filter copy            | High   | Use existing `useResourceState` / `setTableGlobalState` only; add accepted and rejected proposal tests. |
| Date and derived-date operators drift from existing date semantics | Medium | Reuse current date utilities and test timestamps, empty values, and configured time zones.              |
| Future UI requires a different tree encoding                       | Medium | Persist stable IDs, generic operator IDs, JSON-safe operands, and UI-neutral group/rule nodes.          |
| Grouped rows are filtered after aggregation                        | Medium | Verify the pipeline feeds filtered leaf rows into the existing grouped row model.                       |

## Parallelisation

Tasks 2–4 can proceed in parallel after Task 1 defines the final capability
contract. Task 5 must wait for Tasks 1–4, because it consumes the evaluator and
plugin capabilities. Task 6 follows Task 5 so its public API and audit reflect
the implementation accurately.

## Verification commands

Run from the repository root:

```sh

pnpm -F @notion-kit/table-hook test
pnpm -F @notion-kit/table-hook typecheck
pnpm -F @notion-kit/table-hook lint
```

## Out of scope

- Search UI, shortcuts, focus management, or toolbar wiring.
- Advanced-filter menus, chips, nested rule editor, or operand controls.
- Server-side/manual filtering, pagination, remote query translation, and
  saved-filter migration.
- New dependencies, TanStack upgrades, and changes to the provided images.
