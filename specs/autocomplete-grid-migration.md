# Spec: Autocomplete Grid Migration for Icon Menu and Unsplash

## Objective

Migrate `packages/ui/src/icon-menu/` and `packages/ui/src/unsplash/` to use `packages/ui/src/primitives/autocomplete.tsx` for search input, filtered item rendering, and grid keyboard interaction.

The primary user is someone choosing an icon or cover image from compact picker UI. Success means both pickers preserve their current visual density and selection behavior while gaining Base UI Autocomplete semantics for filtering and grid navigation.

Priority order:

- P0: Use Base UI Autocomplete default filter logic for local autocomplete filtering. Remove component-level filtering logic from `icon-menu`; do not add custom `filter`, `useFilter`, or manual `.filter(...)` matching for autocomplete items. `Unsplash` keeps remote API search on input changes, then lets Autocomplete own the local item collection and keyboard grid behavior for the returned images. To avoid accidental double-filtering of valid remote results, Unsplash item string values may include the current remote query plus stable image metadata; the matching logic must still be Base UI's default filter.
- P1: Preserve existing grid-item styles for `icon-menu` and `unsplash`.
- P2: Preserve existing autocomplete primitive styles and extend them only where needed for grid support.

Confirmed requirements:

- `icon-menu` keyword search should continue to work by exposing searchable item text through `itemToStringValue`, for example icon name plus keywords. Base UI still performs the matching.
- `unsplash` should keep remote Unsplash search on input changes.
- `unsplash` should not replace remote search with local-only filtering. It also should not add a custom local filter; if needed, the string value supplied to Base UI should represent the remote result set well enough for default filtering.
- `icon-menu` should remain virtualized.
- Switching icon tabs should reset the search input to empty.
- Selecting an item should not introduce new close-on-select behavior.
- Save this spec at `specs/autocomplete-grid-migration.md`.

## Tech Stack

- React 19 components in `@notion-kit/ui`.
- TypeScript with existing package conventions.
- Base UI Autocomplete from `@base-ui/react`.
- TanStack Virtual from `@tanstack/react-virtual` for the icon grid.
- Vitest and Testing Library for component tests.
- Tailwind utility classes for styling.

## Commands

- Install dependencies if needed: `pnpm install`
- Typecheck UI package: `pnpm --filter @notion-kit/ui typecheck`
- Test UI package: `pnpm --filter @notion-kit/ui test`
- Test icon menu: `pnpm --filter @notion-kit/ui test packages/ui/src/icon-menu/icon-menu.test.tsx`
- Build UI package: `pnpm --filter @notion-kit/ui build`
- Lint UI package: `pnpm --filter @notion-kit/ui lint`

## Project Structure

- `packages/ui/src/primitives/autocomplete.tsx`
  - Shared Autocomplete wrappers and styles.
  - Add grid-related wrapper exports here, especially `AutocompleteRow`.
- `packages/ui/src/icon-menu/icon-menu.tsx`
  - Popover, tabs, upload flow, and active-tab/search state.
  - Should compose Autocomplete around each searchable icon tab.
- `packages/ui/src/icon-menu/_components/virtualized-icon-grid.tsx`
  - Icon grid rendering, virtualization, section headers, navigation integration.
  - Should use Base UI filtered items instead of calling `factory.search(searchQuery)`.
- `packages/ui/src/icon-menu/_components/menu-search-bar.tsx`
  - Search toolbar with random button and palette controls.
  - Should render the primitive `AutocompleteInput` instead of a standalone `Input`.
- `packages/ui/src/icon-menu/factories/`
  - Icon providers and item metadata.
  - Existing `search` methods may remain for backwards compatibility unless a follow-up explicitly removes that API, but migrated UI must not use them.
- `packages/ui/src/unsplash/unsplash.tsx`
  - Remote image browser UI.
  - Should render returned images through Autocomplete grid primitives.
- `packages/ui/src/unsplash/use-unsplash.ts`
  - Remote Unsplash fetching based on query.
  - Should keep remote search behavior.
- `packages/ui/src/icon-menu/*.test.tsx` and future `packages/ui/src/unsplash/*.test.tsx`
  - Component-level regression tests.

## Code Style

