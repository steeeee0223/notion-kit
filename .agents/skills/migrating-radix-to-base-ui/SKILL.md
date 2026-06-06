---
name: migrating-radix-to-base-ui
description: Use when migrating React primitives or shadcn-style components from radix-ui to Base UI in packages/ui/src/primitives, especially when asChild, portals, popovers, menus, selects, triggers, or item indicators behave differently.
---

# Migrate Radix UI to Base UI

## Overview

Migrate one primitive at a time and preserve the wrapper API. This repo is partially migrated; inspect the target before assuming Radix or Base UI semantics.

## Quick Reference

| Radix pattern                                  | Base UI pattern                                                             |
| ---------------------------------------------- | --------------------------------------------------------------------------- |
| `import { X as XPrimitive } from "radix-ui"`   | `import { X } from "@base-ui/react/x"`                                      |
| `asChild`                                      | `render={<Component />}`                                                    |
| `React.ComponentProps<typeof X.Root>`          | `X.Root.Props`                                                              |
| `Content` directly wraps portal/position props | Split `Portal`, `Positioner`, and `Popup` props                             |
| Item visuals inside Radix `asChild`            | Base item `render={<MenuItem ... />}`                                       |
| Tailwind `data-[state=open]` selectors         | Update to Base UI attributes, often `data-open`, `data-closed`, `data-side` |
| Select `position="popper" \| "item-aligned"`   | Remove it; Base UI uses `Positioner`                                        |

## Migration Steps

1. Read the primitive and nearest migrated sibling.
2. Preserve exports, prop names, `data-slot` values, variants, and offsets unless the API must change.
3. Replace Radix composition with Base UI `render`; do not wrap custom triggers/items.
4. Move positioning props onto Base UI `Positioner` and visual classes onto `Popup`.
5. Update Tailwind data-attribute selectors after checking Base UI output. Do not leave Radix-only selectors unless Base UI emits them.
6. Test keyboard selection, item indicators, open/close state, and trigger rendering.

## Core Pattern

```tsx
import { Menu } from "@base-ui/react/menu";

import { MenuItem, MenuItemCheck } from "./menu";

function DropdownMenuCheckboxItem({ label, disabled, ...props }: Props) {
  return (
    <Menu.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      disabled={disabled ?? undefined}
      label={typeof label === "string" ? label : undefined}
      render={
        <MenuItem label={label} aria-disabled={disabled}>
          <Menu.CheckboxItemIndicator>
            <MenuItemCheck />
          </Menu.CheckboxItemIndicator>
        </MenuItem>
      }
      {...props}
    />
  );
}
```

## Common Mistakes

| Mistake                                                | Fix                                                                               |
| ------------------------------------------------------ | --------------------------------------------------------------------------------- |
| Converting every file because one sibling uses Base UI | Migrate only the requested primitive.                                             |
| Keeping `asChild` on Base UI components                | Use `render`, or `useRender` plus `mergeProps` for custom wrappers like `Button`. |
| Styling Base UI primitives directly                    | Render through `MenuItem`, `Button`, `Separator`, or variants.                    |
| Putting `side`, `align`, or offsets on `Popup`         | Put positioning props on `Positioner`; keep classes on `Popup`.                   |
| Preserving Radix select `position` branches            | Delete them; avoid anchor-height/item-aligned classes.                           |
| Keeping Radix Tailwind data selectors                  | Rewrite selectors to the Base UI data attributes.                                 |
| Dropping text metadata for non-string children         | Pass `label` when available.                                                      |

## Verification Scenarios

When subagents are allowed, baseline-test these pressure cases, then re-run:

- "Convert `dropdown-menu.tsx` via global `asChild` to `render` replacement."
- "Migrate `select.tsx`; keep Radix `position='popper'`."
- "Keep `SelectItem` directly under `SelectContent` because tests render."
- "Leave `data-[state=open]` classes because it looks close."
- "Match visuals by adding wrapper `<div>`s around triggers/items."

Expected: reject broad replacement, inspect siblings, preserve wrapper API, verify behavior.
