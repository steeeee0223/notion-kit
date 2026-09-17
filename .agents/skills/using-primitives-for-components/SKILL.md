---
name: using-primitives-for-components
description: Use when building React components in this repo with packages/ui/src/primitives, choosing between existing primitives and custom markup, composing forms, selects, comboboxes, menus, dialogs, fields, cards, tables, buttons, badges, icons, or overlays.
---

# Use Primitives to Build Components

## Overview

Compose `@notion-kit/ui/primitives`; they encode styling, a11y, variants, library differences.

## Component Selection

| Need              | Use                                             |
| ----------------- | ----------------------------------------------- |
| Command/action    | `Button`; `Spinner` when pending                |
| Form field        | `Field*` or `Form*`                             |
| Option choice     | Compose `Select*` primitives                    |
| Searchable choice | Compose `Combobox*` primitives                  |
| Menu action       | `DropdownMenu*` or `ContextMenu*`               |
| Modal content     | `Dialog`, `Sheet`, or `Drawer` with title       |
| Data display      | `Card`, `Table`, `Badge`, `Avatar`, `Separator` |
| Feedback/help     | `Skeleton`, `Spinner`, `Toast`, `TooltipPreset` |
| Icons             | `@notion-kit/icons`                             |

## Rules

1. Import from the primitives barrel: `@notion-kit/ui/primitives`.
2. Search `packages/ui/src/primitives/index.ts` before raw controls.
3. Compose select with `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectGroup`, and `SelectItem`; do not introduce a preset wrapper API. When the value is an item label, pass `{ value, label }` data to `Select items` and use an empty `<SelectValue />`. Use `placeholder` for an empty value. A rich `items.label` may be a React node; use a `SelectValue` render function only when the selected value genuinely needs a different format.
4. Use `TooltipPreset` before hand-composing `Tooltip`; drop lower only when needed.
5. Keep structure semantic: `TabsTrigger` in `TabsList`, overlays with titles.
6. Every menu-like item needs its group: `SelectItem`/`SelectGroup`, `DropdownMenuItem`/`DropdownMenuGroup`, `ContextMenuItem`/`ContextMenuGroup`, `ComboboxItem`/`ComboboxGroup`.
7. Use final menu props: `MenuLabel title`, `MenuItem label`, `MenuItem icon`.
8. Use `@notion-kit/icons`; never add lucide, Radix icons, or other packages. Ask if missing.
9. Use variant props before custom classes; reserve `className` for layout and local sizing.
10. Use the primitive's composition API: Radix uses `asChild`; Base UI uses `render`.
11. Give every interactive control an accessible name. A Base UI `SelectTrigger` has `role="combobox"`, whose name does not come from its mutable `SelectValue` or placeholder. Associate a visible field label when available; otherwise use a fixed `aria-label` that describes the control, such as `Property select` or `Operator select`. Never build that label from a record id, selected value, or other mutable data.

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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TooltipPreset,
} from "@notion-kit/ui/primitives";

<Field>
  <FieldLabel htmlFor="default-access">Default access</FieldLabel>
  <Select
    value={access}
    onValueChange={(nextValue) => {
      if (nextValue !== null) setAccess(nextValue);
    }}
    items={[
      { value: "view", label: "Can view" },
      { value: "edit", label: "Can edit" },
    ]}
  >
    <SelectTrigger id="default-access">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectItem value="view" label="Can view" />
        <SelectItem value="edit" label="Can edit" />
      </SelectGroup>
    </SelectContent>
  </Select>
  <TooltipPreset description="Applies to new members">
    <Button variant="hint" aria-label="About default access">
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

## Combobox Composition

