# Cell Plugin Empty Semantics Design

## Goal

Make `CellPlugin` the single source of truth for whether cell data is empty
throughout `@notion-kit/table-hook` and `@notion-kit/table-view`. At the same
time, remove the copy-value conversion duplicated by the table-view cell host
and remove the surface gate around select-option tooltips.

The change follows the cell presentation refactor in commit `c97371e6`. It is
not a redesign of that presentation system. Remaining non-title plugin-ID
branches are audited here, but presentation ownership and the
`renderCellValue` contract stay unchanged in this work.

## Hard Constraints

- Add required `isEmpty: (data: Data) => boolean` to `CellPlugin`.
- Every table-hook or table-view behavior that determines whether cell data is
  empty must use the current plugin's `isEmpty` capability. Do not maintain a
  second empty predicate in a view, method, renderer, or utility.
- Remove `getCopyValue`; copy text comes directly from
  `plugin.toTextValue(cellData, row)`.
- Keep title-specific plugin-ID branches as accepted exceptions.
- Do not add cell presentation metadata or change the `renderCellValue`
  contract in this work.
- Remove `SelectOptionTooltipContext` and make every valid select option's
  tooltip available on every surface.
- Keep the existing list/board property tooltip. Nested property and option
  tooltips are accepted behavior.
- In `packages/table-hook`, update existing tests only as required by the
  contract and behavior changes. Do not add unrelated, low-value, or
  test-driven-development coverage.
- Do not initially modify files under `packages/table-view` whose names match
  test-file conventions, including `*.test.*`, `*.spec.*`, fixtures, or
  component test objects. If the final table-view typecheck is blocked only
  because a directly declared test plugin lacks the new required member, stop
  and report the exact files; leave their mechanical corrections as deferred
  TODOs for explicit user approval rather than adding a fallback or weakening
  the production contract.
- Run formatting, typechecking, and linting only after all source, required
  table-hook test, mock, documentation, and story/example corrections are
  complete.
- Do not use Codex browser view. The user will perform the visual and document
  review manually.
- Preserve the user's existing uncommitted edit in
  `packages/table-view/src/common/cell.tsx`.
- Prefer direct calls and closures over new abstraction layers. The change may
  parameterize an existing capability builder, but must not add an empty-value
  service, registry, execution context, adapter, migration layer, or optional
  compatibility path.
- Remove the old truthiness/`toTextValue` empty-count implementations and their
  registered names after consumers move to `plugin.isEmpty`. Do not preserve a
  legacy empty-semantics fallback.

## Canonical Empty Semantics

Each built-in factory owns one `isEmpty` implementation.

| Plugin | Empty when |
| --- | --- |
| title, text, email, phone, URL | `data.trim() === ""` |
| number | data cannot be parsed as a finite number |
| checkbox | `data === false` |
| select | `data === null` |
| multi-select | `data.length === 0` |
| date | `data.start === undefined` |
| created time, last edited time | never |

For number data, `null`, an empty or whitespace-only string, and an invalid
numeric string such as `"abc"` are empty. `"0"` and every finite numeric value
are not empty.

String-like plugins apply `trim` only for empty classification. Their stored
data and `toTextValue` output are not trimmed by this change.

A missing row property is not valid plugin `Data`. A caller that can encounter
a missing property must preserve its existing missing-property behavior or
normalize to `plugin.default.data` before invoking `plugin.isEmpty`; it must not
pass `undefined` into a string plugin and invent a separate fallback predicate.

## Plugin Contract and Capability Threading

The required contract becomes:

```ts
interface CellPlugin<Key extends string, Data, Config> {
  // existing members
  isEmpty: (data: Data) => boolean;
}
```

All built-in factories, production mocks, examples, table-hook fixtures, and
approved direct structural plugins must implement the property.
Table-view-only test fixtures follow the explicit deferred-test rule above.
`UnknownCellPlugin` continues to erase the concrete data type for generic
consumers.

Capability threading is the selected integration approach. Consumers that
already have the plugin call `plugin.isEmpty(data)` directly. Existing filter
and count capability builders accept the exact callback and close over it.
Sorting and grouping add one direct short-circuit at their existing resolver
boundaries. No execution context or intermediate empty-capability abstraction
is introduced.

## Table-Hook Behavior

The audit covers every behavior that explicitly classifies whole cell data as
empty or non-empty:

- `is-empty` and `is-not-empty` filter operators;
- Count Empty, Count Not Empty, Percentage Empty, and Percentage Not Empty;
- checkbox Checked/Unchecked counts and percentages, where false maps to the
  plugin's empty classification;
- empty ordering in sorting;
- empty buckets or labels in grouping;
- built-in capability helpers that currently use truthiness, trimmed text,
  `null`, empty arrays, missing date starts, or a local number predicate.

