# Table View Plugin Functions Test Strategy

Status: Approved for Phase 3 on 2026-08-07

Related documents:

- `docs/superpowers/specs/2026-08-07-table-view-plugin-functions.md`
- `packages/table-view/docs/plugins.md`
- `tasks/plan.md`

## Objective

Build high-value test suites that prove the plugin capability matrix works end to end without coupling tests to implementation details. The suites prioritize method semantics, fallback order, state/resource integrity, timezone and numeric boundaries, custom-plugin extensibility, accessibility-facing menu behavior, and backward compatibility.

Coverage percentage is a guardrail, not the goal. Every test must kill a plausible regression: wrong method selection, incorrect bucket boundary, lost resource state, incorrect unit formatting, unstable timezone behavior, unsupported option leakage, or a generic menu that silently reintroduces a built-in type switch.

## Baseline and Existing Gaps

### Measured table-hook baseline

The package coverage command completed successfully on 2026-08-07:

```text
Test files: 9 passed
Tests:      176 passed
Statements: 81.61%
Branches:   67.36%
Functions:  80.92%
Lines:      83.08%
```

Feature-relevant files are below the desired branch confidence:

```text
methods.ts   statements 90.29%, branches 57.44%
grouping.ts  statements 81.29%, branches 66.03%
counting.ts  statements 90.47%, branches 80.00%
lib/utils.ts statements 95.23%, branches 50.00%
```

The new suites should raise coverage in these paths through meaningful fallback and transition cases. They should not attempt to inflate unrelated `row-actions.ts` coverage.

### Table-view baseline limitation

`packages/table-view/vitest.config.ts` already enforces 90% statements and 90% branches. A baseline attempt was invalid because overlapping coverage processes shared and removed `coverage/.tmp`, after which two existing UI tests timed out. Do not treat that run as a product failure or a valid baseline.

Coverage jobs for these packages must run sequentially:

```sh
pnpm --filter @notion-kit/table-hook coverage -- --reporter=dot
pnpm --filter @notion-kit/table-view coverage -- --reporter=dot
```

Do not run these two coverage commands concurrently unless each is configured with a distinct reports directory.

### Behavioral gaps in existing suites

- `plugin-methods.test.tsx` covers one custom-plugin happy path but not selected/default/first/legacy/unknown resolver branches.
- No tests prove a value comparator can drive both row and automatic group ordering.
- No controlled resource tests cover stable plugin method IDs or group-sort mode changes.
- `calc-menu.test.tsx` verifies generic and checkbox outcomes but not arbitrary custom calculation groups.
- Sort-menu tests only assert generic Ascending/Descending labels.
- Edit-group-menu tests do not cover grouping methods, automatic sorting, or Manual mode transitions.
- Number formatting is embedded in the cell renderer; aggregation and grouping formatting have no shared contract tests.
- Numeric interval tests do not exist for exact or negative boundaries.
- Date tests do not cover Relative buckets, configurable week starts, DST, or range duration.
- Unknown persisted method IDs and legacy plugins are not tested across UI and resource boundaries.
- Current UI tests cover roles and interactions but not the accessibility names introduced by plugin-specific labels.

## Testing Pyramid

Target distribution for new cases:

```text
Unit / pure contract tests       60–70%
Hook and component integration   25–35%
Workflow smoke tests              5–10%
Browser E2E                           0%
```

Browser E2E is not required for this library-level change. The meaningful boundary is React component + table-hook integration under jsdom. Add a browser test only if implementation exposes behavior that jsdom cannot represent; no such behavior is currently planned.

## Coverage Targets

### Changed-file targets

| Area | Statements | Branches | Functions | Lines |
| --- | ---: | ---: | ---: | ---: |
| Pure number/date/grouping utilities | 100% | ≥95% | 100% | 100% |
| Method resolvers and plugin-method state | ≥95% | ≥90% | ≥95% | ≥95% |
| Group execution and resource wiring | ≥95% | ≥90% | ≥95% | ≥95% |
| Calculation/sort/group menus | ≥90% | ≥90% | ≥90% | ≥90% |
| Built-in plugin registrations | 100% of registered IDs/labels | Every fallback branch | Every factory | Every registration line |

