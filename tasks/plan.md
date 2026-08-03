# Implementation Plan: Timeline Row Compound Interactions

## Overview

Refactor Timeline rows into compound components while correcting selected-range
feedback, sidebar-aware jump positioning, whole-card dragging/clicking, and row
action context menus. Work proceeds in vertical red-green-refactor slices so
each test guards a production regression rather than an implementation detail.

## Architecture Decisions

- `TimelineRow.Root` owns the row-local state/actions/meta context and the only
  row `DragDropProvider`.
- `TimelineRow.Item` is the single card surface. It is draggable when the Root
  receives `onMove`; otherwise it remains click-only.
- `TimelineRow.Jump`, `Track`, and `Resize` consume shared context and are
  explicitly composed as children.
- Table View owns row opening and row-action composition. It wraps an unlocked
  `TimelineRow.Item` with the Base UI `ContextMenuTrigger` render API.
- Touched `data-slot="notion-*"` attributes migrate to `data-notion-slot`, and
  functional selectors use new `data-slot="timeline-*"` values.

## Testing Strategy

### Tests that earn their place

1. **Range selection feedback:** a real Select integration test verifies the
   selected option contains its visible check indicator. Removing the consumer
   configuration that hides the indicator makes the test pass.
2. **Jump positioning:** a real `TimelineProvider` test verifies a known
   feature scrolls to a hand-derived item offset minus the controlled sidebar
   width. Using the raw item offset makes it fail.
3. **Whole-card gestures:** existing Timeline drag tests target the card
   surface and continue asserting the exact committed Date range, cancellation,
   and controlled rollback. A separate drag-handle existence test is not added;
   the inability to perform the tested drag from the card catches the bug.
4. **Click/drag boundary:** Table View integration clicks the card surface and
   observes the row-view resource action, while the existing activated-drag
   journey observes a Date update and no row opening.
5. **Context menu integration:** right-clicking an unlocked real card exposes
   the matching existing `RowActionMenu`; selecting a representative action
   proves that the trigger targets the correct row rather than merely asserting
   that a popup node exists.
6. **Locked boundary:** the existing locked integration test remains the main
   contract. It verifies click opening and the absence of mutation controls,
   and is extended only to ensure right click does not expose row actions.

### Deliberate non-tests

- No tests assert compound object keys or component implementation structure;
  TypeScript consumer compilation and behavior tests cover the public API.
- No new test exists solely for class names, cursor styles, padding, or removal
  of the visual drag-handle icon.
- No dedicated test asserts `data-notion-slot`. Existing functional selectors
  migrate to the new Timeline slots, and a final static scan checks that no
  touched `notion-*` value remains in `data-slot`.
- Registry/docs examples receive type/build/format verification rather than
  duplicated interaction tests.
- No new browser test duplicates jsdom coverage unless real pointer or popup
  behavior cannot be validated reliably in the existing integration harness.

## Dependency Graph

```text
Range/jump regression fixes (independent)

TimelineRow context and compound API
    ├── UI gesture behavior and existing consumer migration
    ├── Table View click/context-menu/locked composition
    └── Registry, docs, and E2E locator migration
            └── focused and full verification
```

## Task List

### Phase 1: Independent regressions

## Task 1: Restore selected-range feedback

**Description:** Add one real-component regression test for the selected check
indicator, observe the expected failure, and remove the Timeline-specific
configuration that hides it.

**Acceptance criteria:**

- [ ] The active range option visibly renders the Select item indicator.
- [ ] Range changes and null filtering retain their current behavior.
- [ ] The test would fail if Timeline again passes `hideCheck`.

**Verification:**

- [ ] Focused UI or Table View test fails before and passes after the fix.
- [ ] No assertion targets a mocked Select implementation.

**Dependencies:** None

**Files likely touched:**

- `packages/ui/src/timeline/tools/timeline-range-select.tsx`
- `packages/table-view/src/timeline-view/timeline-view-content.test.tsx` or a
  focused real-primitive UI test

**Estimated scope:** Small

## Task 2: Position jump targets after the sidebar

**Description:** Extend the real provider test with a non-clamped feature
offset and controlled sidebar width, observe the wrong scroll target, then
include the sidebar width in `scrollToFeature`.

**Acceptance criteria:**

- [ ] Feature start lands at the sidebar's inline end.
- [ ] A zero-sidebar layout still aligns to the viewport start.
- [ ] The target remains clamped at zero.

**Verification:**

- [ ] `packages/ui/src/timeline/__tests__/timeline-provider.test.tsx` fails on
  the old target and passes after the fix.

**Dependencies:** None

**Files likely touched:**

- `packages/ui/src/timeline/timeline-provider.tsx`
- `packages/ui/src/timeline/__tests__/timeline-provider.test.tsx`

**Estimated scope:** Small

### Checkpoint: Independent regressions

- [ ] Focused UI tests pass under Node 24.11.1 and pnpm 11.0.8.
- [ ] No unrelated Timeline behavior changed.

### Phase 2: Compound row and gestures

## Task 3: Introduce the TimelineRow compound state boundary

**Description:** Convert the existing item geometry and gesture lifecycle into
a Root context with `state`, `actions`, and `meta`, then expose Root, Jump,
Track, Item, and Resize components. Update UI tests through the new public
composition while preserving exact width, coordinate, cancellation, and
controlled replacement behavior.

**Acceptance criteria:**

