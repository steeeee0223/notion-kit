# Task checklist: table-hook searching and nested filtering

The design is defined in
[`2026-08-25-table-hook-search-and-filtering-design.md`](../docs/superpowers/specs/2026-08-25-table-hook-search-and-filtering-design.md),
and the sequencing rationale is in [`plan.md`](./plan.md).

## Task 1: Filter-tree domain model and evaluator

**Description:** Define JSON-safe rule/group types, three-level validation, and
a pure recursive row evaluator with deterministic invalid-rule behaviour.

**Acceptance criteria:**

- [ ] A root group supports AND/OR children and rejects a fourth group level.
- [ ] Empty/null groups pass rows; unknown, deleted, and unsupported rules do
      not match.
- [ ] Evaluation invokes the selected plugin operator without React rendering.

**Verification:**

- [ ] Focused evaluator tests cover nested AND/OR, short-circuiting, empty
      groups, depth validation, and invalid references.
- [ ] `pnpm -F @notion-kit/table-hook test -- filtering`

**Dependencies:** None

**Files likely touched:**

- `packages/table-hook/src/features/filtering.ts`
- `packages/table-hook/src/__tests__/filtering.test.tsx`
- `packages/table-hook/src/features/index.ts`

**Estimated scope:** Small (3 files)

## Task 2: Plugin filter capability and text-like operators

**Description:** Add the UI-neutral filtering capability to `CellPlugin` and
implement text-compatible operators for title, text, and link plugins.

**Acceptance criteria:**

- [ ] Capability descriptors have stable IDs, operand metadata, and pure
      matchers.
- [ ] Text-like plugins implement equality, negation, contains, prefix/suffix,
      and empty/non-empty semantics defined by the spec.
- [ ] Operators consume canonical plugin data rather than renderer output.

**Verification:**

- [ ] Plugin tests cover case-normalisation, empty values, and each operator.
- [ ] `pnpm -F @notion-kit/table-hook test -- plugins`

**Dependencies:** Task 1

**Files likely touched:**

- `packages/table-hook/src/plugins/types.ts`
- `packages/table-hook/src/plugins/text/plugin.ts`
- `packages/table-hook/src/plugins/title/plugin.ts`
- `packages/table-hook/src/plugins/link/plugin.ts`
- `packages/table-hook/src/plugins/plugins.test.ts`

**Estimated scope:** Medium (5 files)

## Task 3: Choice, checkbox, and numeric operators

**Description:** Implement filter capabilities for select/multi-select,
checkbox, and number plugins using the operator families in the supplied
matrices.

**Acceptance criteria:**

- [ ] Select and multi-select correctly express membership and non-membership.
- [ ] Checkbox correctly expresses checked and unchecked equality.
- [ ] Number correctly handles equality, inequalities, and empty/non-empty
      values without coercing invalid operands into matches.

**Verification:**

- [ ] Tests cover null data, multi-value membership, and numeric boundaries.
- [ ] `pnpm -F @notion-kit/table-hook test -- plugins`

**Dependencies:** Task 1

**Files likely touched:**

- `packages/table-hook/src/plugins/select/plugin.ts`
- `packages/table-hook/src/plugins/checkbox/plugin.ts`
- `packages/table-hook/src/plugins/number/plugin.ts`
- `packages/table-hook/src/plugins/plugins.test.ts`

**Estimated scope:** Medium (4 files)

## Task 4: Date and derived-date operators

**Description:** Add date filter capabilities for editable dates plus created
and last-edited derived dates, reusing current date conversion and time-zone
utilities.

**Acceptance criteria:**

- [ ] Date operators support equality, before/after, inclusive bounds, range,
      empty/non-empty, and the agreed relative-to-today operand.
- [ ] Derived date properties use row timestamps and do not require cell data.
- [ ] Time-zone and `includeTime` rules follow existing date-plugin semantics.

**Verification:**

- [ ] Tests cover boundary timestamps, empty dates, ranges, and derived values.
- [ ] `pnpm -F @notion-kit/table-hook test -- plugins`

**Dependencies:** Task 1

**Files likely touched:**

- `packages/table-hook/src/plugins/date/plugin.ts`
- `packages/table-hook/src/plugins/date/utils.ts`
- `packages/table-hook/src/plugins/plugins.test.ts`
- `packages/table-hook/src/plugins/date/utils.test.ts`

**Estimated scope:** Medium (4 files)

## Checkpoint: domain model

- [ ] Tasks 1–4 pass their focused tests.
- [ ] Review the operator IDs and JSON operand shapes before attaching them to
      persisted `view.filters`.

## Task 5: View resource and TanStack filtering pipeline

**Description:** Add the sole persistent `view.filters` resource, its action,
and a thin TanStack-compatible feature/row-model composition for global search
followed by nested filtering.

**Acceptance criteria:**

- [ ] `view.filters` works in controlled and uncontrolled table instances with
      no filter `useState` or mirrored `columnFilters` in `useTableView`.
- [ ] `view.filters.change` reports exact previous/next trees.
- [ ] Native `setGlobalFilter` remains internal, uses `toTextValue`, and composes
      with nested filtering before grouping and sorting.

**Verification:**

- [ ] Resource tests cover controlled acceptance/rejection and uncontrolled
      updates.
- [ ] Integration tests cover global search, nested filters, grouping, and
      sorting together.
- [ ] `pnpm -F @notion-kit/table-hook test -- resource-api filtering sorting-grouping`
- [ ] `pnpm -F @notion-kit/table-hook typecheck`

**Dependencies:** Tasks 1–4

**Files likely touched:**

- `packages/table-hook/src/features/filtering.ts`
- `packages/table-hook/src/features/index.ts`
- `packages/table-hook/src/features/menu.ts`
- `packages/table-hook/src/table-contexts/actions.ts`
- `packages/table-hook/src/table-contexts/use-table-view.tsx`

**Estimated scope:** Medium (5 files; corresponding test additions may be split
into a paired test-only commit if needed)

## Task 6: Public exports and behavioural documentation

**Description:** Export the filter contracts and update table-hook's
responsibility and test-audit documentation to match the completed behaviour.

**Acceptance criteria:**

- [ ] Consumers can import documented filter types and feature APIs from the
      package entry point.
- [ ] Documentation distinguishes transient search from persisted filtering.
- [ ] The audit links to the new/expanded tests and records controlled ownership
      requirements.

**Verification:**

- [ ] `pnpm -F @notion-kit/table-hook typecheck`
- [ ] `pnpm -F @notion-kit/table-hook lint`
- [ ] Manually verify no `table-view` import or UI source was added to
      `table-hook`.

**Dependencies:** Task 5

**Files likely touched:**

- `packages/table-hook/src/index.ts`
- `packages/table-hook/docs/README.md`
- `packages/table-hook/docs/testing/resources-and-features.md`

**Estimated scope:** Small (3 files)

## Checkpoint: complete

- [ ] `pnpm -F @notion-kit/table-hook test`
- [ ] `pnpm -F @notion-kit/table-hook typecheck`
- [ ] `pnpm -F @notion-kit/table-hook lint`
- [ ] Re-check all success criteria in the design specification.