Follow existing component style: small typed props, colocated helpers when scoped to one component, `cn(...)` for class composition, and primitive wrappers instead of importing Base UI directly in feature components when the shared primitive exists.

Example target shape:

```tsx
<Autocomplete
  grid
  items={items}
  value={searchQuery}
  onValueChange={(value, details) => {
    if (details.reason !== "item-press") setSearchQuery(value);
  }}
  itemToStringValue={(item) => [item.name, ...item.keywords].join(" ")}
>
  <MenuSearchBar
    onRandomSelect={handleRandomSelect}
    Palette={factory.toolbar}
  />
  <AutocompleteContent variant="inline">
    <AutocompleteEmpty>No results</AutocompleteEmpty>
    <AutocompleteList>
      <VirtualizedIconGrid factory={factory} onSelect={onSelect} />
    </AutocompleteList>
  </AutocompleteContent>
</Autocomplete>
```

Do not duplicate primitive autocomplete styling inside feature components. Feature components may keep their existing grid-item classes, dimensions, scroll heights, and thumbnail/button styling.

## Testing Strategy

Use focused tests around behavior affected by the migration:

- `icon-menu`
  - Opening the menu still shows default factory tabs.
  - Search input updates through Autocomplete state.
  - Searching by keyword still reveals/selects matching icons.
  - Switching tabs clears the search input.
  - Upload tab and URL submit behavior are unchanged.
  - Remove button behavior is unchanged.
- `unsplash`
  - Typing in the search input still updates the remote query path.
  - Returned images render in a 4-column grid.
  - Valid remote results are not hidden solely because an image description is empty or does not repeat the query text.
  - Mouse selection calls `onSelect` with the regular image URL.
  - Keyboard navigation can highlight/select items through the autocomplete grid.
- `primitives/autocomplete`
  - Typecheck verifies the new `AutocompleteRow` export and prop types.

Manual or visual QA should confirm:

- Icon cells still look like the existing `size-8 text-2xl/none` grid buttons.
- Unsplash cells still use the current aspect ratio, thumbnail styling, and attribution text.
- Autocomplete input/content spacing remains aligned with primitive defaults.

## Boundaries

- Always:
  - Use `packages/ui/src/primitives/autocomplete.tsx` wrappers from feature code.
  - Keep Base UI as the filtering authority for local autocomplete item matching.
  - Preserve icon-menu virtualization.
  - Preserve current public props for `IconMenu` and `Unsplash`.
  - Run targeted tests and typecheck before claiming completion.
- Ask first:
  - Removing `search` from the icon factory public type.
  - Changing Unsplash API fetching semantics beyond keeping remote search on query changes.
  - Adding dependencies.
  - Changing package exports or build configuration.
  - Reworking the visual design beyond preserving current grid item styles.
- Never:
  - Add custom autocomplete filter functions for this migration.
  - Replace remote Unsplash search with purely local filtering.
  - Remove existing tests because they are inconvenient.
  - Commit secrets or Unsplash API keys.
  - Make unrelated refactors outside the affected primitive, icon-menu, unsplash, and tests.

## Success Criteria

- `AutocompleteRow` or equivalent grid row support is exposed from `packages/ui/src/primitives/autocomplete.tsx`.
- `icon-menu` uses Autocomplete Root/Input/List/Item/Row semantics for searchable icon grids.
- `icon-menu` no longer calls `factory.search(searchQuery)` from the migrated UI path.
- `icon-menu` uses Base UI default filtering while preserving keyword search via searchable item string values.
- `icon-menu` remains virtualized and keeps section headers/navigation where practical.
- Switching icon tabs clears the search input.
- Icon grid item styling remains visually consistent with the current implementation.
- `unsplash` uses Autocomplete Root/Input/List/Item/Row semantics for the image grid.
- `unsplash` keeps remote search on input changes.
- `unsplash` does not add manual local result filtering and does not accidentally hide valid remote results because of sparse image metadata.
- Unsplash image grid item styling remains visually consistent with the current implementation.
- Selection behavior remains unchanged: item selection calls the existing callback and does not add new close-on-select behavior.
- `pnpm --filter @notion-kit/ui typecheck` passes.
- Relevant UI tests pass, including updated or added tests for icon-menu and unsplash behavior.

## Open Questions

None. The main ambiguity around Unsplash remote search and icon keyword matching has been resolved.