### Package gates

- `@notion-kit/table-view` must continue satisfying its configured 90% statement and branch thresholds.
- `@notion-kit/table-hook` has no configured global threshold today. This feature must not reduce its measured package percentages, and the changed-file targets above are mandatory.
- Adding a new package-wide table-hook threshold is recommended separately after unrelated low-coverage areas are addressed; it is not required for this branch.

### Mutation-sensitive assertions

The suite must fail if any of these mutations are introduced:

- swap default and first-method resolver precedence;
- reverse `desc` handling;
- use `Math.ceil` or truncation instead of `Math.floor` for negative numeric buckets;
- include the upper numeric boundary in the preceding bucket;
- drop currency or percent formatting from aggregates;
- use host timezone instead of `DateConfig.tz`;
- hard-code Monday instead of reading `weekStartsOn`;
- group a date range by `end` instead of `start`;
- sort multi-select by any option other than the first;
- retain stale group visibility after grouping keys change;
- expose checkbox automatic group sorting;
- index presentation hints with an unknown method ID.

## Suite 1 — Table-hook Method Contracts

**File:** `packages/table-hook/src/__tests__/plugin-methods.test.tsx`

**Type:** Unit + hook integration.

**High-value cases:**

1. Selected sorting/grouping ID wins over `defaultMethod`.
2. Unknown selected ID resolves to default.
3. Missing/unknown default resolves to first registered method.
4. Empty methods fall back to legacy `compare` and `toGroupValue`/`toValue`.
5. Missing cell values are normalized before registered comparators run.
6. A legacy row-only sorting function remains usable for row sort but is excluded from automatic group sort.
7. A custom value comparator drives ascending and descending row sort.
8. Custom sorting/grouping/counting IDs remain strings and are never inferred from labels.
9. `weekStartsOn` defaults to `1` and passes each value `0` through `6` into method context.
10. Invalid runtime weekday values are rejected by TypeScript; runtime normalization is tested only if the public API accepts untyped input.

Example parameterized resolver test:

```ts
it.each([
  ["selected", "secondary", "secondary"],
  ["unknown selected", "missing", "default"],
  ["no selected", undefined, "default"],
])("ResolveSortingMethod_%s_UsesExpectedMethod", (_case, selected, expected) => {
  expect(resolveSortingMethod(plugin, selected)?.id).toBe(expected);
});
```

Avoid asserting internal atom layout here; assert public resolver/table behavior.

## Suite 2 — Selection State and Resource Integrity

**Files:**

- `packages/table-hook/src/__tests__/resource-api.test.tsx`
- `packages/table-hook/src/__tests__/grouping.test.tsx`

**Type:** Hook integration and contract tests.

**High-value cases:**

1. Uncontrolled tables retain selected sorting/grouping IDs and group-sort mode across rerenders.
2. Controlled `view.pluginMethods` emits exact next resource and action payload.
3. Parent acceptance of the emitted resource makes the selected method effective.
4. Parent rejection leaves the controlled table on the previous method.
5. Old view resources with no `pluginMethods` retain current default behavior.
6. Partial nested state is deep-merged without losing timeline configuration.
7. Unknown persisted IDs do not rewrite resources merely because a fallback resolves.
8. Changing grouping method atomically rebuilds keys and prunes stale visibility IDs.
9. Surviving group IDs retain visibility across regrouping.
10. Automatic sort changes order but not visibility.
11. Dragging in automatic mode switches to Manual and applies exactly one new order.
12. Switching back to automatic recomputes order deterministically.
13. No-op method/mode updates emit no resource action.
14. Removing a grouped column prunes its selected grouping method.

Use exact action assertions rather than `expect.objectContaining` for resource integrity:

