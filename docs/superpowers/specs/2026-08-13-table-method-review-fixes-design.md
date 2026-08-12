# Table method review fixes design

## Context

The plugin-method branch currently represents group ordering as `manual` or
`automatic` plus a separate `desc` flag. The UI already exposes exactly three
states—Manual, Ascending, and Descending—so persisted state should express those
same three states directly. Review also found two user-visible sorting
regressions: changing a selected row-sort method does not invalidate TanStack's
cached sorted row model, and checkbox direction labels describe the opposite of
the comparator's result.

PR #167 contains additional feedback. Only reproducible behavior defects,
violations of the approved plugin-method spec, and small simplifications that
reduce duplication without widening scope are included.

## Goals

- Represent group ordering as `manual`, `ascending`, or `descending` without an
  `automatic` mode or separate `desc` flag.
- Keep Manual as the default and preserve ascending/descending group ordering
  through the grouped plugin's selected sorting method.
- Invalidate row sorting centrally after an authoritative sorting-method change
  and remove the menu-specific cache-busting call.
- Make checkbox labels agree with visible row order.
- Correct reproducible spec-related edge cases from PR #167.
- Retain only tests that catch a production regression or document a non-obvious
  public contract.

## State and execution

`PluginMethodState.groupSort` becomes:

```ts
type GroupSort =
  | { mode: "manual" }
  | { mode: "ascending"; method: string }
  | { mode: "descending"; method: string };
```

Missing legacy resources default to Manual. This branch has not shipped the
temporary `automatic` representation, so no compatibility adapter for that
shape is added. Group ordering derives direction from `mode`; dragging an
automatically ordered group writes `{ mode: "manual" }`. Resource actions carry
the complete previous and next group-sort objects.

The authoritative `sortingMethodByColumn` map is the invalidation boundary for
row sorting. Once an uncontrolled update commits, or a controlled parent accepts
the proposed view, table-hook invalidates the current sorting state centrally.
The sort menu does not mutate sorting merely to break a cache.

## Included PR feedback

The implementation fixes behavior where evidence shows a spec-related defect:
negative date-editor sentinels grouping as real dates; timezone-incorrect date
grouping labels; sparse cells reaching registered comparators as `undefined`;
pending controlled group drags being discarded; incomplete group-sort action
payloads; irrelevant count-capping UI on custom calculation groups;
whitespace-sensitive unique counts; and fabricated runtime table context.
Identical select/multi-select method registrations may use one small shared
helper.

Feedback is not implemented when it is not reproducible, contradicts the spec,
removes required compatibility, or is unrelated low-priority cleanup. In
particular, multi-select comparison already string-normalizes nullish keys;
interval labels intentionally describe half-open ranges; legacy calculation
hints remain a compatibility fallback; configurable currencies are outside this
feature; and broad cross-feature or generic-setter refactors are not required to
correct behavior.

## Testing

Every behavior fix starts with a focused failing test. High-value retained tests
cover authoritative row-sort invalidation, checkbox direction execution, the
three group-sort states and controlled round trips, pending drag settlement,
date sentinel/timezone boundaries, sparse comparator inputs, calculation menu
capability behavior, and trimmed unique counting. Temporary reproduction tests,
source-shape assertions, and cases fully subsumed by stronger integration tests
are removed before final verification.

## Verification

Run focused tests after each red-green cycle, then both package test, typecheck,
lint, format, and build commands. Reply to every unresolved PR #167 review thread
with either the verified fix or the technical reason for not changing it.

