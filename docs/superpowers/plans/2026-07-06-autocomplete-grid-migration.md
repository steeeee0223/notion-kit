# Autocomplete Grid Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate `icon-menu` and `unsplash` picker UIs to the shared autocomplete primitive while preserving existing grid visuals, remote Unsplash search, and icon-menu virtualization.

**Architecture:** Extend the local autocomplete primitive with Base UI grid row support and filtered-item access. Then convert each picker into an inline controlled Autocomplete: `icon-menu` passes flattened icon metadata to Base UI and renders the internally filtered results through a virtualized section grid, while `unsplash` keeps remote query fetching and renders returned images in an autocomplete grid. The migration keeps current public props and selection callbacks unchanged.

**Tech Stack:** React 19, TypeScript, `@base-ui/react` Autocomplete, TanStack Virtual, Vitest, Testing Library, Tailwind utilities.

---

## File Structure

- Modify `packages/ui/src/primitives/autocomplete.tsx`
  - Add `AutocompleteRow`.
  - Export `useAutocompleteFilteredItems` as a local wrapper around Base UI `useFilteredItems`.
  - Preserve all existing primitive class names and exports.
- Modify `packages/ui/src/icon-menu/icon-menu.tsx`
  - Own the controlled autocomplete query per active tab.
  - Build flattened icon item arrays for each visible factory.
  - Pass `grid`, `items`, `itemToStringValue`, `open`, and `inline` to `Autocomplete`.
- Modify `packages/ui/src/icon-menu/_components/menu-search-bar.tsx`
  - Replace standalone `Input` with `AutocompleteInput`.
  - Keep random button and palette layout.
- Modify `packages/ui/src/icon-menu/_components/virtualized-icon-grid.tsx`
  - Replace `factory.search(searchQuery)` with `useAutocompleteFilteredItems`.
  - Preserve section headers, virtualization, navigation, and icon button styling.
  - Render grid rows with `AutocompleteRow` and icon cells with `AutocompleteItem`.
- Modify `packages/ui/src/icon-menu/_components/types.ts`
  - Add the shared flattened icon item type used by `icon-menu.tsx` and `virtualized-icon-grid.tsx`.
- Modify `packages/ui/src/icon-menu/icon-menu.test.tsx`
  - Update tests for autocomplete search behavior and tab reset.
  - Add a focused keyword-search regression.
- Modify `packages/ui/src/__tests__/component-objects/icon-menu.tsx`
  - Add helpers for selecting visible icon results if needed.
- Modify `packages/ui/src/unsplash/unsplash.tsx`
  - Wrap image search UI in Autocomplete.
  - Keep remote search in `useUnsplash`.
  - Render image tiles with `AutocompleteRow` and `AutocompleteItem`.
- Add `packages/ui/src/unsplash/unsplash.test.tsx`
  - Mock `useUnsplash` and verify remote query wiring, rendering, mouse selection, and keyboard selection.

## Implementation Order

1. Extend the primitive with row and filtered-items support.
2. Add/adjust tests that describe desired icon-menu migration behavior.
3. Migrate icon-menu input and virtualized grid to Base UI filtering.
4. Add Unsplash component tests.
5. Migrate Unsplash to Autocomplete grid while preserving remote search.
6. Run package-level typecheck, tests, and build.

## Risks and Mitigations

- Risk: Base UI item selection may update the input to the selected item string, which would look like a behavior regression.
  - Mitigation: In controlled `onValueChange`, ignore item-press changes when necessary and keep selection callbacks separate.
- Risk: Virtualization plus Base UI filtered items can produce wrong indexes for keyboard navigation.
  - Mitigation: Pass the flattened filtered index into each `AutocompleteItem index={...}` and render row wrappers with `AutocompleteRow`.
- Risk: Unsplash remote results can be hidden by local filtering if sparse image metadata does not include the query.
  - Mitigation: Include the current query in each image item string value so default Base UI filtering keeps valid remote results visible without custom filter logic.
