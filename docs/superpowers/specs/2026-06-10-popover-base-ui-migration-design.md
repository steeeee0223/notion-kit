# Popover Base UI Migration Design

## Goal

Migrate `packages/ui/src/primitives/popover.tsx` from Radix UI to Base UI while updating popover consumers to Base UI trigger composition.

This migration is scoped to the popover primitive only. It should not migrate unrelated Radix primitives. Popover call sites should use Base UI `render` instead of Radix child composition props.

## Current State

`popover.tsx` currently wraps Radix `Popover.Root`, `Trigger`, `Close`, `Portal`, `Content`, and `Anchor`.

Internal consumers rely heavily on:

- `PopoverTrigger render`
- `PopoverContent` positioning props such as `side`, `align`, `sideOffset`, `collisionPadding`, and `sticky`
- `PopoverClose` rendering the existing close button shape
- controlled and uncontrolled `Popover` roots

The repo has no internal `PopoverAnchor` call sites. Base UI `@base-ui/react@1.5.0` also does not expose a popover anchor part, so this migration will remove `PopoverAnchor` from the primitive and from the export list.

## Architecture

The migrated primitive will import:

```tsx
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
```

The wrapper will keep these exports:

- `Popover`
- `PopoverTrigger`
- `PopoverClose`
- `PopoverContent`

`PopoverAnchor` will be removed.

`PopoverContent` will map the old Radix-style wrapper shape onto Base UI's split positioning model:

```tsx
<PopoverPrimitive.Portal container={container}>
  <PopoverPrimitive.Positioner {...positioningProps}>
    <PopoverPrimitive.Popup {...popupProps} />
  </PopoverPrimitive.Positioner>
</PopoverPrimitive.Portal>
```

## Component Design

`Popover` will wrap `PopoverPrimitive.Root`, preserve `data-slot="popover"`, and expose `PopoverPrimitive.Root.Props`.

`PopoverTrigger` will wrap `PopoverPrimitive.Trigger`, preserve `data-slot="popover-trigger"`, and support Base UI props. Trigger composition uses Base UI's `render` prop.

`PopoverClose` will wrap `PopoverPrimitive.Close` and render the existing close `Button` with the existing close icon. The Radix child-composition usage will become Base UI `render={<Button ... />}`.

`PopoverContent` will accept popup props plus selected positioning props. Positioning props will be passed to `PopoverPrimitive.Positioner`; visual classes, children, refs, event handlers, and focus props will be passed to `PopoverPrimitive.Popup`. The default visual class list will remain:

```tsx
"w-72 p-0 outline-hidden";
contentVariants({ variant: "popover", sideAnimation: true });
```

The old Radix pointer-events workaround in `onCloseAutoFocus` will be removed. Base UI uses `finalFocus` for close focus behavior, so the wrapper will default `finalFocus={false}` unless a caller provides `finalFocus`.

## Compatibility

`render` is the trigger composition path. Existing consumers such as table cells, code block controls, icon menus, and docs snippets should render their trigger element via `render`.

`PopoverContent` will keep accepting:

- `container`
- `align`
- `alignOffset`
- `side`
- `sideOffset`
- `collisionPadding`
- `collisionBoundary`
- `sticky`
- `positionMethod`
- `anchor`

Radix accepted `sticky="always" | "partial"`. Base UI accepts a boolean. The wrapper will translate any truthy string value to `sticky={true}`. This preserves the one internal `sticky="always"` call site.

`PopoverAnchor` is intentionally removed. Because there are no internal call sites, this is a controlled API cleanup rather than a repo-wide behavior change.

## Data Attributes And Styling

Base UI popup emits `data-open`, `data-closed`, `data-side`, and `data-align`. Existing shared `contentVariants` already includes Base UI open and closed selectors, plus side animation selectors compatible with `data-side`.

The migration should not add Radix-only selectors. Existing deprecated Radix selectors in `contentVariants` can remain because they are shared with primitives that have not yet migrated, but `popover.tsx` should not introduce new Radix data-state selectors.

## Error Handling

If callers need custom trigger elements, they should pass the element through `render`.

## Testing

Add focused tests for the popover primitive:

- `PopoverTrigger render` renders the provided element as the trigger and opens the popup.
- Controlled `open` and `onOpenChange` work.
- `PopoverClose` closes the popup and keeps the close button accessible label.
- `PopoverContent` forwards positioning props to the Base UI positioner.
- `sticky="always"` is accepted and behaves as enabled sticky positioning.

Run the existing unit tests for packages most affected by the primitive:

- `pnpm --filter @notion-kit/ui test`
- `pnpm --filter @notion-kit/table-view test`

Before changing `popover.tsx`, run the table-view suite once and record the baseline. As of 2026-06-11, the baseline table-view suite has one existing failure in `packages/table-view/src/plugins/select/select-config-menu/select-config-menu.test.tsx` Flow 14 while looking for the `Edit property` menu item. The migration should not introduce additional table-view failures, and the existing failure should either be fixed with root-cause evidence or explicitly carried forward as a known baseline.

Treat the table-view suite as required verification, not optional regression coverage. The popover-sensitive table-view canaries include:

- `packages/table-view/src/plugins/select/select-menu/select-menu.test.tsx`
- `packages/table-view/src/plugins/select/select-config-menu/select-config-menu.test.tsx`
- `packages/table-view/src/menus/table-view-menu.test.tsx`
- `packages/table-view/src/menus/sort-menu.test.tsx`

If the full table-view suite fails, isolate the failing file with Vitest and fix the migration before calling the implementation complete.

Run the package typecheck after implementation to catch export or prop compatibility issues.

## Scope

In scope:

- Migrate `packages/ui/src/primitives/popover.tsx` to Base UI.
- Preserve existing wrapper API for `Popover`, `PopoverTrigger`, `PopoverClose`, and `PopoverContent`.
- Remove `PopoverAnchor`.
- Add or update targeted tests.

Out of scope:

- Migrating unrelated Radix primitives.
- Rewriting all popover consumers to Base UI `render`.
- Refactoring shared `contentVariants`.
- Changing visual design beyond differences required by Base UI behavior.