- [ ] Root is the row's only drag provider; Item and Resize share it.
- [ ] Item registers its whole surface as the drag source when movable.
- [ ] Children replace the old item-content render callback.
- [ ] Existing Date geometry and gesture lifecycle behavior remains green.

**Verification:**

- [ ] Relevant UI tests are migrated before production API changes and show
  the expected red state against the old API.
- [ ] Focused UI Timeline suite passes after the refactor.
- [ ] `@notion-kit/ui` typecheck passes.

**Dependencies:** Tasks 1-2

**Files likely touched:**

- `packages/ui/src/timeline/timeline-row/timeline-item.tsx`
- `packages/ui/src/timeline/timeline-row/timeline-row.tsx`
- `packages/ui/src/timeline/timeline-row/timeline-item-resizer.tsx`
- `packages/ui/src/timeline/timeline-row/index.ts`
- `packages/ui/src/timeline/__tests__/timeline-components.test.tsx`

**Estimated scope:** Medium

## Task 4: Compose Table View card interactions

**Description:** Add high-value Table View regressions for card-surface row
opening, unlocked row actions, exact card dragging, and locked click-only
behavior. Then compose the compound Timeline row with the existing context menu
and row action menu.

**Acceptance criteria:**

- [ ] Clicking anywhere on the unlocked or locked card opens the configured
  row view.
- [ ] Dragging the unlocked card commits one exact Date update and does not
  open the row.
- [ ] Right-clicking an unlocked card targets that row's action menu.
- [ ] Locked cards expose neither move/resize nor row actions.

**Verification:**

- [ ] Each new/changed regression is observed failing for the intended reason
  before production edits.
- [ ] Focused Table View content and DnD interaction suites pass.

**Dependencies:** Task 3

**Files likely touched:**

- `packages/table-view/src/timeline-view/timeline-track-row.tsx`
- `packages/table-view/src/timeline-view/timeline-view-content.test.tsx`
- `packages/table-view/src/timeline-view/timeline-dnd-interactions.test.tsx`
- `packages/table-view/src/menus/row-action-menu.tsx` only if composition
  reveals a real focus/selection boundary

**Estimated scope:** Medium

### Checkpoint: Core interactions

- [ ] UI Timeline tests pass.
- [ ] Table View Timeline tests pass.
- [ ] UI and Table View typechecks pass.
- [ ] Mutation check confirms wrong sidebar arithmetic, title-only click,
  handle-only drag, wrong row ID, and locked menu exposure are caught.

### Phase 3: Consumer and slot migration

## Task 5: Migrate public consumers and Timeline slots

**Description:** Move compatibility notion slots to `data-notion-slot`, add the
new Timeline slots, and update registry examples, docs snippets, test selectors,
and E2E locators to the compound API. This is a mechanical migration verified
by compilation and existing journeys, not new style tests.

**Acceptance criteria:**

- [ ] No touched Timeline element keeps a `notion-*` value in `data-slot`.
- [ ] All first-party `TimelineRow` consumers use the compound API.
- [ ] Functional tests and locators use `data-slot="timeline-*"`.
- [ ] Docs and registry examples present the supported API only.

**Verification:**

- [ ] Static `rg` scan finds no scoped `data-slot="notion-*"` occurrence.
- [ ] Registry/docs builds or typechecks catch invalid compound usage.
- [ ] Existing Timeline browser journey uses the card locator rather than a
  removed move handle.

**Dependencies:** Tasks 3-4

**Files likely touched:**

- `packages/registry/src/timeline-with-sidebar/timeline-with-sidebar.tsx`
- `packages/registry/src/timeline-without-sidebar/timeline-without-sidebar.tsx`
- `apps/docs/content/docs/blocks/timeline.mdx`
- `apps/e2e/tests/component-objects/table-view.ts`
- Existing Timeline tests/selectors in UI and Table View

**Estimated scope:** Medium

## Task 6: Run proportionate final verification

**Description:** Format touched files, run focused suites first, then package
tests/typechecks/lint/build and the relevant Timeline browser journey. Diagnose
any failure before changing implementation strategy.

**Acceptance criteria:**

- [ ] All accepted behavior is green with no warnings introduced.
- [ ] No unrelated user changes are overwritten.
- [ ] Final diff contains no stale API usage or invalid slot names.

**Verification:**

- [ ] Focused UI and Table View Timeline tests.
- [ ] `@notion-kit/ui` and `@notion-kit/table-view` tests/typechecks/lint/build.
- [ ] Relevant E2E Timeline journey(s), especially whole-card drag.
- [ ] Root affected test/typecheck/lint when package-level checks are green.

**Dependencies:** Tasks 1-5

**Files likely touched:** None beyond fixes demanded by verification

**Estimated scope:** Small

### Checkpoint: Complete

- [ ] All acceptance criteria from the design are met.
- [ ] Tests protect behavior rather than styles or private structure.
- [ ] The implementation is ready for review.

## Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| One provider changes resizer routing | High | Preserve exact existing lifecycle tests and route by explicit source type. |
| Context menu and pointer drag compete | High | Keep activation threshold; integration-test right click and activated drag separately. |
| Tests assert mocks or framework mechanics | Medium | Prefer real provider/Table View surfaces; assert resource actions and visible row actions. |
| Public API migration misses a consumer | Medium | `rg` all `TimelineRow` uses and run typechecks/builds. |
| Slot migration becomes a style test | Low | Reuse slots in functional selectors and use one final static scan, not a dedicated test. |

## Open Questions

None. The behavior and locked boundary are approved.
