# Timeline Rendering Fixes

## Scope

Fix three timeline regressions without changing the timeline interaction model:

1. Clearing a row's selected timeline date from row view immediately removes its timeline item and jump control.
2. Timeline sidebar rows and timeline item cards render titles through the existing title-cell contract, including the `showIcon` setting.
3. The timeline sidebar header remains at the top while the shared timeline viewport scrolls vertically.

The change will not add new automated tests, per the requested scope.

## Design

### Live timeline projection

The timeline projection must be derived from the current row cell resource on every table data update. When the selected date cell has no valid start date, the row renders only its empty track. The item root, jump control, card, and resize controls must not remain mounted.

### Title rendering

Add timeline handling to the existing title-cell renderer and use the shared `TableCell` rendering path in both timeline title surfaces. The surrounding timeline components remain responsible for their button behavior, sizing, truncation, and typography. The title renderer remains responsible for the row icon and title content, so `showIcon: false` continues to hide the icon.

### Sticky sidebar header

Keep the sidebar rows aligned with the shared vertical timeline scroll. Move only the sticky header outside the layout-containment boundary that currently prevents it from tracking the outer scroll container. Do not introduce a second vertical scrolling model.

## Verification

Run the existing focused timeline test suites and the relevant package type-check/build command. Inspect the rendered structure to confirm that:

- an empty date row has no jump control;
- both title surfaces use the title-cell output;
- the sticky header is outside the containment wrapper and retains `top: 0` with an opaque background and sufficient stacking order.