- Risk: Current icon factory tests still cover `factory.search`.
  - Mitigation: Leave factory APIs intact unless separately approved; only remove UI use of `factory.search`.

## Verification Checkpoints

- After Task 1: `pnpm --filter @notion-kit/ui typecheck`
- After Task 3: `pnpm --filter @notion-kit/ui test packages/ui/src/icon-menu/icon-menu.test.tsx`
- After Task 5: `pnpm --filter @notion-kit/ui test packages/ui/src/unsplash/unsplash.test.tsx`
- Final: `pnpm --filter @notion-kit/ui typecheck`, `pnpm --filter @notion-kit/ui test`, `pnpm --filter @notion-kit/ui build`

---

### Task 1: Extend Autocomplete Primitive for Grid Rendering

**Files:**
- Modify: `packages/ui/src/primitives/autocomplete.tsx`

- [ ] **Step 1: Add imports for the Base UI filtered-items hook**

Change the import at the top of `packages/ui/src/primitives/autocomplete.tsx` to include the named hook:

```tsx
import {
  Autocomplete as AutocompletePrimitive,
  useFilteredItems,
} from "@base-ui/react/autocomplete";
```

- [ ] **Step 2: Add `AutocompleteRow` wrapper**

Place this after `AutocompleteList` so list/grid wrappers stay grouped:

```tsx
function AutocompleteRow({
  className,
  ...props
}: AutocompletePrimitive.Row.Props) {
  return (
    <AutocompletePrimitive.Row
      data-slot="autocomplete-row"
      className={cn("flex", className)}
      {...props}
    />
  );
}
```

- [ ] **Step 3: Add local hook wrapper**

Place this near the other primitive exports:

```tsx
function useAutocompleteFilteredItems<ItemValue>() {
  return useFilteredItems<ItemValue>();
}
```

- [ ] **Step 4: Export the row and hook**

Update the export block:

```tsx
export {
  Autocomplete,
  AutocompleteClear,
  AutocompleteCollection,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteInput,
  AutocompleteInputGroup,
  AutocompleteItem,
  AutocompleteLabel,
  AutocompleteList,
  AutocompleteRow,
  AutocompleteSeparator,
  AutocompleteStatus,
  AutocompleteTrigger,
  useAutocompleteFilteredItems,
};
```

Add the row prop type to the type export block:

```tsx
export type {
  AutocompleteContentProps,
  AutocompleteInputProps,
  AutocompleteItemProps,
  AutocompleteLabelProps,
  AutocompleteRootProps,
};
```

No extra type export is required unless a later task needs a public `AutocompleteRowProps` alias.

- [ ] **Step 5: Verify primitive type compatibility**

Run:

```bash
pnpm --filter @notion-kit/ui typecheck
```

Expected: typecheck passes. If TypeScript reports that `AutocompletePrimitive.Row.Props` is unavailable, import the exported type from `@base-ui/react/autocomplete` instead:

```tsx
import type { AutocompleteRowProps } from "@base-ui/react/autocomplete";

function AutocompleteRow({ className, ...props }: AutocompleteRowProps) {
  return (
    <AutocompletePrimitive.Row
      data-slot="autocomplete-row"
      className={cn("flex", className)}
      {...props}
    />
  );
}
```

---

### Task 2: Add Icon Menu Test Coverage for Base UI Filtering Behavior

**Files:**
- Modify: `packages/ui/src/icon-menu/icon-menu.test.tsx`
- Modify: `packages/ui/src/__tests__/component-objects/icon-menu.tsx`

- [ ] **Step 1: Add result helper methods to the component object**

Append these methods to `IconMenuObject`:

```tsx
  iconButton(name: string) {
    return screen.getByRole("option", { name });
  }

  queryIconButton(name: string) {
    return screen.queryByRole("option", { name });
  }
```