```ts
expect(onViewChange).toHaveBeenLastCalledWith({
  next: expectedView,
  action: {
    id: expect.any(String),
    type: "view.plugin_grouping_method.change",
    payload: {
      propertyId: "col1",
      previousMethodId: "exact",
      nextMethodId: "alphabetical",
    },
  },
});
```

## Suite 3 — Generic Calculation Discovery

**Files:**

- `packages/table-hook/src/__tests__/counting.test.tsx`
- `packages/table-view/src/menus/calc-menu.test.tsx`
- `packages/table-view/src/table-footer/table-footer-cell.test.tsx` (new only if footer cases make `calc-menu.test.tsx` unfocused)

**Type:** Unit + component integration.

**High-value cases:**

1. A custom plugin group and function render without editing menu type logic.
2. Selecting the custom method executes it and updates footer output.
3. Unsupported groups are absent for the plugin.
4. Checkbox retains specialized Count/Percent groups.
5. Text/select/date retain generic count policy.
6. `None` clears the visible result.
7. Cap toggle affects count results but not percentage or numeric/date aggregates.
8. Unknown selected method renders a safe None/empty footer state.
9. Method label fallback is `label` → `name` → no label.
10. Optional hints render when supplied; custom methods without hints remain accessible.

Assertions should use roles and accessible names:

```ts
expect(menu.item("Filled with A")).toBeVisible();
expect(screen.getByRole("button", { name: "Name calculation" }))
  .toHaveTextContent("2");
```

## Suite 4 — Built-in Registration Matrix

**File:** `packages/table-view/src/plugins/plugins.test.tsx`

**Type:** Parameterized contract tests.

Build one declarative expected matrix and assert exact IDs, default IDs, direction labels, grouping IDs, counting group IDs, and `enableGroupSort`:

```ts
const expected = {
  text: {
    sorting: ["text"],
    grouping: ["exact", "alphabetical"],
    counting: ["all", "values", "unique", "empty", "nonempty"],
    groupSort: true,
  },
  checkbox: {
    sorting: ["checkbox"],
    grouping: ["value"],
    counting: ["all", "checked", "unchecked"],
    groupSort: false,
  },
} as const;
```

Extend this matrix to all 12 plugins. Exact-set assertions prevent accidental extra capabilities as well as missing ones.

Additional semantic cases:

- text Alphabetical groups `Apple`/`apricot` together, `Banana` separately;
- whitespace-only text returns empty;
- digits/symbols preserve their first displayed character;
- checkbox false/true direction labels match the matrix;
- select/multi-select compare only the first option;
- multi-select empty arrays remain last ascending;
- link/title/text share semantics without sharing mutable descriptor arrays.

## Suite 5 — Number Methods and Formatting

**Files:**

- `packages/table-view/src/plugins/number/format.test.ts`
- `packages/table-view/src/plugins/number/methods.test.ts`
- `packages/table-view/src/plugins/cell-renderers.test.tsx`

**Type:** Pure unit tests and one renderer regression suite.

### Formatting matrix

Test `number`, `number_with_commas`, `percent`, and `currency` with default, 0, 2, and 5 decimal settings where meaningful. Include zero, negative, large, and fractional inputs. Existing cell strings must remain unchanged after formatter extraction.

### Calculation matrix

For Sum/Average/Median/Min/Max/Range cover:

- empty rows → `""`;
- all null/invalid/non-finite → `""`;
- one value;
- zero as a valid value;
- positive and negative mix;
- decimals;
- even and odd median;
- duplicate values;
- formatted percent and currency results;
- source arrays are not mutated by median sorting.

Representative dataset:

```ts
const values = [null, "-10", "0", "10.5", "20.5", "invalid"];

expect(run(sum, values, numberConfig)).toBe("21");
expect(run(min, values, numberConfig)).toBe("-10");
expect(run(max, values, numberConfig)).toBe("20.5");
expect(run(range, values, numberConfig)).toBe("30.5");
```

### Interval grouping matrix

Use `it.each` across sizes 1, 10, 100, and 1000. For every size test:

