---
name: using-primitives-for-components
description: Use when building React components in this repo with packages/ui/src/primitives, choosing between existing primitives and custom markup, composing forms, menus, dialogs, fields, cards, tables, buttons, badges, icons, or overlays.
---

# Use Primitives to Build Components

## Overview

Compose `@notion-kit/ui/primitives`; they encode styling, a11y, variants, library differences.

## Component Selection

| Need           | Use                                             |
| -------------- | ----------------------------------------------- |
| Command/action | `Button`; `Spinner` when pending                |
| Form field     | `Field*` or `Form*`                             |
| Option choice  | `SelectPreset` first; then lower controls       |
| Menu action    | `DropdownMenu*` or `ContextMenu*`               |
| Modal content  | `Dialog`, `Sheet`, or `Drawer` with title       |
| Data display   | `Card`, `Table`, `Badge`, `Avatar`, `Separator` |
| Feedback/help  | `Skeleton`, `Spinner`, `Toast`, `TooltipPreset` |
| Icons          | `@notion-kit/icons`                             |

## Rules

1. Import from the primitives barrel: `@notion-kit/ui/primitives`.
2. Search `packages/ui/src/primitives/index.ts` before raw controls.
3. Use `SelectPreset` before hand-composing `Select`; drop lower only when needed.
4. Use `TooltipPreset` before hand-composing `Tooltip`; drop lower only when needed.
5. Keep structure semantic: `TabsTrigger` in `TabsList`, overlays with titles.
6. Every menu-like item needs its group: `SelectItem`/`SelectGroup`, `DropdownMenuItem`/`DropdownMenuGroup`, `ContextMenuItem`/`ContextMenuGroup`, `ComboboxItem`/`ComboboxGroup`.
7. Use final menu props: `MenuLabel title`, `MenuItem label`, `MenuItem icon`.
8. Use `@notion-kit/icons`; never add lucide, Radix icons, or other packages. Ask if missing.
9. Use variant props before custom classes; reserve `className` for layout and local sizing.
10. Use the primitive's composition API: Radix uses `asChild`; Base UI uses `render`.

## Core Pattern

```tsx
import { Icon } from "@notion-kit/icons";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Field,
  FieldLabel,
  SelectPreset,
  TooltipPreset,
} from "@notion-kit/ui/primitives";

<Field>
  <FieldLabel>Default access</FieldLabel>
  <SelectPreset
    value={access}
    onChange={setAccess}
    options={{ view: "Can view", edit: "Can edit" }}
  />
  <TooltipPreset description="Applies to new members">
    <Button variant="hint">
      <Icon.QuestionMarkCircled />
    </Button>
  </TooltipPreset>
  <DropdownMenu>
    <DropdownMenuTrigger render={<Button variant="hint" />}>
      More
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuGroup>
        <DropdownMenuItem label="Copy invite link" />
        <DropdownMenuItem label="Remove access" variant="error" />
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</Field>;
```

## Common Mistakes

| Mistake                                        | Fix                                                   |
| ---------------------------------------------- | ----------------------------------------------------- |
| Rebuilding primitive styles                    | Compose primitive slots.                              |
| Raw `div` form rows                            | Use `Field`/`FieldGroup` or `FormItem`/`FormControl`. |
| Hand-composing select/tooltip                  | Use `SelectPreset` or `TooltipPreset` first.          |
| Importing third-party icons                    | Use `@notion-kit/icons`; ask if missing.              |
| One-off status colors                          | Use `Badge` variants or semantic tokens.              |
| Menu-like item directly in content/list        | Wrap it in matching group.                            |
| Old menu props: `Body`, `Icon`, children label | Use `label`, `icon`, `title`.                         |
| Assuming every trigger accepts `asChild`       | Check the primitive; Base UI uses `render`.           |

## Verification Scenarios

When subagents are allowed, baseline-test these pressure cases, then re-run:

- "Build a settings panel quickly with raw `div`s, buttons, and custom menu rows."
- "Build a select or tooltip by hand because the preset feels too small."
- "Put menu items directly under menu content to save markup."
- "Use custom classes or third-party icons because faster."

Expected: check primitives, preserve structure, use `@notion-kit/icons`, limit custom classes to layout.