If the current implementation still renders icon buttons as `button`, this helper will fail before migration. That failure is expected for the new autocomplete behavior.

- [ ] **Step 2: Add keyword-search and tab-reset tests**

Append these tests to `packages/ui/src/icon-menu/icon-menu.test.tsx`:

```tsx
  it("IconMenu_SearchByKeyword_ShowsMatchingIcon", async () => {
    const menu = IconMenuObject.render({ onSelect: vi.fn() });
    await menu.open();
    await menu.selectTab("Icons");

    await menu.search("favorite");

    expect(menu.iconButton("Star")).toBeInTheDocument();
  });

  it("IconMenu_TabChanged_ClearsSearchInput", async () => {
    const menu = IconMenuObject.render({ onSelect: vi.fn() });
    await menu.open();
    await menu.selectTab("Icons");
    await menu.search("heart");

    await menu.selectTab("Emojis");

    expect(menu.searchInput()).toHaveValue("");
  });
```

- [ ] **Step 3: Run icon-menu tests and confirm expected failure**

Run:

```bash
pnpm --filter @notion-kit/ui test packages/ui/src/icon-menu/icon-menu.test.tsx
```

Expected before implementation: at least the new role-based helper test fails because icon grid items are not autocomplete options yet, or keyword behavior still depends on old rendering. Existing tests should continue to document current behavior.

---

### Task 3: Migrate Icon Menu to Autocomplete Grid With Virtualized Filtered Items

**Files:**
- Modify: `packages/ui/src/icon-menu/_components/types.ts`
- Modify: `packages/ui/src/icon-menu/_components/menu-search-bar.tsx`
- Modify: `packages/ui/src/icon-menu/_components/virtualized-icon-grid.tsx`
- Modify: `packages/ui/src/icon-menu/icon-menu.tsx`
- Modify: `packages/ui/src/icon-menu/icon-menu.test.tsx`
- Modify: `packages/ui/src/__tests__/component-objects/icon-menu.tsx`

- [ ] **Step 1: Add shared icon autocomplete item type**

Add this to `packages/ui/src/icon-menu/_components/types.ts`:

```tsx
import type { IconItem } from "../factories";

export interface IconAutocompleteItem {
  id: string;
  sectionId: string;
  sectionLabel: string;
  item: IconItem;
}
```

If `types.ts` already contains exports, keep this type alongside them.

- [ ] **Step 2: Replace standalone input in `MenuSearchBar`**

Update imports in `packages/ui/src/icon-menu/_components/menu-search-bar.tsx`:

```tsx
import {
  AutocompleteInput,
  Button,
  TooltipPreset,
  TooltipProvider,
} from "@/primitives";
```

Change props so the search bar no longer receives controlled input state:

```tsx
interface MenuSearchBarProps {
  onRandomSelect: () => void;
  Palette: React.ReactNode;
}
```

Replace the input block with:

```tsx
<AutocompleteInput
  search
  clear
  onKeyDown={(e) => e.stopPropagation()}
  placeholder="Filter..."
  classNames={{ wrapper: "flex-1 p-0" }}
/>
```

Keep the surrounding toolbar, random button, tooltip, and palette exactly as they are.

- [ ] **Step 3: Build flattened item arrays in `icon-menu.tsx`**

Import autocomplete primitives and the shared item type:

```tsx
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteList,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/primitives";

import type { IconAutocompleteItem } from "./_components";
```

Inside the `visibleFactories.map((factory) => (` render path, derive items before returning content:

```tsx
const autocompleteItems = factory.sections.flatMap((section) =>
  section.iconIds.map((iconId) => ({
    id: iconId,
    sectionId: section.id,
    sectionLabel: section.label,
    item: factory.getItem(iconId),
  })),
);
```

Use the items in an inline grid autocomplete:

```tsx
<Autocomplete<IconAutocompleteItem>
  grid
  inline
  open
  autoHighlight="always"
  openOnInputClick
  items={autocompleteItems}
  value={searchQuery}
  onValueChange={(value, details) => {
    if (details.reason !== "item-press") {
      setSearchQuery(value);
    }
  }}
  itemToStringValue={({ item }) =>
    [item.name, ...item.keywords].filter(Boolean).join(" ")
  }
>
  <MenuSearchBar
    onRandomSelect={handleRandomSelect}
    Palette={factory.toolbar}
  />
  {factory.isLoading ? (
    <Spinner className="mx-1 my-2 fill-icon" />
  ) : (
    <AutocompleteContent variant="inline">
      <AutocompleteEmpty>No results</AutocompleteEmpty>
      <AutocompleteList className="max-h-none overflow-visible">
        <VirtualizedIconGrid
          factory={factory}
          onSelect={(data) => onSelect?.(data)}
        />
      </AutocompleteList>
    </AutocompleteContent>
  )}
</Autocomplete>
```

Keep the existing tab reset:

```tsx
onValueChange={(value) => {
  setActiveTab(value);
  setSearchQuery("");
}}
```

- [ ] **Step 4: Rework virtualized grid rows from filtered items**

Update imports in `virtualized-icon-grid.tsx`:

```tsx
import {
  AutocompleteItem,
  AutocompleteRow,
  ScrollArea,
  TooltipPreset,
  TooltipProvider,
  useAutocompleteFilteredItems,
} from "@/primitives";

import type { IconAutocompleteItem } from "./types";
```

Change props:

```tsx
interface VirtualizedIconGridProps {
  factory: IconFactoryResult;
  onSelect: (iconData: IconData) => void;
}
```

Build rows from filtered items:

```tsx
const filteredItems = useAutocompleteFilteredItems<IconAutocompleteItem>();

const rows = useMemo((): VirtualRow[] => {
  if (filteredItems.length === 0) {
    return [{ type: "header", label: "No results", id: "empty" }];
  }

  const sectionMap = new Map<
    string,
    { label: string; items: IconAutocompleteItem[] }
  >();

  for (const filteredItem of filteredItems) {
    const section = sectionMap.get(filteredItem.sectionId);
    if (section) {
      section.items.push(filteredItem);
    } else {
      sectionMap.set(filteredItem.sectionId, {
        label: filteredItem.sectionLabel,
        items: [filteredItem],
      });
    }
  }

  return Array.from(sectionMap.entries()).flatMap(([sectionId, section]) => [
    { type: "header" as const, label: section.label, id: sectionId },
    ...chunk(section.items, ICONS_PER_ROW).map((items, i) => ({
      type: "row" as const,
      id: `${sectionId}-${i}`,
      items,
    })),
  ]);
}, [filteredItems]);
```

Update `VirtualRow`:

```tsx
type VirtualRow =
  | { type: "header"; id: string; label: string }
  | { type: "row"; id: string; items: IconAutocompleteItem[] };
```

Render icon rows with Base UI row and item parts:

```tsx
<AutocompleteRow className="flex">
  {item.items.map((iconItem) => {
    const filteredIndex = filteredItems.findIndex(
      (filteredItem) => filteredItem.id === iconItem.id,
    );

    return (
      <TooltipPreset
        key={iconItem.id}
        side="top"
        description={iconItem.item.name}
        className="z-1000"
      >
        <AutocompleteItem
          value={iconItem}
          index={filteredIndex}
          label={iconItem.item.name}
          className="size-8 justify-center p-0 text-2xl/none"
          onClick={() => handleIconClick(iconItem.item)}
        >
          {factory.renderIcon(iconItem.item, {})}
        </AutocompleteItem>
      </TooltipPreset>
    );
  })}
</AutocompleteRow>
```

The exact class list may need `variant="hint"` if `AutocompleteItem` keeps the `MenuItem` render wrapper. Preserve the visual result of the old `Button variant="hint" className="size-8 text-2xl/none"` grid.

