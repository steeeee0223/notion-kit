# Table View E2E and Coverage Design

## Objective

Build a production-representative Chromium E2E suite for `@notion-kit/table-view`, while independently raising the package's Vitest statement and branch coverage to 90% through valuable unit and component tests.

The two coverage systems remain separate:

- Playwright reports the code exercised by high-value browser journeys. It has no percentage gate.
- Vitest enforces global `statements >= 90%` and `branches >= 90%` for all runtime source under `packages/table-view/src`.

Tests must follow the repository's testing strategy: each test must catch a production-relevant bug, document a non-obvious contract, guard a regression, or validate interaction between real components. Coverage alone is not a reason to add or keep a test.

## Current State

`apps/e2e` is a Next.js application that consumes built workspace packages. It currently has Vitest render/import checks but no Playwright configuration or table-view fixtures.

`packages/table-view` currently has 116 Vitest tests. The measured baseline is:

- Statements: 59.1% (776/1313)
- Branches: 47.35% (358/756)
- Functions: 53.82% (331/615)
- Lines: 63.1% (744/1179)

The existing tests are concentrated around menus, select configuration, and table reactivity. Date, number, link, title, board/list interactions, row actions, header actions, and several boundary paths are materially under-covered.

## Test Application Architecture

### Shared deterministic fixture

The controlled and uncontrolled pages share one deterministic fixture containing:

- title, text, number, select, checkbox, date, and link properties;
- fixed row, cell, property, and option IDs;
- fixed timestamps;
- empty and non-empty values;
- first and last row boundaries;
- multiple select groups, checkbox states, numeric boundaries, dates, and links;
- a deterministic `getRowUrl` implementation.

The fixture is maintained in one module so the pages exercise identical initial data without duplicating state logic.

### Controlled page

`apps/e2e/src/app/table-view/controlled/page.tsx` owns `data`, `properties`, and the public `view` resource in React state. The public view resource contains `layout`, `locked`, `rowView`, and `openedRowId`; sorting, grouping, and calculating remain internal table state in the current API. Each `onDataChange`, `onPropertiesChange`, and `onViewChange` handler applies `change.next` and records a compact diagnostic event.

A read-only test-state region exposes:

- callback counts;
- the last resource action;
- compact parent-owned data, property, and view state;
- a separately labelled internal-state diagnostic for sorting, grouping, and calculating when result-oriented UI assertions need additional failure context;
- a reset control that re-injects the initial state.

This region is an explicit test contract. It proves that UI changes reached the parent and that the component subsequently obeyed the controlled props; it is not used to bypass user-facing interactions.

### Uncontrolled page

`apps/e2e/src/app/table-view/uncontrolled/page.tsx` provides `defaultData`, `defaultProperties`, and `defaultView`. It does not mirror table state in a parent.

Tests observe state only through rendered UI. Interactions persist across layout and menu changes during a page lifetime, while browser reload returns to the deterministic defaults.

## Playwright Architecture

Playwright runs Chromium only because its JavaScript coverage API is Chromium-specific. The configuration provides:

- a fixed base URL and Next.js web server;
- a pre-test build of `@notion-kit/table-view`, preserving the e2e app's built-package purpose;
- isolated browser contexts and deterministic initial state;
- one CI retry;
- trace and screenshot capture on failure;
- no arbitrary waits or CSS implementation selectors.

Playwright component objects adapt the semantic operations in `packages/table-view/src/__tests__/component-objects` to Playwright locators. They use roles, accessible names, labels, and visible text. Component objects own navigation and actions; assertions remain in the test files so failures communicate the broken contract directly.

Tests are grouped by domain rather than by implementation file:

- controlled resources;
- uncontrolled state;
- plugin and cell editing;
- sorting, grouping, and calculating;
- header and property actions;
- row and group actions;
- layouts, row views, and drag-and-drop.

Test names use `TestUnit_Scenario_ExpectedOutcome`.

## High-Value E2E Journeys

Shared happy paths are assigned to the mode that best proves the contract instead of being duplicated across controlled and uncontrolled pages.

### Controlled resources and cells

- Editing title, text, number, link, checkbox, select, and date cells updates both the visible cell and parent-owned data.
- Clearing an existing value and filling an empty cell preserve the correct value shape.
- Adding, duplicating, and deleting a row update the callback action, parent count, and rendered rows consistently.
- Adding, renaming, hiding, deleting, restoring, and configuring properties update the parent properties and table UI consistently.
- Layout, lock, row-view, and opened-row changes update parent-owned view state. Sorting, grouping, and calculating are verified through rendered results and may be inspected through the separately labelled internal-state diagnostic; they are not represented as parent-controlled state.
- Parent reset restores all three controlled resources and the rendered table.

### Uncontrolled state

- Defaults initialize the table without parent write-back.
- Consecutive data and view changes persist internally across menu and layout changes.
- Table, list, and board layouts retain the same data changes.
- Row views open the correct row, navigate within boundaries, and close consistently.
- Lock prevents mutation and unlock restores it.
- Reload returns to defaults, explicitly documenting the absence of persistence.

### Sorting

- Single-column ascending and descending rules produce the complete expected row order, including empty-value placement.
- Multi-column sorting honors precedence; removing a secondary rule or all rules produces the expected order.
- Editing a sorted value immediately repositions its row.
- Sorting state is internal to the table in the current public API, so tests assert rendered order and the separately labelled internal diagnostic rather than an `onViewChange` action.

### Grouping

- Select and checkbox grouping produce the expected groups, membership, and counts.
- Empty values enter the correct empty group; hiding empty groups changes the rendered result.
- Hiding/showing one group, hiding/showing all groups, and removing grouping change actual rendered rows.
- Board layout preserves the correct group-to-card relationship.
- Grouping state is internal to the table in the current public API, so tests assert rendered membership and the separately labelled internal diagnostic rather than parent-owned view state.

