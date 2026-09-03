# Implementation Plan: Table-view sticky layout refactor

## Overview

Refactor the table-view rendering tree so the shared outer controls and each
view body's row actions have explicit logical sticky anchors. Preserve the
current layout and behavior while removing negative and locally tuned inline
offsets.

## Architecture decisions

- Keep the change in existing rendering trees; do not introduce a generic
  sticky-gutter component.
- Place the shared controls in `ViewControls`: toolbar at inline-end and active
  and bulk-edit bars at inline-start. Bulk edit remains hidden in board view.
- Use one named row-action gutter and a content-start anchor for table header,
  body, grouped rows, footer, list rows, and timeline sidebar rows.
- Keep pinned columns sticky using the shared content-start anchor.
- Do not add tests. Update current assertions only if DOM ownership changes.

## Task list

### Phase 1: Shared controls shell

#### Task 1: Move bulk editing into the shared controls tree

**Description:** Make `ViewControls` the single host for toolbar, active bar,
and bulk edit bar. Give each control its required logical sticky edge while
preserving the current layout-specific bulk-edit visibility and disabled state.

**Acceptance criteria:**

- [ ] Toolbar is sticky at inline-end in every layout.
- [ ] Active bar and bulk edit bar are sticky at inline-start.
- [ ] Bulk edit is still absent in board view and retains existing locked-view
      behavior elsewhere.

**Verification:**

- [ ] Existing view-controls and bulk-edit tests pass without adding tests.
- [ ] Manual check: controls remain at their intended inline edge while each
      applicable layout is horizontally scrolled.

**Dependencies:** None.

**Files likely touched:**

- `packages/table-view/src/table-contexts/table-view-provider.tsx`
- `packages/table-view/src/tools/view-controls.tsx`
- `packages/table-view/src/tools/toolbar.tsx`
- `packages/table-view/src/tools/active-bar.tsx`
- `packages/table-view/src/common/bulk-edit/bulk-edit-bar.tsx`
- `packages/table-view/src/{table-contexts,list-view,timeline-view}/*.tsx`

**Estimated scope:** Medium.

### Phase 2: Table action gutter and pinned cells

#### Task 2: Give the table rendering tree a shared start gutter

**Description:** Reshape the existing table header, data row, grouped row, and
footer markup so their action/selection area is an explicit start gutter. Use
the adjacent content edge as the one sticky anchor for all start-pinned cells.

**Acceptance criteria:**

- [ ] No table row action or header selection control depends on a negative
      inline offset.
- [ ] Header, body, grouped rows, footer, and start-pinned columns stay
      aligned while horizontally scrolling.
- [ ] Existing selection, drag, hover, and footer behavior is unchanged.

**Verification:**

- [ ] Existing row-action, row-selection, drag, and footer tests pass.
- [ ] Manual check: ordinary and grouped rows with pinned columns retain the
      current visual alignment.

**Dependencies:** Task 1.

**Files likely touched:**

- `packages/table-view/src/table-contexts/table-view-content.tsx`
- `packages/table-view/src/table-header/table-header-row.tsx`
- `packages/table-view/src/table-body/table-row.tsx`
- `packages/table-view/src/table-body/table-grouped-row.tsx`
- `packages/table-view/src/table-footer/table-footer.tsx`

**Estimated scope:** Medium.

### Phase 3: List and timeline sidebar gutters

#### Task 3: Align list and timeline sidebar rows to the common model

**Description:** Reserve action space in list rows and in the timeline
sidebar's sortable rows. Align the timeline sidebar header/title content to
the same content edge without changing sidebar sizing, resizing, or track
layout.

**Acceptance criteria:**

- [ ] List row actions no longer rely on a negative inline offset.
- [ ] Timeline sidebar row actions and title/pinned content share the same
      start anchor.
- [ ] Timeline sidebar width, resize behavior, and row interactions are
      unchanged.

**Verification:**

- [ ] Existing list and timeline tests pass; update only tests affected by an
      intentional DOM ownership change.
- [ ] Manual check: list rows and a horizontally scrolled timeline sidebar
      retain their visual alignment.

**Dependencies:** Task 2.

**Files likely touched:**

- `packages/table-view/src/list-view/list-row.tsx`
- `packages/table-view/src/list-view/list-view-content.tsx`
- `packages/table-view/src/timeline-view/timeline-sidebar.tsx`
- `packages/table-view/src/timeline-view/timeline-view-content.tsx`

**Estimated scope:** Medium.

### Checkpoint: Complete

- [ ] No new tests were added.
- [ ] Existing affected tests, table-view typecheck, and lint pass.
- [ ] Manual visual checks cover table pinned columns, list rows, and timeline
      sidebar rows at horizontal scroll positions.
- [ ] No non-layout behavior changed.

## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| A gutter changes the content width | Medium | Retain existing gutter dimensions and compare the resulting alignment in a browser. |
| Moving bulk edit changes its layout visibility | Medium | Keep its existing layout gate and locked-state input in the shared host. |
| Pinned columns use different local anchors | High | Change header, rows, grouped rows, and footer together and manually check their shared scroll state. |

## Open questions

None.