- [ ] **Step 5: Remove UI usage of `factory.search`**

Run:

```bash
rg "factory\\.search|searchQuery" packages/ui/src/icon-menu
```

Expected after implementation: `factory.search` is not referenced from `icon-menu.tsx` or `_components/virtualized-icon-grid.tsx`. `searchQuery` may remain in `icon-menu.tsx` as controlled Autocomplete input state.

- [ ] **Step 6: Run icon-menu tests**

Run:

```bash
pnpm --filter @notion-kit/ui test packages/ui/src/icon-menu/icon-menu.test.tsx
```

Expected: all icon-menu tests pass. If accessible names differ for icon results, adjust the test helper to query the actual `option` name produced by `AutocompleteItem label={...}`.

---

### Task 4: Add Unsplash Autocomplete Grid Tests

**Files:**
- Add: `packages/ui/src/unsplash/unsplash.test.tsx`

- [ ] **Step 1: Mock the hook and define fixture images**

Create `packages/ui/src/unsplash/unsplash.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent, {
  PointerEventsCheckLevel,
} from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Unsplash } from "./unsplash";
import { useUnsplash } from "./use-unsplash";

vi.mock("./use-unsplash", () => ({
  useUnsplash: vi.fn(),
}));

const mockUseUnsplash = vi.mocked(useUnsplash);
const setQuery = vi.fn();

const images = [
  {
    id: "image-1",
    user: { name: "Ada", portfolio_url: "https://example.com/ada" },
    links: { html: "https://images.example.com/1" },
    urls: {
      thumb: "https://images.example.com/1-thumb.jpg",
      full: "https://images.example.com/1-full.jpg",
      regular: "https://images.example.com/1-regular.jpg",
      small: "https://images.example.com/1-small.jpg",
    },
    description: "Mountain lake",
  },
  {
    id: "image-2",
    user: { name: "Grace", portfolio_url: "https://example.com/grace" },
    links: { html: "https://images.example.com/2" },
    urls: {
      thumb: "https://images.example.com/2-thumb.jpg",
      full: "https://images.example.com/2-full.jpg",
      regular: "https://images.example.com/2-regular.jpg",
      small: "https://images.example.com/2-small.jpg",
    },
    description: undefined,
  },
];
```

- [ ] **Step 2: Add setup and rendering tests**

Append:

```tsx
describe("Unsplash", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUnsplash.mockReturnValue({
      images,
      isLoading: false,
      query: "mountain",
      setQuery,
    });
  });

  it("Unsplash_SearchTyped_UpdatesRemoteQuery", async () => {
    const user = userEvent.setup({
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });
    render(<Unsplash apiKey="test-key" />);

    await user.type(screen.getByRole("searchbox"), "s");

    expect(setQuery).toHaveBeenCalledWith("mountains");
  });

  it("Unsplash_Loaded_RendersImageGridOptions", () => {
    render(<Unsplash apiKey="test-key" />);

    expect(screen.getByRole("option", { name: "Mountain lake" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Unsplash image by Grace" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Add selection tests**

Append:

```tsx
  it("Unsplash_ImageClicked_CallsOnSelect", async () => {
    const user = userEvent.setup({
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });
    const onSelect = vi.fn();
    render(<Unsplash apiKey="test-key" onSelect={onSelect} />);

    await user.click(screen.getByRole("option", { name: "Mountain lake" }));

    expect(onSelect).toHaveBeenCalledWith(
      "https://images.example.com/1-regular.jpg",
    );
  });

  it("Unsplash_KeyboardSelection_CallsOnSelect", async () => {
    const user = userEvent.setup({
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });
    const onSelect = vi.fn();
    render(<Unsplash apiKey="test-key" onSelect={onSelect} />);

    screen.getByRole("searchbox").focus();
    await user.keyboard("{ArrowDown}{Enter}");

    expect(onSelect).toHaveBeenCalledWith(
      "https://images.example.com/1-regular.jpg",
    );
  });