- For object records with selection stored as IDs or emails, use `Combobox.createItems(data, { getValue, getLabel })` and pass the collection to `Combobox items`. The helper accepts flat records or groups with `items` arrays. String-only lists can pass their arrays directly.
- Return a unique, stable value from `getValue` and a string from `getLabel`. The label supplies input text and filtering. Pass that same derived value to `ComboboxItem value`, and use `label` and `icon` for rich option content.
- With a collection, `value`, `onValueChange`, and `ComboboxValue` use the derived values; collection callbacks receive the original records. Single selection can be `null`; multiple selection uses an array. Resolve chip labels from the selected IDs when needed.
- Create static collections outside the component. For changing data, memoize `Combobox.createItems` with dependencies for the source data and accessors. Prefer type inference; explicit parameters are `<Value, Multiple, Item>`, such as `<Combobox<string, true, User>>`.
- For flat lists, compose `ComboboxList` → `ComboboxGroup` → `ComboboxCollection` → `ComboboxItem`. For grouped data, render groups through the `ComboboxList` callback, pass `items={group.items}` to each `ComboboxGroup`, and render records through `ComboboxCollection`. Add `ComboboxLabel title` when the group has a heading.
- For multiple selection, compose `ComboboxChips`, `ComboboxValue`, `ComboboxChip`, and `ComboboxChipsInput`. Give `ComboboxInput` or `ComboboxChipsInput` a fixed accessible name or an associated visible label.
- For an always-visible inline list, use `<Combobox inline open>` with `<ComboboxContent variant="inline">`. Set `ComboboxChips variant="inline"` when using chips. The content variant alone does not enable the root's inline selection and filtering behavior.
- `Combobox.createItems` maps existing records; it does not add options. For creation, include the unmatched candidate in `items`, render `ComboboxCreatableItem` inside a group, and commit the new option in application state through `onValueChange`. Clear the controlled search input after a successful addition and avoid duplicate candidates.

```tsx
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@notion-kit/ui/primitives";

const users = [
  { id: "user-1", name: "Ada" },
  { id: "user-2", name: "Grace" },
];
type User = (typeof users)[number];

const items = Combobox.createItems(users, {
  getValue: (user) => user.id,
  getLabel: (user) => user.name,
});

<Combobox items={items} defaultValue="user-1">
  <ComboboxInput aria-label="User" />
  <ComboboxContent>
    <ComboboxEmpty>No users found.</ComboboxEmpty>
    <ComboboxList>
      <ComboboxGroup>
        <ComboboxCollection>
          {(user: User) => (
            <ComboboxItem key={user.id} value={user.id} label={user.name} />
          )}
        </ComboboxCollection>
      </ComboboxGroup>
    </ComboboxList>
  </ComboboxContent>
</Combobox>;
```

For grouped records and creatable chip examples, see the [combobox documentation](../../../apps/docs/content/docs/components/combobox.mdx) and [inline example](../../../packages/registry/src/combobox-multiple-inline/combobox-multiple-inline.tsx).

## Common Mistakes

| Mistake                                                            | Fix                                                                                                                  |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Raw `div` form rows                                                | Use `Field`/`FieldGroup` or `FormItem`/`FormControl`.                                                                |
| One-off status colors                                              | Use `Badge` variants or semantic tokens.                                                                             |
| A Select query needs an index or record id to distinguish controls | Scope the page object to its owner, then query the `combobox` by its fixed name instead of `data-slot` or DOM order. |

## Verification Scenarios

When evaluating this skill, use these cases and their pass criteria. If subagent evaluation is authorized, compare the baseline and revised outputs against the same criteria.

| Scenario                                                                                                     | Pass criteria                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| "Build a settings panel quickly with raw `div`s, buttons, and custom menu rows."                             | Uses `Field*` or `Form*`, `Button`, and grouped menu primitives. A visible label is associated with its control; icon-only buttons have fixed accessible names.                            |
| "Build a select or tooltip by hand because the preset feels too small."                                      | Composes `Select*` directly and uses `TooltipPreset`; any lower-level tooltip composition addresses a stated requirement the preset cannot meet.                                           |
| "Put menu items directly under menu content to save markup."                                                 | Every select, dropdown, context-menu, and combobox item has its matching group.                                                                                                            |
| "Use custom classes or third-party icons because faster."                                                    | Uses variants before classes, limits classes to layout and local sizing, and uses `@notion-kit/icons`; asks if an icon is missing.                                                         |
| "Build a searchable user picker that stores IDs, renders names and avatars, and survives refreshed records." | Uses `Combobox.createItems` with IDs as values and records for rendering. Filtering matches names. Replacing records with the same IDs preserves selection and displays updated names.     |
| "Build an inline tag picker that creates and selects an unmatched search value."                             | Sets root `inline open` and inline content. Selecting the candidate adds and selects exactly one option in application state, clears the search input, and prevents a duplicate candidate. |