### Calculating

- General columns exercise count all, count values, unique, empty/non-empty, and percentage behavior.
- Checkbox columns exercise checked, unchecked, and percentage behavior.
- Editing, clearing, adding, and deleting rows immediately recompute footer results.
- E2E uses representative combinations that prove integration; unit tests exhaustively cover every calculation method and zero-row boundary.

### Table header and property actions

- Plugin configuration changes number format/rounding, select options, date format, and visible cell behavior.
- Changing a property type updates its icon, editor, data representation, and controlled parent state; title remains immutable.
- Sort, group, and calculate actions assert data results, not menu selection alone.
- Freeze/unfreeze keeps the intended columns pinned during horizontal scrolling.
- Hide removes a property and restore makes it visible again.
- Wrap/unwrap changes the property state and visible wrapping behavior.
- Insert left/right creates a property at the correct adjacent position.
- Duplicate/delete/restore preserve the correct property and cell data.
- Locked tables disable header mutation, resize, and reorder behavior.
- Real pointer interactions verify header reorder and resize.

### Row and group actions

- Add row inserts below; Option-click inserts above.
- Edit icon supports choosing, removing, and uploading an icon, with controlled data synchronization.
- Open uses the configured row view; navigation respects first/last boundaries.
- Open in new tab creates the expected `getRowUrl` target.
- Copy link writes the complete row URL to the clipboard.
- Duplicate creates a new ID while preserving content and insertion position.
- Delete removes only the target row.
- Search filters real actions and clears back to the full action set.
- Duplicate, delete, and open-in-new-tab keyboard shortcuts produce their real outcomes.
- Real pointer interaction verifies row reorder and parent synchronization.
- Group actions add into the selected group, toggle group visibility and aggregation, and delete group rows only after confirmation.
- Locked tables expose no mutation actions.

Unimplemented actions that do not exist in the UI, including Edit property, Move to, and Comment, are not represented by artificial tests.

## Unit Test Audit and Coverage Strategy

Every existing test receives one classification with a written reason:

- **Keep**: catches a real bug, guards a regression/non-obvious contract, or validates real component interaction.
- **Rewrite**: has a valuable target but currently asserts only superficial presence or invocation.
- **Merge**: duplicates setup and behavior already proven by a stronger test.
- **Remove**: can pass when the meaningful behavior is broken or is fully subsumed by another test.
- **Add**: covers an uncovered, production-relevant risk or boundary.

The audit specifically challenges `*_Open_Shows*` tests, fragmented heading/input/label checks, callback-only assertions, and repeated menu smoke tests. Accessibility-semantic tests remain only where the semantic contract is itself meaningful.

New or strengthened unit/component tests prioritize:

- date, number, link, title, checkbox, and select parsing/formatting, including empty and invalid values;
- zero rows, empty values, unique values, percentages, and live recalculation;
- sorting and grouping boundary behavior;
- header, row, and group action guards and functional updaters;
- reducer and pure utility tables of edge cases;
- row-view first/last navigation and mode transitions;
- layout reactivity and locked-state behavior;
- state transitions underlying drag-and-drop where jsdom cannot provide a reliable pointer journey.

Vitest coverage includes all `packages/table-view/src/**/*.{ts,tsx}` runtime code. Exclusions are limited to tests, test helpers, pure type declarations, and barrel modules without executable logic. Difficult components and branches are not excluded. Unreachable or dead product branches are corrected or removed rather than ignored.

The final Vitest configuration reports text, JSON, and HTML and fails globally below:

- statements: 90%;
- branches: 90%.

Functions and lines remain visible diagnostic metrics without gates.

## Independent E2E Coverage

Each Playwright test starts and stops Chromium V8 JavaScript coverage in a fixture that always flushes results, including failure paths. Worker-safe raw reports are merged after the run.

`@notion-kit/table-view` emits source maps for its built output. Next.js serves browser source maps so V8 bundle ranges can be remapped to `packages/table-view/src` and filtered to that package.

The E2E coverage command produces independent text, JSON, and HTML reports. It neither merges with Vitest nor enforces a percentage. Its purpose is to show which production browser code the high-value journeys exercise and to expose suspicious gaps for review.

## Failure Diagnosis

- A missing locator triggers inspection of the accessibility tree, rendered state, and component logic before changing the locator.
- Tests do not add arbitrary timeouts or brittle CSS selectors to conceal state bugs.
- An action whose UI and controlled parent state disagree is treated as a product bug, not patched in the fixture.
- A discovered product bug receives a failing regression test before the implementation fix.
- E2E exercises real pointer behavior where browser semantics matter; unit tests validate deterministic state transitions where browser simulation would be artificial.
- Coverage gaps result in risk analysis. Tests are added only when the missing path represents a meaningful contract.

## Verification Gates

Completion requires all of the following evidence:

1. Both Next.js pages render the built table-view package and satisfy their controlled/uncontrolled contracts.
2. Chromium Playwright journeys pass for every domain listed in this design.
3. Independent E2E coverage produces valid text, JSON, and HTML reports mapped to table-view source.
4. The existing unit test audit is complete and every rewritten/removed test has a documented value-based reason.
5. All table-view Vitest tests pass with global statements and branches each at or above 90%.
6. Relevant package and app typechecking and linting pass.
7. A final requirement-by-requirement audit confirms that no approved journey or coverage gate is missing.

## Out of Scope

- Firefox and WebKit execution;
- merging Playwright and Vitest coverage;
- an E2E percentage threshold;
- persistence across reloads for the uncontrolled fixture;
- artificial tests for UI actions that are not implemented.