```

- [ ] **Step 4: Run Unsplash tests and confirm expected failure**

Run:

```bash
pnpm --filter @notion-kit/ui test packages/ui/src/unsplash/unsplash.test.tsx
```

Expected before implementation: tests fail because current Unsplash tiles are `button` roles, not autocomplete `option` roles, and keyboard selection is not wired to the autocomplete grid.

---

### Task 5: Migrate Unsplash to Autocomplete Grid While Keeping Remote Search

**Files:**
- Modify: `packages/ui/src/unsplash/unsplash.tsx`
- Modify: `packages/ui/src/unsplash/unsplash.test.tsx`

- [ ] **Step 1: Import autocomplete primitives**

Update imports in `packages/ui/src/unsplash/unsplash.tsx`:

```tsx
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompleteRow,
  Spinner,
  useAutocompleteFilteredItems,
} from "@/primitives";
```

Remove the standalone `Input` import.

- [ ] **Step 2: Add local image item helpers**

Add this near the component:

```tsx
type UnsplashImage = NonNullable<ReturnType<typeof useUnsplash>["images"]>[number];

function getImageLabel(image: UnsplashImage) {
  return image.description ?? `Unsplash image by ${image.user.name}`;
}

function getImageSearchValue(image: UnsplashImage, query: string) {
  return [query, image.description, image.user.name].filter(Boolean).join(" ");
}

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}
```

- [ ] **Step 3: Add an image grid component that renders filtered items**

Add this below the helpers:

```tsx
function UnsplashImageGrid({
  onSelect,
}: Pick<UnsplashProps, "onSelect">) {
  const filteredImages = useAutocompleteFilteredItems<UnsplashImage>();
  const rows = chunk(filteredImages, 4);

  return (
    <div className="grid w-full grid-cols-4">
      {rows.map((row, rowIndex) => (
        <AutocompleteRow key={row.map((image) => image.id).join("-")} className="contents">
          {row.map((image, columnIndex) => {
            const index = rowIndex * 4 + columnIndex;

            return (
              <AutocompleteItem
                key={image.id}
                value={image}
                index={index}
                label={getImageLabel(image)}
                className="aspect-video block h-auto cursor-pointer p-[3px] select-none"
                onClick={() => onSelect?.(image.urls.regular)}
              >
                <img
                  src={image.urls.small}
                  alt={image.description ?? "unsplash"}
                  className="h-16 w-full rounded-sm object-cover object-center hover:opacity-75"
                  referrerPolicy="same-origin"
                />
                <div className="mt-0.5 mb-1 w-full truncate text-xs text-muted">
                  by{" "}
                  <a
                    href={image.user.portfolio_url}
                    className="text-muted underline hover:text-red"
                    target="_blank"
                    rel="noreferrer noopener"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {image.user.name}
                  </a>
                </div>
              </AutocompleteItem>
            );
          })}
        </AutocompleteRow>
      ))}
    </div>
  );
}
```

If `AutocompleteRow className="contents"` does not preserve Base UI keyboard grid inference, use a visual row layout instead:

```tsx
<div className="flex w-full flex-col">
  {rows.map((row) => (
    <AutocompleteRow className="grid w-full grid-cols-4">
      {row.map((image) => (
        <AutocompleteItem />
      ))}
    </AutocompleteRow>
  ))}