- `0` starts the zero bucket;
- `size - epsilon` remains in the zero bucket;
- `size` starts the next bucket;
- `-epsilon` belongs to `[-size, 0)`;
- `-size` starts `[-size, 0)`;
- null/invalid maps to empty;
- group label endpoints reuse number format and unit.

Do not snapshot bucket labels; assert exact lower/upper formatted endpoints.

## Suite 6 — Date Methods and Timezone Boundaries

**Files:**

- `packages/table-view/src/plugins/date/methods.test.ts`
- `packages/table-view/src/plugins/date/utils.test.ts`
- `packages/table-view/src/plugins/plugins.test.tsx`

**Type:** Pure deterministic unit tests with fake timers.

### Test controls

- Freeze `Date.now()` once per case.
- Always pass an explicit timezone.
- Use Asia/Taipei for non-DST boundaries.
- Use America/New_York for spring-forward and fall-back cases.
- Restore real timers and mocks after every case.

### Calculation cases

1. Earliest uses valid starts only.
2. Latest uses end with start fallback.
3. Date range spans earliest start to latest end/start fallback.
4. Date-only range uses zoned calendar-day duration across DST.
5. Time-aware range uses elapsed duration.
6. Duration emits at most two non-zero day/hour/minute units.
7. Empty/invalid input returns `""`.
8. Created time extracts `row.createdAt`; last edited extracts `row.lastEditedAt`.
9. Date calculation formatting uses column date/time configuration.

### Grouping cases

For Day/Week/Month/Year test exact boundaries immediately before and at the boundary in the configured timezone. For Week, run the same dates with `weekStartsOn: 0` and `1` and prove the bucket changes.

For Relative, cover every bucket and precedence:

- Today wins over This week;
- Yesterday/Tomorrow win over Last/Next/This week;
- another day in current week → This week;
- prior/following adjacent weeks → Last week/Next week;
- older/newer dates → Earlier/Later;
- date range uses start even when end is in another bucket;
- stable bucket IDs map to chronological `toSortValue` anchors.

## Suite 7 — Sorting and Grouping Menu Integration

**Files:**

- `packages/table-view/src/menus/sort-menu.test.tsx`
- `packages/table-view/src/menus/prop-menu.test.tsx`
- `packages/table-view/src/menus/edit-group-menu.test.tsx`
- component objects for sort and grouping menus

**Type:** Component interaction and accessibility tests.

### Sort menu

- text shows A→Z/Z→A;
- number shows Low→high/High→low;
- checkbox shows Checked→unchecked/Unchecked→checked;
- date shows Old→new/New→old;
- changing property resets incompatible selected method;
- a one-method built-in keeps compact layout;
- a multi-method custom plugin shows method selector;
- selected custom method changes row order;
- removal/deletion behavior remains unchanged.

### Property menu

- quick-sort labels match Sort menu for the same plugin;
- quick sort uses the plugin default method;
- existing sort replacement/removal resource behavior remains exact.

### Group menu

- Group using appears only when alternatives exist;
- selecting Alphabetical changes visible text groups;
- number exposes exactly intervals 1/10/100/1000;
- date exposes Relative/Day/Week/Month/Year;
- Sort groups exposes Manual plus eligible plugin sort methods;
- checkbox omits automatic sort;
- automatic ascending/descending changes group order;
- visibility survives order changes;
- drag in automatic mode switches to Manual;
- method selection and sort mode remain selected after rerender;
- all controls have stable accessible names and checked state.

Prefer visible behavior over internal atom assertions. Internal state is asserted only in table-hook suites.

## Suite 8 — Compatibility and Workflow Smoke Tests

**Files:**

- `packages/table-hook/src/__tests__/plugin-methods.test.tsx`
- `packages/table-hook/src/__tests__/resource-api.test.tsx`
- `packages/table-view/src/menus/calc-menu.test.tsx`
- `packages/table-view/src/menus/sort-menu.test.tsx`
- `packages/table-view/src/menus/edit-group-menu.test.tsx`