Operations with different semantics remain independent. For example, numeric
operand validation still verifies a finite operand, and Count Values/Count
Unique still count their defined scalar or list elements. They may skip an
empty cell through `isEmpty`, but `isEmpty` does not replace their item-counting
logic.

Generic execution must not branch on built-in plugin IDs. Empty semantics
enter through the plugin callback registered with the applicable capability.
The old scalar empty/non-empty aggregation functions and their named registry
entries are removed once no descriptor uses them. There is no fallback to
truthiness, `toTextValue`, a default predicate, or a legacy method name.

## Table-View Cell Behavior

`Cell.Content` resolves `isEmpty` once from the active plugin and uses it for
surface behavior:

- compact list and board cells omit empty ordinary content;
- row view renders the existing `RowViewEmptyContent` for empty ordinary
  content;
- table behavior remains unchanged;
- title and checkbox retain their current earlier specialized composition
  paths, but any empty classification performed inside those paths must use the
  plugin capability.

Delete `isCompactEmpty` and `isRowViewEmpty`. No replacement helper may switch
on plugin IDs.

Renderer early returns are not broadly refactored. Remove one only when it is
required to prevent a second cross-surface empty policy after `Cell.Content`
uses `plugin.isEmpty`. Structural rendering guards stay local, including a
value component returning no markup for absent display content and ignoring a
stale select option absent from current configuration.

## Copy Behavior

`Cell.Content` passes the plugin conversion directly to `CopyButton`:

```tsx
<CopyButton value={plugin.toTextValue(cellData, row.original)} />
```

Delete `GetCopyValueOptions`, `getCopyValue`, and the date-specific imports
used only by that helper. Date, created-time, and last-edited-time copy output
therefore follows their plugin `toTextValue` implementations exactly instead
of applying a table-view column-config conversion.

The existing copy visibility policy remains in place for this work.

## Select Option Tooltips

Delete `SelectOptionTooltipContext` and `SelectOptionTooltipScope`. Remove the
scope import and the select-ID branch from `Cell.Content`.

`SelectCellValue` always renders each configured option inside its existing
`TooltipPreset`. The tooltip is not disabled according to surface. Stale
option names that have no configured option continue to be omitted.

List and board still mount the outer property tooltip around the compact cell.
The resulting nested tooltips are explicitly accepted and must not be
suppressed by introducing another context or plugin-ID check.

## Remaining Plugin-ID Audit

The following current checks are not refactored in this work:

- title sizing in `Cell.CompactFrame`;
- disabling the outer property tooltip for title;
- title's table/list/timeline composition;
- checkbox direct-toggle composition;
- copy visibility by plugin type;
- `PRESENTATION_BY_PLUGIN_ID` and presentation-specific layout classes.

Title checks are accepted exceptions. The other checks are recorded technical
debt. The agreed future direction is to let cell value rendering declare its
own UI-specific behavior rather than add another central metadata descriptor.
That future work may require a separately approved renderer/surface design;
this change does not add `surface`, `layout`, or a presentation descriptor to
`CellValueProps`.

## Breaking Contract and Documentation

This is an intentional structural contract change: a custom `CellPlugin`
without `isEmpty` no longer typechecks. Update plugin documentation and all
repository-owned examples to show the required capability and explain that it
governs UI, filtering, counting, grouping, and sorting empty semantics.

No fallback derived from `toTextValue` is provided. Such a fallback would
reintroduce ambiguity for checkbox, multi-select, date, derived timestamps, and
invalid number data.

No legacy fallback is provided for old plugins or old empty-count method
implementations. Repository-owned plugins migrate in the same change. Existing
legacy sorting/grouping APIs that do not implement empty semantics are outside
scope and are neither expanded nor removed here.

## Verification Strategy

Use existing table-hook tests as the primary executable contract. Correct
fixtures and assertions whose expected behavior changes under canonical
emptiness, especially whitespace strings, invalid numbers, checkbox false,
empty select/multi-select values, and dates without a start. Add a narrowly
targeted assertion only if an existing table-hook suite cannot verify a
material contract path; do not broaden coverage for its own sake.

Do not initially edit table-view tests. Validate table-view through
typechecking, linting, existing unchanged tests if they can be run without
modification, and the user's manual review. Because the package TypeScript
configuration includes test sources, report any direct test-plugin contract
errors at the final typecheck checkpoint and defer those exact mechanical
updates until the user approves them.

After all edits are complete, run formatting fixes, then focused package
typechecks and lint. Run the relevant existing table-hook and table-view test
commands only after code stabilization; test failures must be diagnosed before
changing expectations.

## Out of Scope

- Redesigning cell presentation ownership.
- Adding `surface` or `layout` back to renderer props.
- Replacing the presentation registry.
- Removing accepted title ID checks.
- Refactoring checkbox, copy visibility, or presentation classes solely to
  remove their remaining plugin-ID checks.
- Removing the outer list/board property tooltip.
- Adding new dependencies.
- Unrelated test cleanup or coverage expansion.