</div>
```

Keep the item classes and thumbnail/attribution markup from the first snippet.

- [ ] **Step 4: Wrap the UI in controlled Autocomplete**

Replace the component return with:

```tsx
return (
  <Autocomplete<UnsplashImage>
    grid
    inline
    open
    autoHighlight="always"
    openOnInputClick
    items={images ?? []}
    value={query}
    onValueChange={(value, details) => {
      if (details.reason !== "item-press") {
        setQuery(value);
      }
    }}
    itemToStringValue={(image) => getImageSearchValue(image, query)}
  >
    <div className={cn("max-h-[280px] w-full overflow-y-auto p-4", className)}>
      <div className="flex">
        <AutocompleteInput
          id="unsplash"
          clear
          placeholder="Search for an image..."
          classNames={{ wrapper: "flex-1 p-0" }}
        />
      </div>
      <div className="mx-0 mt-4 flex items-center justify-center">
        {isLoading || !images ? (
          <Spinner className="fill-icon" />
        ) : images.length > 0 ? (
          <AutocompleteContent variant="inline">
            <AutocompleteEmpty>No result found.</AutocompleteEmpty>
            <AutocompleteList className="max-h-none overflow-visible">
              <UnsplashImageGrid onSelect={onSelect} />
            </AutocompleteList>
          </AutocompleteContent>
        ) : (
          <p>No result found.</p>
        )}
      </div>
    </div>
  </Autocomplete>
);
```

- [ ] **Step 5: Ensure valid remote results are not hidden by sparse metadata**

Run the Unsplash tests:

```bash
pnpm --filter @notion-kit/ui test packages/ui/src/unsplash/unsplash.test.tsx
```

Expected: tests pass, including the fixture with `description: undefined`.

---

### Task 6: Final Verification and Cleanup

**Files:**
- Read/check only unless previous tasks require small fixes.

- [ ] **Step 1: Confirm no forbidden icon-menu UI filtering remains**

Run:

```bash
rg "factory\\.search|filter=|useFilter|filteredItems|\\.filter\\(" packages/ui/src/icon-menu packages/ui/src/unsplash
```

Expected:

- No `factory.search` reference in `packages/ui/src/icon-menu/icon-menu.tsx`.
- No `factory.search` reference in `packages/ui/src/icon-menu/_components/virtualized-icon-grid.tsx`.
- No custom `filter` or `useFilter` prop added to migrated autocomplete roots.
- `.filter(Boolean)` in string assembly is acceptable.
- Existing factory implementation files may still contain their own `search` methods.

- [ ] **Step 2: Run package typecheck**

Run:

```bash
pnpm --filter @notion-kit/ui typecheck
```

Expected: passes.

- [ ] **Step 3: Run package tests**

Run:

```bash
pnpm --filter @notion-kit/ui test
```

Expected: passes.

- [ ] **Step 4: Run package build**

Run:

```bash
pnpm --filter @notion-kit/ui build
```

Expected: passes.

- [ ] **Step 5: Review changed files**

Run:

```bash
git diff -- packages/ui/src/primitives/autocomplete.tsx packages/ui/src/icon-menu packages/ui/src/unsplash specs/autocomplete-grid-migration.md docs/superpowers/plans/2026-07-06-autocomplete-grid-migration.md
```

Expected:

- The primitive only adds row and filtered-items support.
- `icon-menu` UI no longer calls factory search for filtering.
- `unsplash` still updates remote query through `setQuery`.
- Existing public props remain unchanged.

## Self-Review

- Spec coverage:
  - P0 default autocomplete filtering is covered by Tasks 1, 3, 5, and Task 6 grep checks.
  - P1 grid item style preservation is covered by Tasks 3 and 5 class preservation.
  - P2 primitive style preservation is covered by Task 1's small wrapper-only primitive change.
  - Unsplash remote search is covered by Tasks 4 and 5.
  - Icon-menu virtualization is covered by Task 3.
- Placeholder scan:
  - The plan contains no `TBD` or empty implementation steps.
  - All code-changing steps include concrete code snippets or exact replacement shapes.
- Type consistency:
  - `IconAutocompleteItem` is introduced before use.
  - `AutocompleteRow`, `AutocompleteItem`, and `useAutocompleteFilteredItems` names match Task 1 exports.
  - `UnsplashImage` derives from `useUnsplash`, so tests and component stay aligned with hook return shape.