**Type:** Cross-feature workflow smoke tests.

Keep this suite small. Cover three workflows:

1. **Custom plugin workflow:** register custom calculation/sorting/grouping methods, select each through UI, and observe calculation, row order, and group keys.
2. **Old resource workflow:** load a view without `pluginMethods`, sort/group/calculate as before, then select one new method and verify a minimal optional resource addition.
3. **Unknown ID workflow:** load unknown method IDs, render safely through fallbacks, change to a valid method, and emit a valid serializable resource.

These tests prove composition; they should not repeat every numeric/date edge case from pure suites.

## What Not to Test

- TanStack's own sorting/grouping implementation independent of plugin integration.
- Trivial getters or setters already proven through a behavior test.
- React rendering of static icons or unchanged cell components.
- Every visual pixel or menu class name.
- Private helper call counts when output/state proves the contract.
- All pairwise combinations of plugin × calculation × layout; the registration matrix plus representative integration cases provides higher value.
- Browser E2E for logic fully observable through component integration.

## Test Data and Fixture Policy

- Add small builders for rows, columns, registered methods, and controlled view harnesses; do not duplicate large `Row` literals across suites.
- Builders must require the value relevant to the test and provide deterministic IDs/timestamps.
- Keep domain matrices adjacent to the domain test file.
- Custom plugin fixtures belong in test utilities, never production exports.
- Do not share mutable plugin descriptor arrays between cases.
- Use `it.each` for value boundaries and registration matrices; use named individual tests for state transitions and workflows.
- Test names follow the repository's `Subject_Scenario_ExpectedResult` convention.

## Execution and Quality Gates

### Fast inner loop

Run the smallest suite associated with the current implementation slice:

```sh
pnpm --filter @notion-kit/table-hook test src/__tests__/plugin-methods.test.tsx
pnpm --filter @notion-kit/table-view test src/plugins/number/methods.test.ts
pnpm --filter @notion-kit/table-view test src/plugins/date/methods.test.ts
pnpm --filter @notion-kit/table-view test src/menus/calc-menu.test.tsx
pnpm --filter @notion-kit/table-view test src/menus/sort-menu.test.tsx src/menus/edit-group-menu.test.tsx
```

### Package regression

```sh
pnpm --filter @notion-kit/table-hook test
pnpm --filter @notion-kit/table-view test
pnpm --filter @notion-kit/table-hook typecheck
pnpm --filter @notion-kit/table-view typecheck
```

### Sequential coverage gate

```sh
pnpm --filter @notion-kit/table-hook coverage -- --reporter=dot
pnpm --filter @notion-kit/table-view coverage -- --reporter=dot
```

Review both total coverage and the changed-file rows. Package success with a changed file below its target is not sufficient.

### Final static/build gate

```sh
pnpm --filter @notion-kit/table-hook lint
pnpm --filter @notion-kit/table-view lint
pnpm --filter @notion-kit/table-hook build
pnpm --filter @notion-kit/table-view build
pnpm test
pnpm typecheck:affected
pnpm lint:affected
```

## Exit Criteria

- Every matrix capability has an exact registration assertion.
- Every new stable method ID has a semantic unit test and at least one resolver or UI selection path.
- Every resolver fallback and unknown-ID branch is covered.
- Numeric exact/negative boundaries and all four intervals are covered.
- Date timezone, DST, Sunday/Monday week starts, range start, and every Relative bucket are covered.
- Controlled/uncontrolled resource ownership and no-op behavior are covered.
- A custom plugin proves calculation, sorting, grouping, and menu discovery without generic type switches.
- Changed-file coverage targets are met and table-view retains its package thresholds.
- Both package test/typecheck/lint/build commands pass.
- No flaky timers, locale-dependent expected strings, broad snapshots, or parallel shared-directory coverage runs remain.

## Phase Gate

After this strategy and `tasks/plan.md` are approved, Phase 3 will turn each suite into dependency-ordered tasks in `tasks/todo.md`. Production code and test implementation begin only after that task list is approved.
